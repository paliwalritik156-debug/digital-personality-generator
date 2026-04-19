const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  text: { type: String, required: true, trim: true },
  trait: { type: String, required: true, enum: ['openness','conscientiousness','extraversion','agreeableness','neuroticism'] },
  isReversed: { type: Boolean, default: false },
  order: { type: Number, required: true },
  category: { type: String, trim: true },
}, { timestamps: true });

QuestionSchema.index({ trait: 1, order: 1 });
module.exports = mongoose.model('Question', QuestionSchema);
