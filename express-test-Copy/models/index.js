import User from './user-model.js';
import Post from './posts-model.js';
import Comment from './comments-model.js';

// ---- DEFINISI RELASI ----

// Relasi 1: User ke Post (Satu User bisa punya banyak Post)
User.hasMany(Post, { foreignKey: 'authorId', onDelete: 'CASCADE' });
Post.belongsTo(User, { as: 'author', foreignKey: 'authorId' });

// Relasi 2: User ke Comment (Satu User bisa punya banyak Comment)
User.hasMany(Comment, { foreignKey: 'authorId', onDelete: 'CASCADE' });
Comment.belongsTo(User, { as: 'author', foreignKey: 'authorId' });

// Relasi 3: Post ke Comment (Satu Post bisa punya banyak Comment)
Post.hasMany(Comment, { foreignKey: 'postId', onDelete: 'CASCADE' });
Comment.belongsTo(Post, { foreignKey: 'postId' });

// Ekspor semua model yang sudah terhubung untuk digunakan di bagian lain aplikasi
export { User, Post, Comment };