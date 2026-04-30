const express = require('express');
const router = express.Router();
const { submitAnswers, getResult, getHistory, downloadPDF, emailPDF, getGlobalStats } = require('../controllers/resultController');
const { protect } = require('../middleware/auth');

router.post('/submit', protect, submitAnswers);
router.get('/history', protect, getHistory);
router.get('/result/:sessionId', protect, getResult);
router.get('/result/:sessionId/pdf', protect, downloadPDF);
router.post('/result/:sessionId/email', protect, emailPDF);
router.get('/result/:sessionId/global-stats', protect, getGlobalStats);

module.exports = router;
