import { Router } from 'express';
// Impor model User dari file index utama model
import { User } from '../models/index.js';
import { loginRequired } from '../auth/auth-middleware.js';

const userRouter = Router();

// --- Rute Publik ---

/**
 * @route   GET /users/:id
 * @desc    Mendapatkan profil pengguna berdasarkan ID.
 * @access  Public
 */
userRouter.get('/:id', async (req, res, next) => {
  try {
    // Ganti User.findById().select() dengan User.findByPk() dan opsi attributes
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] } // Kecualikan field password dari hasil query
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
});


// --- Rute Terproteksi ---

/**
 * @route   PUT /users/me
 * @desc    Memperbarui profil pengguna yang sedang login (nama atau password).
 * @access  Private (membutuhkan login)
 */
userRouter.put('/me', loginRequired, async (req, res, next) => {
  try {
    // Dapatkan ID pengguna dari req.user
    const userId = req.user.id;
    const { name, password } = req.body;

    // Cari pengguna di database menggunakan Primary Key
    const userToUpdate = await User.findByPk(userId);

    if (!userToUpdate) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Perbarui nama jika ada di dalam request body
    if (name) {
      userToUpdate.name = name;
    }

    // Perbarui password jika ada di dalam request body
    // Hook 'beforeUpdate' di model akan secara otomatis meng-hash password baru ini
    if (password) {
      userToUpdate.password = password;
    }

    // Simpan perubahan ke database
    await userToUpdate.save();

    // Kirim kembali data pengguna yang sudah diperbarui (tanpa password)
    const { password: _, ...userResponse } = userToUpdate.get({ plain: true });

    res.status(200).json(userResponse);

  } catch (error) {
    next(error);
  }
});


export default userRouter;