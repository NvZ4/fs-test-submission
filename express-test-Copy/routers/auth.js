import { Router } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import User from '../models/user-model.js';

const router = Router();

// Retrieve the secret key from environment variables with a fallback
const JWT_SECRET = process.env.JWT_SECRET_KEY || 'default-secret-for-development';

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user with email and password
 * @access  Public
 */
router.post('/register', async (req, res, next) => {
    const { email, name, password } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'A user with this email already exists.' });
        }
        const newUser = new User({ email, name, password, provider: 'local' });
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully.' });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/auth/login
 * @desc    Login user with email and password, returns a JWT in a cookie
 * @access  Public
 */
router.post('/login', passport.authenticate('local', { session: false }), (req, res) => {
    // If this handler is called, authentication was successful.
    const userPayload = { _id: req.user._id, email: req.user.email, name: req.user.name };
    const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '1d' });

    // Send the token as an httpOnly cookie for security. [cite: 95]
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        sameSite: 'strict',
    });

    res.json({ message: 'Logged in successfully', user: userPayload });
});

/**
 * @route   GET /api/auth/google
 * @desc    Initiate Google OAuth 2.0 authentication
 * @access  Public
 */
// [cite: 350, 352]
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

/**
 * @route   GET /api/auth/google/callback
 * @desc    Google OAuth 2.0 callback URL
 * @access  Public
 */
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login', session: false }), (req, res) => {
    // This handler is called after Google successfully authenticates the user. [cite: 360, 361]
    const userPayload = { _id: req.user._id, email: req.user.email, name: req.user.name };
    const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '1d' });

    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
    });

    // Redirect the user back to your frontend application's homepage.
    res.redirect(process.env.FRONTEND_URL || 'http://localhost:5173');
});

/**
 * @route   GET /api/auth/logout
 * @desc    Logout user by clearing the JWT cookie
 * @access  Public
 */
router.get('/logout', (req, res) => {
    // To log out, clear the token cookie. [cite: 167]
    res.cookie('token', '', {
        httpOnly: true,
        expires: new Date(0), // Set the expiration date to the past to delete it. [cite: 169]
    });
    res.status(200).json({ message: 'Logged out successfully' });
});

export default router;