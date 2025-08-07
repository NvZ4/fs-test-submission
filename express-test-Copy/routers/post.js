import { Router } from "express";
import { User, Post } from "../models/index.js";
import { loginRequired } from "../auth/auth-middleware.js";
import { Op } from "sequelize";
import commentRouter from "./comment.js"; 

const router = Router();

// --- Fungsi Helper untuk Generate Slug Unik ---
async function generateUniqueSlug(title, postId = null) {
  let slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
  let isUnique = false;
  let counter = 1;
  let tempSlug = slug;
  while (!isUnique) {
    const whereClause = { slug: tempSlug };
    if (postId) {
      whereClause.id = { [Op.ne]: postId };
    }
    const existingPost = await Post.findOne({ where: whereClause });
    if (!existingPost) {
      isUnique = true;
    } else {
      counter++;
      tempSlug = `${slug}-${counter}`;
    }
  }
  return tempSlug;
}

// --- Rute Publik ---

// GET semua post
router.get("/", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 9;
  const offset = (page - 1) * limit;
  try {
    const { count, rows } = await Post.findAndCountAll({
      limit,
      offset,
      include: [{ model: User, as: "author", attributes: ["id", "name"] }],
      order: [["createdAt", "DESC"]],
    });
    res.json({
      posts: rows,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalPosts: count,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET satu post berdasarkan SLUG (untuk halaman detail publik)
router.get("/slug/:slug", async (req, res) => {
  try {
    const post = await Post.findOne({
      where: { slug: req.params.slug },
      include: [{ model: User, as: "author", attributes: ["id", "name"] }],
    });
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET satu post berdasarkan ID 
router.get("/:postId", async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.postId, {
      include: [{ model: User, as: "author", attributes: ["id", "name"] }],
    });
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// --- Rute Terproteksi ---

// POST membuat post baru
router.post("/", loginRequired, async (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) {
    return res.status(400).json({ message: "Title and content are required" });
  }
  try {
    const slug = await generateUniqueSlug(title);
    const newPost = await Post.create({
      title,
      content,
      slug,
      authorId: req.user.id,
    });
    res.status(201).json(newPost);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT update post berdasarkan ID
router.put("/:postId", loginRequired, async (req, res) => {
  const { postId } = req.params;
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: "Title and content are required" });
  }

  try {
    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    console.log("--- DEBUGGING ADMIN EDIT ---");
    console.log("User attempting edit:", req.user.email);
    console.log("Admin email from .env:", process.env.ADMIN_EMAIL);
    const isAdmin = req.user.email === process.env.ADMIN_EMAIL;
    console.log("Is this user admin?", isAdmin);
    console.log("--------------------------");

    // --- LOGIKA OTORISASI BARU ---

    // Tolak akses HANYA JIKA user BUKAN pemilik DAN BUKAN admin
    if (post.authorId !== req.user.id && !isAdmin) {
      return res.status(403).json({
        message: "Forbidden: You do not have permission to edit this post.",
      });
    }

    let newSlug = post.slug;
    if (title !== post.title) {
      newSlug = await generateUniqueSlug(title, postId);
    }

    await post.update({ title, content, slug: newSlug });
    res.json(post);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE post berdasarkan ID
router.delete("/:postId", loginRequired, async (req, res) => {
  const { postId } = req.params;
  try {
    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // --- LOGIKA OTORISASI BARU ---
    const isAdmin = req.user.email === process.env.ADMIN_EMAIL;

    // Tolak akses HANYA JIKA user BUKAN pemilik DAN BUKAN admin
    if (post.authorId !== req.user.id && !isAdmin) {
      return res.status(403).json({
        message: "Forbidden: You do not have permission to delete this post.",
      });
    }

    await post.destroy();
    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Meneruskan rute ke comment router
router.use("/:postId/comments", commentRouter);

export default router;
