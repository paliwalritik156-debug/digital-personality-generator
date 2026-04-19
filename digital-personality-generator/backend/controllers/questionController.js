const Question = require('../models/Question');

const getQuestions = async (req, res) => {
  try {
    const questions = await Question.find({}).sort({ order: 1 }).select('-__v -createdAt -updatedAt');
    if (questions.length === 0) return res.status(404).json({ success: false, message: 'No questions found. Run: npm run seed' });
    res.json({ success: true, count: questions.length, questions });
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch questions.' });
  }
};

module.exports = { getQuestions };
