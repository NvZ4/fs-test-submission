import { Router } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import User from '../models/user-model.js';
import { loginRequired } from './auth-middleware.js';

const authRouter = Router();

/**
 * @description Signs a JWT and sets it as an HTTP-Only cookie.
 * @param {object} res - The Express response object.
 * @param {object} user - The user object to be encoded in the token.
 */
const setUserToken = (res, user) => {
  // Create a plain user object without the hashed password
  const plainUser = {
    _id: user._id,
    email: user.email,
    name: user.name,
  };

  // Sign the JWT
  const token = jwt.sign(plainUser, process.env.JWT_SECRET_KEY, { expiresIn: '1d' }); //

  // Set the token in an HTTP-Only cookie for security
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    sameSite: 'strict', // Mitigates CSRF attacks
  });
};

// --- Authentication Routes ---

// POST /auth/register
// Route for new user registration.
authRouter.post('/register', async (req, res, next) => {
  const { name, email, password } = req.body;

  // Basic validation
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required.' });
  }

  try {
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const newUser = new User({
      name,
      email,
      password, // The password will be hashed by the pre-save hook in user-model.js
    });

    await newUser.save();
    res.status(201).json({ message: 'Account created successfully. Please log in.' });

  } catch (error) {
    next(error);
  }
});


// POST /auth/login
// Route for local email & password login.
authRouter.post('/login', (req, res, next) => {
  passport.authenticate('local', { session: false }, (err, user, info) => {
    // Jika ada error server (misal, koneksi DB putus)
    if (err) {
      return next(err);
    }
    // Jika otentikasi gagal (user tidak ditemukan atau password salah)
    if (!user) {
      // 'info.message' akan berisi pesan dari strategi passport kita
      return res.status(401).json({ message: info.message || 'Login failed.' });
    }
    // Jika otentikasi berhasil
    setUserToken(res, user);
    // Hapus password dari objek user sebelum mengirim respons
    const { password, ...userWithoutPassword } = user.toObject();
    return res.status(200).json({ user: userWithoutPassword });
  })(req, res, next);
});

// GET /auth/google
// The route that initiates the Google OAuth 2.0 login flow.
authRouter.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] })); //

// GET /auth/google/callback
// Google redirects to this URL after the user has authenticated.
authRouter.get('/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: '/login', // Redirect to login page on failure
  }),
  (req, res) => {
    // On successful authentication, `req.user` will contain the user object.
    setUserToken(res, req.user);
    // Redirect to the frontend application
    res.redirect('/posts'); // Or your frontend's main/dashboard page
  }
);

authRouter.get('/me', loginRequired, (req, res) => {
  // The loginRequired middleware already attached the user to req.user
  res.status(200).json(req.user);
});

// POST /auth/logout
// Route for logging the user out.
authRouter.post('/logout', (req, res) => {
  res.cookie('token', null, {
    httpOnly: true,
    maxAge: 0, //
  });
  res.status(200).json({ message: 'Logout successful' });
});

export default authRouter;