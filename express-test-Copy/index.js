import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import sequelize from './config/database.js';
import './models/index.js';

import { localStrategy, jwtStrategy, googleStrategy } from './auth/passport.js';

import helloRouter from './hello.js';
import postRouter from './routers/post.js';
import authRouter from './auth/auth-router.js';
import userRouter from './routers/user.js';

const app = express();

// --- Middleware Setup ---
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// --- Passport Initialization ---
app.use(passport.initialize());
passport.use(localStrategy);
passport.use(jwtStrategy);
passport.use(googleStrategy);

// --- Route Setup ---
app.use('/auth', authRouter);
app.use('/hello', helloRouter);
app.use('/posts', postRouter);
app.use('/users', userRouter);

// --- Fungsi untuk Menjalankan Server ---
const startServer = async () => {
  try {
    // 1. Uji koneksi ke database
    await sequelize.authenticate();
    console.log('✅ Koneksi ke database MySQL berhasil.');

    // 2. Sinkronisasi model dengan database
    //    'alter: true' akan mencoba mengubah tabel agar sesuai dengan model
    //    tanpa menghapus data yang ada. Cocok untuk development.
    await sequelize.sync({ alter: true });
    console.log('✅ Semua model berhasil disinkronkan.');

    // 3. Jalankan server Express setelah koneksi & sinkronisasi berhasil
    app.listen(3000, () => {
      console.log('🚀 Server berjalan di port 3000');
    });
  } catch (error) {
    console.error('❌ Gagal terhubung atau sinkronisasi dengan database:', error);
    process.exit(1); // Hentikan aplikasi jika koneksi database gagal
  }
};

// Panggil fungsi untuk menjalankan server
startServer();