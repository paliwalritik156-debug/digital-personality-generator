const Question = require('../models/Question');

// Cache questions in memory — they never change
let _cachedQuestions = null;

const getQuestions = async (req, res) => {
  try {
    // Return cached questions if available
    if (_cachedQuestions) {
      return res.json({ success: true, count: _cachedQuestions.length, questions: _cachedQuestions });
    }
    const questions = await Question.find({})
      .sort({ order: 1 })
      .select('-__v -createdAt -updatedAt')
      .lean();
    if (questions.length === 0) {
      return res.status(404).json({ success: false, message: 'No questions found. Run: npm run seed' });
    }
    _cachedQuestions = questions; // Cache for future requests
    res.json({ success: true, count: questions.length, questions });
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch questions.' });
  }
};

module.exports = { getQuestions };
