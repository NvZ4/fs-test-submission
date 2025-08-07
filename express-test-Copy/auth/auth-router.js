import { Router } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import { loginRequired } from './auth-middleware.js';

const authRouter = Router();

const setUserToken = (res, user) => {
  // Ambil data user sebagai plain object dan gunakan 'id' bukan '_id'
  const plainUser = {
    id: user.id, // Ganti dari _id ke id
    email: user.email,
    name: user.name,
  };

  const token = jwt.sign(plainUser, process.env.JWT_SECRET_KEY, { expiresIn: '1d' });

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
};

// POST /auth/register
authRouter.post('/register', async (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required.' });
  }

  try {
    // Gunakan method 'findOne' dari Sequelize
    const existingUser = await User.findOne({ where: { email: email.toLowerCase() } });
    if (existingUser) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    // Gunakan 'create' untuk membuat dan menyimpan user baru
    // Hook 'beforeCreate' di model akan otomatis hash password
    await User.create({
      name,
      email,
      password,
    });

    res.status(201).json({ message: 'Account created successfully. Please log in.' });
  } catch (error) {
    // Tangani error validasi dari Sequelize
    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map(e => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    next(error);
  }
});

// POST /auth/login
authRouter.post('/login', (req, res, next) => {
  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ message: info.message || 'Login failed.' });

    setUserToken(res, user);
    // Sequelize instance bisa langsung di-destructure, tidak perlu .toObject()
    const { password, ...userWithoutPassword } = user.get({ plain: true });
    return res.status(200).json({ user: userWithoutPassword });
  })(req, res, next);
});

// GET /auth/me (Untuk mengecek status login)
authRouter.get('/me', loginRequired, (req, res) => {
  // Middleware sudah menaruh user di req.user
  // Kirim data user tanpa password
  const { password, ...userWithoutPassword } = req.user.get({ plain: true });
  res.status(200).json(userWithoutPassword);
});

authRouter.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

authRouter.get('/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: '/login',
  }),
  (req, res) => {
    setUserToken(res, req.user);
    res.redirect('http://localhost:5173/posts'); // Redirect ke URL frontend
  }
);

authRouter.post('/logout', (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: 'Logout successful' });
});


export default authRouter;