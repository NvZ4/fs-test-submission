import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import bcrypt from 'bcrypt';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true, // Bisa null jika login dengan Google
  },
  provider: {
    type: DataTypes.ENUM('local', 'google'),
    defaultValue: 'local',
    allowNull: false,
  },
  googleId: {
    type: DataTypes.STRING,
    unique: true,
  },
}, {
  timestamps: true, // Otomatis membuat kolom createdAt dan updatedAt
  hooks: {
    // Hash password sebelum user dibuat
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    // Hash password jika diubah
    beforeUpdate: async (user) => {
      if (user.changed('password') && user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

// Method untuk membandingkan password
User.prototype.comparePassword = function(candidatePassword) {
  // Memastikan ada password untuk dibandingkan (login Google)
  if (!this.password) return Promise.resolve(false);
  return bcrypt.compare(candidatePassword, this.password);
};

export default User;