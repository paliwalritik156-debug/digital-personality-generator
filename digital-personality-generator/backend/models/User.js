const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: [true,'Name is required'], trim: true, minlength: 2, maxlength: 50 },
  email: { type: String, required: [true,'Email is required'], unique: true, lowercase: true, trim: true, match: [/^\S+@\S+\.\S+$/,'Valid email required'] },
  password: { type: String, minlength: 6, select: false }, // optional for Google users
  avatar: { type: String, default: null },
  googleId: { type: String, default: null },
  authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
  totalTests: { type: Number, default: 0 },
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  lastTestDate: { type: Date, default: null },
}, { timestamps: true });

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
