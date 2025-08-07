import { Sequelize } from 'sequelize';
import 'dotenv/config';

// Inisialisasi koneksi Sequelize dengan nama database "random-post"
const sequelize = new Sequelize(
  'random-post', // Nama database
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false, // Set ke `console.log` untuk melihat query SQL saat development
  }
);

export default sequelize;