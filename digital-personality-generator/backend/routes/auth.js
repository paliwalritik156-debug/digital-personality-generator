const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { register, login, getMe, forgotPassword, resetPassword, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const passport = require('../middleware/passport');

const registerValidation = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];
const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/me', protect, getMe);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/change-password', protect, changePassword);

// Google OAuth
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/?error=google_failed' }),
  (req, res) => {
    const { token, user } = req.user;
    // Redirect to frontend with token in URL
    const userData = encodeURIComponent(JSON.stringify({
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      totalTests: user.totalTests,
      createdAt: user.createdAt,
    }));
    res.redirect(`/?token=${token}&user=${userData}`);
  }
);

module.exports = router;
