const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: [true,'Name is required'], trim: true, minlength: 2, maxlength: 50 },
  email: { type: String, required: [true,'Email is required'], unique: true, lowercase: true, trim: true, match: [/^\S+@\S+\.\S+$/,'Valid email required'] },
  password: { type: String, required: [true,'Password required'], minlength: 6, select: false },
  avatar: { type: String, default: null },
  totalTests: { type: Number, default: 0 },
}, { timestamps: true });

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
