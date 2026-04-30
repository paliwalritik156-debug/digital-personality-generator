const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const name = profile.displayName;
        const avatar = profile.photos?.[0]?.value || null;
        const googleId = profile.id;

        // Check if user exists
        let user = await User.findOne({ email });

        if (user) {
          // Update googleId if not set
          if (!user.googleId) {
            user.googleId = googleId;
            user.authProvider = 'google';
            if (avatar) user.avatar = avatar;
            await user.save();
          }
        } else {
          // Create new user
          user = await User.create({
            name,
            email,
            avatar,
            googleId,
            authProvider: 'google',
          });
        }

        const token = generateToken(user._id);
        return done(null, { token, user });
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

module.exports = passport;
