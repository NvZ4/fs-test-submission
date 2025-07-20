// models/user-model.js
import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt';

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    name: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        // Password is not required if logging in via Google
        required: function() { return this.provider === 'local'; }
    },
    provider: {
        type: String,
        enum: ['local', 'google'],
        default: 'local',
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true, // Allows multiple null values, but unique if a value exists
    },
    passwordReset: {
        type: Boolean,
        default: false,
    }, 
}, {
    timestamps: true
});

// Hash password before saving for local users
UserSchema.pre('save', async function(next) {
    // Only hash the password if it has been modified (or is new) and provider is local
    if (this.provider !== 'local' || !this.isModified('password')) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

// Method to compare passwords
UserSchema.methods.comparePassword = function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', UserSchema);
export default User;