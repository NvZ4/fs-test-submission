import { Router } from "express";
import { User, Post, Comment } from '../models/index.js'; 
import { loginRequired } from '../auth/auth-middleware.js'; 

// Gunakan mergeParams agar bisa mengakses 'postId' dari router induk (post.js)
const router = Router({ mergeParams: true });

// --- Rute Publik ---

// GET: Mendapatkan semua komentar untuk sebuah post dengan paginasi
router.get('/', async (req, res) => {
    const { postId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;

    try {
        const { count, rows } = await Comment.findAndCountAll({
            where: { postId },
            limit,
            offset,
            include: [{
                model: User,
                as: 'author',
                attributes: ['id', 'name'] // Hanya sertakan ID dan nama penulis
            }],
            order: [['createdAt', 'DESC']] // Urutkan dari yang terbaru
        });

        res.json({
            comments: rows,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
        });
    } catch (error) {
        res.status(500).json({ message: "Gagal mengambil komentar: " + error.message });
    }
});

// --- Rute Terproteksi (Membutuhkan Login) ---

// POST: Membuat komentar baru untuk sebuah post
router.post('/', loginRequired, async (req, res) => {
    const { postId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
        return res.status(400).json({ message: 'Konten komentar tidak boleh kosong' });
    }

    try {
        // Pastikan post-nya ada
        const post = await Post.findByPk(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post tidak ditemukan' });
        }

        // Buat komentar baru
        const newComment = await Comment.create({
            content,
            postId: parseInt(postId, 10), // Pastikan postId adalah integer
            authorId: req.user.id // Ambil ID dari user yang sedang login
        });

        // Ambil kembali data komentar lengkap dengan info author untuk dikirim sebagai respons
        const commentWithAuthor = await Comment.findByPk(newComment.id, {
            include: [{ model: User, as: 'author', attributes: ['id', 'name'] }]
        });

        res.status(201).json(commentWithAuthor);
    } catch (error) {
        res.status(400).json({ message: "Gagal menambahkan komentar: " + error.message });
    }
});

// PUT: Memperbarui komentar
router.put('/:commentId', loginRequired, async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
        return res.status(400).json({ message: 'Konten komentar tidak boleh kosong' });
    }

    try {
        const comment = await Comment.findByPk(commentId);
        if (!comment) {
            return res.status(404).json({ message: "Komentar tidak ditemukan." });
        }

        // Otorisasi: Pastikan hanya pemilik komentar yang bisa mengedit
        if (comment.authorId !== req.user.id) {
            return res.status(403).json({ message: "Akses ditolak: Anda bukan pemilik komentar ini." });
        }

        // Update konten komentar
        comment.content = content;
        await comment.save();
        
        // Ambil data terbaru dengan author untuk respons
        const updatedComment = await Comment.findByPk(comment.id, {
             include: [{ model: User, as: 'author', attributes: ['id', 'name'] }]
        });

        res.status(200).json(updatedComment);
    } catch (error) {
        res.status(500).json({ message: "Gagal memperbarui komentar: " + error.message });
    }
});

// DELETE: Menghapus komentar
router.delete('/:commentId', loginRequired, async (req, res) => {
    const { commentId } = req.params;

    try {
        const comment = await Comment.findByPk(commentId);
        if (!comment) {
            return res.status(404).json({ message: "Komentar tidak ditemukan." });
        }

        // Otorisasi: Pastikan hanya pemilik komentar yang bisa menghapus
        if (comment.authorId !== req.user.id) {
            return res.status(403).json({ message: "Akses ditolak: Anda bukan pemilik komentar ini." });
        }

        // Hapus komentar dari database
        await comment.destroy();

        res.status(200).json({ message: 'Komentar berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ message: "Gagal menghapus komentar: " + error.message });
    }
});

export default router;