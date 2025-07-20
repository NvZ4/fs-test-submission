import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy } from 'passport-jwt';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

import User from '../models/user-model.js';

// --- Local Strategy (Email & Password) ---
// Used for handling the initial login request.
const localOptions = { usernameField: 'email' };

export const localStrategy = new LocalStrategy(localOptions, async (email, password, done) => {
  try {
    const user = await User.findOne({ email: email.toLowerCase() });

    // 1. Check if user exists
    if (!user) {
      return done(null, false, { message: 'Incorrect email or password.' });
    }

    // 2. Check if the user signed up using a provider like Google
    if (user.provider !== 'local') {
        return done(null, false, { message: `You previously signed in with ${user.provider}. Please use that method to log in.` });
    }

    // 3. Compare passwords
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return done(null, false, { message: 'Incorrect email or password.' });
    }

    return done(null, user);
  } catch (err) {
    return done(err);
  }
});

// --- JWT Strategy ---
// Used for authenticating subsequent requests by verifying the JWT.

// Function to extract the JWT from a request's cookies [cite: 131]
const cookieExtractor = (req) => {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies['token']; // Assumes the token is stored in a cookie named 'token' [cite: 133]
  }
  return token; // [cite: 134]
};

const jwtOptions = {
  jwtFromRequest: cookieExtractor, // [cite: 137]
  secretOrKey: process.env.JWT_SECRET_KEY, // Use the secret key from your .env file [cite: 136]
};

export const jwtStrategy = new JwtStrategy(jwtOptions, async (jwt_payload, done) => {
  try {
    // Cari pengguna berdasarkan ID dari payload token
    const user = await User.findById(jwt_payload._id);

    if (user) {
      // Jika pengguna ditemukan, lanjutkan
      return done(null, user);
    } else {
      // Jika pengguna tidak ditemukan (misalnya, sudah dihapus dari DB)
      return done(null, false);
    }
  } catch (error) {
    // Jika terjadi error (misal, koneksi DB error atau payload tidak valid)
    return done(error, false);
  }
});


// --- Google OAuth 2.0 Strategy ---
// Used for authenticating users via their Google account.
const googleOptions = {
  clientID: process.env.GOOGLE_CLIENT_ID, // [cite: 335]
  clientSecret: process.env.GOOGLE_CLIENT_SECRET, // [cite: 336]
 callbackURL: '/auth/google/callback', // [cite: 337]
};

export const googleStrategy = new GoogleStrategy(googleOptions, async (accessToken, refreshToken, profile, done) => {
    try {
        // Check if user already exists in our DB
        const existingUser = await User.findOne({ googleId: profile.id });

        if (existingUser) {
            return done(null, existingUser);
        }

        // Check if user exists by email, and if so, link the account
        const userByEmail = await User.findOne({ email: profile.emails[0].value });
        if (userByEmail) {
            userByEmail.googleId = profile.id;
            userByEmail.provider = 'google';
            await userByEmail.save();
            return done(null, userByEmail);
        }


        // If not, create a new user in our DB [cite: 340]
        const newUser = await new User({
            googleId: profile.id,
            email: profile.emails[0].value,
            name: profile.displayName,
            provider: 'google', // Mark this user as a Google-authenticated user
        }).save();

        done(null, newUser);
    } catch (err) {
        done(err, false);
    }
});