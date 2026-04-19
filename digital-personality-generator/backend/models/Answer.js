const mongoose = require('mongoose');

const AnswerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sessionId: { type: String, required: true },
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
  trait: { type: String, required: true, enum: ['openness','conscientiousness','extraversion','agreeableness','neuroticism'] },
  value: { type: Number, required: true, min: 1, max: 5 },
  isReversed: { type: Boolean, default: false },
}, { timestamps: true });

AnswerSchema.index({ userId: 1, sessionId: 1 });
module.exports = mongoose.model('Answer', AnswerSchema);
