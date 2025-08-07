import { Router } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
// Import model dari file index utama untuk mendapatkan model Sequelize
import { User } from '../models/index.js';

const router = Router();

// Retrieve the secret key from environment variables with a fallback
const JWT_SECRET = process.env.JWT_SECRET_KEY || 'default-secret-for-development';

/**
 * @route   POST /auth/register
 * @desc    Register a new user with email and password
 * @access  Public
 */
router.post('/register', async (req, res, next) => {
    const { email, name, password } = req.body;
    try {
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'A user with this email already exists.' });
        }
        // Password akan di-hash secara otomatis oleh hook di model User
        await User.create({ email, name, password, provider: 'local' });
        res.status(201).json({ message: 'User registered successfully.' });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /auth/login
 * @desc    Login user with email and password, returns a JWT in a cookie
 * @access  Public
 */
router.post('/login', (req, res, next) => {
    passport.authenticate('local', { session: false }, (err, user, info) => {
        if (err) return next(err);
        if (!user) return res.status(401).json({ message: info.message || 'Login failed' });

        // Authentication successful.
        const userPayload = { id: user.id, email: user.email, name: user.name };
        const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '1d' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
        });
        
        // Kirim data user tanpa password
        const { password, ...userWithoutPassword } = user.get({ plain: true });
        res.json({ message: 'Logged in successfully', user: userWithoutPassword });
    })(req, res, next);
});

/**
 * @route   GET /auth/google
 * @desc    Initiate Google OAuth 2.0 authentication
 * @access  Public
 */
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

/**
 * @route   GET /auth/google/callback
 * @desc    Google OAuth 2.0 callback URL
 * @access  Public
 */
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login', session: false }), (req, res) => {
    const userPayload = { id: req.user.id, email: req.user.email, name: req.user.name };
    const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '1d' });

    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
    });

    res.redirect(process.env.FRONTEND_URL || 'http://localhost:5173/posts');
});

/**
 * @route   POST /auth/logout
 * @desc    Logout user by clearing the JWT cookie
 * @access  Public
 */
router.post('/logout', (req, res) => {
    res.cookie('token', '', {
        httpOnly: true,
        expires: new Date(0),
    });
    res.status(200).json({ message: 'Logged out successfully' });
});

export default router;