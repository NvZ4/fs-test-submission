// Hapus baris 'import dotenv' dan 'dotenv.config()' dari sini
import 'dotenv/config';
import mongoose from 'mongoose';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import passport from 'passport';

import { localStrategy, jwtStrategy, googleStrategy } from './auth/passport.js';
import helloRouter from './hello.js';
import postRouter from './routers/post.js';
import authRouter from './auth/auth-router.js';
import userRouter from './routers/user.js'; // 1. Tambahkan impor untuk user router

const app = express();

// --- Middleware Setup ---

app.use(cors({
  origin: 'http://localhost:5173', // Pastikan ini sesuai dengan URL frontend Anda
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

// --- Passport Initialization ---

app.use(passport.initialize());
passport.use(localStrategy);
passport.use(jwtStrategy);
passport.use(googleStrategy);

// --- Database Connection ---

mongoose.connect('mongodb://localhost:27017/express-test')
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(3000, () => {
      console.log('✅ Server is running on port 3000');
    });
  })
  .catch(err => {
    console.error('❌ Failed to connect to MongoDB', err);
  });

// --- Route Setup ---

app.use('/auth', authRouter);
app.use('/hello', helloRouter);
app.use('/posts', postRouter);
app.use('/users', userRouter); // 2. Gunakan user router