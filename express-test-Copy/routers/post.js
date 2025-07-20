import { Router } from "express";
import commentRouter from './comment.js';
import Post from '../models/posts-model.js';
import { loginRequired } from '../auth/auth-middleware.js'; // 1. Import the authentication middleware

const router = Router();

router.use('/:postId/comments', commentRouter);

// --- Public Routes ---

// GET all posts with pagination and author info
router.get('/', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;

    try {
        const totalPosts = await Post.countDocuments();
        const totalPages = Math.ceil(totalPosts / limit);

        const posts = await Post.find()
            .populate('author', 'name') // 2. Populate the author's name
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        res.json({
            posts,
            totalPages,
            currentPage: page,
            totalPosts
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get a single post by ID with author info
router.get('/:postId', async (req, res) => {
    try {
        const result = await Post.findById(req.params.postId)
                                 .populate('author', 'name'); // 3. Populate the author's name

        if (!result) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// --- Protected Routes ---

// Create a new post
router.post('/', loginRequired, async (req, res) => { // 4. Protect the route
    const { title, content } = req.body;
    if (!title || !content) {
        return res.status(400).json({ message: 'Title and content are required' });
    }
    try {
        // 5. Associate the post with the logged-in user
        const createPost = await Post.create({
          title,
          content,
          author: req.user._id // Get user ID from the authenticated user object
        });
        res.status(201).json(createPost);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update a post by ID
router.put('/:postId', loginRequired, async (req, res) => { // 6. Protect the route
    const { postId } = req.params;
    const { title, content } = req.body;

    if (!title || !content) {
        return res.status(400).json({ message: 'Title and content are required' });
    }

    try {
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // 7. Authorization Check: Ensure the user owns the post
        if (post.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Forbidden: You do not have permission to edit this post.' });
        }

        const updatedPost = await Post.findByIdAndUpdate(
            postId,
            { title, content },
            { new: true, runValidators: true }
        );

        res.json(updatedPost);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete a post by ID
router.delete('/:postId', loginRequired, async (req, res) => { // 8. Protect the route
    const { postId } = req.params;
    try {
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // 9. Authorization Check: Ensure the user owns the post
        if (post.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Forbidden: You do not have permission to delete this post.' });
        }

        await Post.findByIdAndDelete(postId);
        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;