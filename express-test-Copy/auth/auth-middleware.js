import passport from 'passport';

/**
 * @description Middleware to protect routes that require authentication.
 * It uses the 'jwt' strategy from passport.js to verify the token.
 */
export const loginRequired = (req, res, next) => {
  // Authenticate using the JWT strategy
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    // If an error occurred during authentication (e.g., malformed token)
    if (err) {
      return next(err);
    }

    // If no user was found (e.g., token is invalid, expired, or not present)
    if (!user) {
      // You can check the 'info' object for details like 'TokenExpiredError'
      // or 'JsonWebTokenError' for more specific error messages if needed.
      return res.status(401).json({ message: 'Authentication required. Please log in.' });
    }

    // If authentication is successful, attach the user object to the request
    req.user = user;

    // Proceed to the next middleware or route handler
    next();
  })(req, res, next); // This invokes the middleware function
};