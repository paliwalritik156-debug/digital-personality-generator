const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const { Resend } = require('resend');

const generateToken = (userId) => jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

// In-memory OTP store (simple, no DB needed)
const otpStore = {};

const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
  const { name, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(409).json({ success: false, message: 'Email already registered.' });
    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);
    res.status(201).json({ success: true, message: 'Account created!', token, user: { id: user._id, name: user.name, email: user.email, totalTests: user.totalTests, createdAt: user.createdAt } });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
};

const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    const token = generateToken(user._id);
    res.json({ success: true, message: 'Login successful!', token, user: { id: user._id, name: user.name, email: user.email, totalTests: user.totalTests, createdAt: user.createdAt } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
};

const getMe = async (req, res) => {
  try {
    res.json({ success: true, user: { id: req.user._id, name: req.user.name, email: req.user.email, totalTests: req.user.totalTests, createdAt: req.user.createdAt } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'Email required.' });
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'No account found with this email.' });
    if (user.authProvider === 'google') return res.status(400).json({ success: false, message: 'This account uses Google login. No password to reset.' });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email] = { otp, expires: Date.now() + 10 * 60 * 1000 }; // 10 min expiry

    // Send OTP via Resend
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: 'PersonaIQ <onboarding@resend.dev>',
      to: email,
      subject: '🔐 Your PersonaIQ Password Reset OTP',
      html: `
        <div style="max-width:480px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;font-family:Arial,sans-serif;">
          <div style="background:linear-gradient(135deg,#1a1a2e,#2d2b55);padding:32px;text-align:center;">
            <h1 style="color:#fff;font-size:22px;margin:0;">Password Reset</h1>
            <p style="color:#8892b0;font-size:13px;margin:8px 0 0;">PersonaIQ Security</p>
          </div>
          <div style="padding:32px;">
            <p style="color:#333;font-size:15px;">Your OTP for password reset:</p>
            <div style="background:#f8f8fc;border:2px dashed #8B5CF6;border-radius:12px;padding:20px;text-align:center;margin:20px 0;">
              <span style="font-size:2.5rem;font-weight:800;letter-spacing:0.3em;color:#8B5CF6;">${otp}</span>
            </div>
            <p style="color:#888;font-size:13px;">This OTP expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
          </div>
        </div>`,
    });

    res.json({ success: true, message: 'OTP sent to your email.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Failed to send OTP. Try again.' });
  }
};

const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) return res.status(400).json({ success: false, message: 'All fields required.' });
  if (newPassword.length < 6) return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });

  const stored = otpStore[email];
  if (!stored) return res.status(400).json({ success: false, message: 'No OTP found. Request a new one.' });
  if (Date.now() > stored.expires) {
    delete otpStore[email];
    return res.status(400).json({ success: false, message: 'OTP expired. Request a new one.' });
  }
  if (stored.otp !== otp) return res.status(400).json({ success: false, message: 'Invalid OTP.' });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    user.password = newPassword;
    await user.save();
    delete otpStore[email];
    res.json({ success: true, message: 'Password reset successfully! Please login.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Failed to reset password.' });
  }
};

const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) return res.status(400).json({ success: false, message: 'All fields required.' });
  if (newPassword.length < 6) return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
  try {
    const user = await User.findById(req.user._id).select('+password');
    if (!user.password) return res.status(400).json({ success: false, message: 'Google account — no password to change.' });
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password changed successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to change password.' });
  }
};

module.exports = { register, login, getMe, forgotPassword, resetPassword, changePassword };
