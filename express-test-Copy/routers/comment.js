import { Router } from "express";
import Comment from "../models/comments-model.js";
import Post from "../models/posts-model.js";
import { loginRequired } from '../auth/auth-middleware.js'; // 1. Import the authentication middleware

// Use mergeParams to access postId from the parent router (post.js)
const router = Router({ mergeParams: true });

// --- Public Route ---

// GET all comments for a specific post
router.get('/', async (req, res) => {
    const { postId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;

    try {
        const totalComments = await Comment.countDocuments({ postId: postId });
        const totalPages = Math.ceil(totalComments / limit);

        const comments = await Comment.find({ postId: postId })
            .populate('author', 'name') // 2. Populate the author's name
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        res.json({
            comments,
            totalPages,
            currentPage: page,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// --- Protected Routes ---

// POST a new comment for a specific post
router.post('/', loginRequired, async (req, res) => { // 3. Protect the route
    const { postId } = req.params;
    const { content } = req.body;

    if (!content) {
        return res.status(400).json({ message: 'Comment content is required' });
    }

    try {
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // 4. Create the comment and associate it with the post and author
        const newComment = await Comment.create({
            content: content,
            postId: postId,
            author: req.user._id // Get user ID from the authenticated user
        });

        // Add the new comment's ID to the post's comments array
        post.comments.push(newComment._id);
        await post.save();

        // Populate author for the response
        await newComment.populate('author', 'name');

        res.status(201).json(newComment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// PUT /:commentId - Update a comment
router.put('/:commentId', loginRequired, async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;

    if (!content) {
        return res.status(400).json({ message: 'Comment content is required' });
    }

    try {
        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found." });
        }

        // 5. Authorization Check: Ensure the user owns the comment
        if (comment.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Forbidden: You cannot edit this comment." });
        }

        comment.content = content;
        await comment.save();

        await comment.populate('author', 'name');
        res.status(200).json(comment);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// DELETE /:commentId - Delete a comment
router.delete('/:commentId', loginRequired, async (req, res) => {
    const { postId, commentId } = req.params;

    try {
        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found." });
        }

        // 6. Authorization Check: Ensure the user owns the comment
        if (comment.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Forbidden: You cannot delete this comment." });
        }

        // Remove the comment
        await Comment.findByIdAndDelete(commentId);

        // Also remove the comment's ID from the parent post's array
        await Post.findByIdAndUpdate(postId, {
            $pull: { comments: commentId }
        });

        res.status(200).json({ message: 'Comment deleted successfully' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


export default router;