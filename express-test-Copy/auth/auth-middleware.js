import passport from 'passport';

export const loginRequired = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({ message: 'Authentication required. Please log in.' });
    }
    req.user = user;
    next();
  })(req, res, next);
};