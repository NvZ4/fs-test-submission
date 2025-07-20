import { Router } from 'express';
import User from '../models/user-model.js';
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
    // Cari pengguna berdasarkan ID dan hilangkan password dari hasilnya
    const user = await User.findById(req.params.id).select('-password');

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
    // Dapatkan ID pengguna dari token JWT yang sudah diverifikasi oleh middleware
    const userId = req.user._id;
    const { name, password } = req.body;

    // Cari pengguna di database
    const userToUpdate = await User.findById(userId);

    if (!userToUpdate) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Perbarui nama jika ada di dalam request body
    if (name) {
      userToUpdate.name = name;
    }

    // Perbarui password jika ada di dalam request body
    // Middleware pre-save di user-model akan secara otomatis meng-hash password ini
    if (password) {
      userToUpdate.password = password;
    }

    // Simpan perubahan ke database
    const updatedUser = await userToUpdate.save();

    // Kirim kembali data pengguna yang sudah diperbarui (tanpa password)
    const userResponse = {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
    };

    res.status(200).json(userResponse);

  } catch (error) {
    next(error);
  }
});


export default userRouter;