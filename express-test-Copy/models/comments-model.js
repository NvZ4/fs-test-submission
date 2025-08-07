import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Comment = sequelize.define('Comment', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  }

}, {
  timestamps: true
});

export default Comment;