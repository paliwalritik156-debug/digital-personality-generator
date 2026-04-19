const mongoose = require('mongoose');

const ResultSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sessionId: { type: String, required: true, unique: true },
  scores: {
    openness: { type: Number, min: 0, max: 100 },
    conscientiousness: { type: Number, min: 0, max: 100 },
    extraversion: { type: Number, min: 0, max: 100 },
    agreeableness: { type: Number, min: 0, max: 100 },
    neuroticism: { type: Number, min: 0, max: 100 },
  },
  personalityType: { type: String },
  summary: { type: String },
  dominantTraits: { type: [String] },
  suggestions: { type: [String] },
  completedAt: { type: Date, default: Date.now },
}, { timestamps: true });

ResultSchema.index({ userId: 1, completedAt: -1 });
module.exports = mongoose.model('Result', ResultSchema);
