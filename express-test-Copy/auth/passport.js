import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy } from 'passport-jwt';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from '../models/index.js';

// --- Local Strategy (Email & Password) ---
const localOptions = { usernameField: 'email' };

export const localStrategy = new LocalStrategy(localOptions, async (email, password, done) => {
  try {
    const user = await User.findOne({ where: { email: email.toLowerCase() } });

    if (!user) {
      return done(null, false, { message: 'Incorrect email or password.' });
    }

    if (user.provider !== 'local') {
      return done(null, false, { message: `You previously signed in with ${user.provider}. Please use that method to log in.` });
    }

    // Periksa kecocokan password
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
const cookieExtractor = (req) => {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies['token'];
  }
  return token;
};

const jwtOptions = {
  jwtFromRequest: cookieExtractor,
  secretOrKey: process.env.JWT_SECRET_KEY,
};

export const jwtStrategy = new JwtStrategy(jwtOptions, async (jwt_payload, done) => {
  try {
    // Ganti User.findById dengan User.findByPk (Primary Key)
    const user = await User.findByPk(jwt_payload.id);

    if (user) {
      return done(null, user);
    } else {
      return done(null, false);
    }
  } catch (error) {
    return done(error, false);
  }
});

// --- Google OAuth 2.0 Strategy ---
const googleOptions = {
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/auth/google/callback',
};

export const googleStrategy = new GoogleStrategy(googleOptions, async (accessToken, refreshToken, profile, done) => {
  try {
    // Cari user berdasarkan googleId
    const existingUser = await User.findOne({ where: { googleId: profile.id } });
    if (existingUser) {
      return done(null, existingUser);
    }

    // Cari berdasarkan email untuk menautkan akun
    const userByEmail = await User.findOne({ where: { email: profile.emails[0].value } });
    if (userByEmail) {
      userByEmail.googleId = profile.id;
      userByEmail.provider = 'google';
      await userByEmail.save(); // Simpan perubahan
      return done(null, userByEmail);
    }

    // Buat user baru jika tidak ada
    const newUser = await User.create({
      googleId: profile.id,
      email: profile.emails[0].value,
      name: profile.displayName,
      provider: 'google',
    });

    done(null, newUser);
  } catch (err) {
    done(err, false);
  }
});