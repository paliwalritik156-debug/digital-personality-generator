const PDFDocument = require('pdfkit');
const Answer = require('../models/Answer');
const Result = require('../models/Result');
const Question = require('../models/Question');
const User = require('../models/User');
const { processPersonalityResults } = require('../../utils/scoringEngine');
const { sendReportEmail } = require('../../utils/emailService');

const generateSessionId = () => Date.now().toString(36) + Math.random().toString(36).substr(2, 9);

const submitAnswers = async (req, res) => {
  const { answers } = req.body;
  const userId = req.user._id;
  if (!answers || !Array.isArray(answers) || answers.length === 0) return res.status(400).json({ success: false, message: 'No answers provided.' });
  try {
    const questionIds = answers.map((a) => a.questionId);
    const questions = await Question.find({ _id: { $in: questionIds } });
    if (questions.length === 0) return res.status(400).json({ success: false, message: 'Invalid question IDs.' });
    const questionMap = {};
    questions.forEach((q) => { questionMap[q._id.toString()] = q; });
    const enrichedAnswers = [];
    for (const answer of answers) {
      const question = questionMap[answer.questionId];
      if (!question) continue;
      if (answer.value < 1 || answer.value > 5) return res.status(400).json({ success: false, message: `Invalid value ${answer.value}. Must be 1-5.` });
      enrichedAnswers.push({ trait: question.trait, value: answer.value, isReversed: question.isReversed, questionId: question._id });
    }
    const sessionId = generateSessionId();
    const answerDocs = enrichedAnswers.map((a) => ({ userId, sessionId, questionId: a.questionId, trait: a.trait, value: a.value, isReversed: a.isReversed }));
    await Answer.insertMany(answerDocs);
    const { scores, personalityType, dominantTraits, summary, suggestions } = processPersonalityResults(enrichedAnswers);
    const result = await Result.create({ userId, sessionId, scores, personalityType, dominantTraits, summary, suggestions });

    // Update streak
    const user = await User.findById(userId);
    const today = new Date(); today.setHours(0,0,0,0);
    const lastTest = user.lastTestDate ? new Date(user.lastTestDate) : null;
    if (lastTest) { lastTest.setHours(0,0,0,0); }
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate()-1);
    let newStreak = 1;
    if (lastTest && lastTest.getTime() === yesterday.getTime()) {
      newStreak = (user.currentStreak || 0) + 1;
    } else if (lastTest && lastTest.getTime() === today.getTime()) {
      newStreak = user.currentStreak || 1; // same day, keep streak
    }
    const longestStreak = Math.max(newStreak, user.longestStreak || 0);
    await User.findByIdAndUpdate(userId, {
      $inc: { totalTests: 1 },
      currentStreak: newStreak,
      longestStreak,
      lastTestDate: new Date(),
    });

    res.status(201).json({ success: true, message: 'Test completed!', result: { id: result._id, sessionId: result.sessionId, scores: result.scores, personalityType: result.personalityType, dominantTraits: result.dominantTraits, summary: result.summary, suggestions: result.suggestions, completedAt: result.completedAt }, streak: { current: newStreak, longest: longestStreak } });
  } catch (error) {
    console.error('Submit error:', error);
    res.status(500).json({ success: false, message: 'Failed to process answers.' });
  }
};

const getResult = async (req, res) => {
  try {
    const result = await Result.findOne({ sessionId: req.params.sessionId, userId: req.user._id });
    if (!result) return res.status(404).json({ success: false, message: 'Result not found.' });
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch result.' });
  }
};

const getHistory = async (req, res) => {
  try {
    const results = await Result.find({ userId: req.user._id })
      .sort({ completedAt: -1 })
      .select('sessionId scores personalityType dominantTraits completedAt')
      .limit(20)
      .lean(); // Performance: returns plain JS objects
    res.json({ success: true, count: results.length, results });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch history.' });
  }
};

const getGlobalStats = async (req, res) => {
  try {
    const userResult = await Result.findOne({ sessionId: req.params.sessionId, userId: req.user._id });
    if (!userResult) return res.status(404).json({ success: false, message: 'Result not found.' });

    // Get all results for comparison (last 1000)
    const allResults = await Result.find({}).select('scores').limit(1000);
    if (allResults.length < 5) return res.json({ success: false, message: 'Not enough data yet.' });

    const traits = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'];
    const comparisons = {};

    traits.forEach(trait => {
      const userScore = typeof userResult.scores[trait] === 'object'
        ? userResult.scores[trait].score
        : userResult.scores[trait];

      const allScores = allResults.map(r => {
        const s = r.scores && r.scores[trait];
        return s ? (typeof s === 'object' ? s.score : s) : 0;
      }).filter(s => s > 0);

      const below = allScores.filter(s => s < userScore).length;
      const percentile = Math.round((below / allScores.length) * 100);
      comparisons[trait] = { userScore, percentile, total: allScores.length };
    });

    res.json({ success: true, comparisons, totalUsers: allResults.length });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get stats.' });
  }
};

const downloadPDF = async (req, res) => {
  try {
    const result = await Result.findOne({ sessionId: req.params.sessionId, userId: req.user._id });
    if (!result) return res.status(404).json({ success: false, message: 'Result not found.' });
    const user = req.user;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="personality-report-${result.sessionId}.pdf"`);

    const doc = new PDFDocument({ margin: 50, size: 'A4', bufferPages: true });
    doc.pipe(res);

    const PAGE_WIDTH = 512; // usable width (612 - 50*2)
    const LEFT = 50;

    // ── Header ──────────────────────────────────────────────
    doc.rect(0, 0, 612, 110).fill('#1a1a2e');
    doc.fillColor('#ffffff').fontSize(26).font('Helvetica-Bold')
      .text('Digital Personality Report', LEFT, 30, { align: 'center', width: PAGE_WIDTH });
    doc.fontSize(11).font('Helvetica')
      .text('Powered by the Big Five (OCEAN) Model', LEFT, 68, { align: 'center', width: PAGE_WIDTH });

    // ── User Info ────────────────────────────────────────────
    // Start well below header (header ends at 110px)
    doc.fillColor('#1a1a2e').fontSize(12).font('Helvetica-Bold').text(`Name: ${user.name}`, LEFT, 130);
    doc.fillColor('#555').fontSize(10).font('Helvetica').text(`Email: ${user.email}`, LEFT);
    doc.text(`Date: ${new Date(result.completedAt).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })}`, LEFT);

    // ── Personality Type ─────────────────────────────────────
    doc.moveDown(1);
    doc.fillColor('#1a1a2e').fontSize(14).font('Helvetica-Bold').text('Personality Type:', LEFT);
    // Strip emojis from personality type
    const cleanType = (result.personalityType || 'Balanced').replace(/[^\x00-\x7F]/g, '').trim() || 'Balanced';
    doc.fillColor('#7c5cfc').fontSize(13).font('Helvetica').text(cleanType, LEFT);

    // ── Trait Scores ─────────────────────────────────────────
    doc.moveDown(1);
    doc.fillColor('#1a1a2e').fontSize(14).font('Helvetica-Bold').text('Trait Scores', LEFT);
    doc.moveDown(0.4);

    const traitColors = { openness:'#a855f7', conscientiousness:'#00d4aa', extraversion:'#f5c842', agreeableness:'#ff6b6b', neuroticism:'#4fc3f7' };
    const traitLabels = { openness:'Openness', conscientiousness:'Conscientiousness', extraversion:'Extraversion', agreeableness:'Agreeableness', neuroticism:'Neuroticism' };
    const BAR_X = 180;
    const BAR_W = 270;
    const SCORE_X = BAR_X + BAR_W + 10;

    Object.entries(result.scores).forEach(([trait, score]) => {
      const s = typeof score === 'object' ? score.score : (score || 0);
      const y = doc.y;

      // Label
      doc.fillColor('#333').fontSize(10).font('Helvetica-Bold')
        .text(traitLabels[trait] || trait, LEFT, y, { width: 125, lineBreak: false });

      // Bar background
      doc.rect(BAR_X, y + 3, BAR_W, 9).fill('#e8e8e8');

      // Bar fill
      const filled = Math.max(0, Math.round((s / 100) * BAR_W));
      if (filled > 0) doc.rect(BAR_X, y + 3, filled, 9).fill(traitColors[trait] || '#888');

      // Score
      doc.fillColor(traitColors[trait] || '#333').fontSize(10).font('Helvetica-Bold')
        .text(`${s}%`, SCORE_X, y, { width: 35, align: 'right', lineBreak: false });

      // Next row
      doc.moveDown(1.2);
    });

    // ── Summary ──────────────────────────────────────────────
    doc.moveDown(0.5);
    doc.fillColor('#1a1a2e').fontSize(14).font('Helvetica-Bold').text('Personality Summary', LEFT, doc.y, { width: PAGE_WIDTH });
    doc.moveDown(0.3);
    doc.fillColor('#333').fontSize(10).font('Helvetica')
      .text(result.summary || '', LEFT, doc.y, { width: PAGE_WIDTH, lineGap: 4 });

    // ── Suggestions ──────────────────────────────────────────
    doc.moveDown(1);
    doc.fillColor('#1a1a2e').fontSize(14).font('Helvetica-Bold').text('Personalized Suggestions', LEFT, doc.y, { width: PAGE_WIDTH });
    doc.moveDown(0.3);

    const suggestions = (result.suggestions && result.suggestions.length > 0)
      ? result.suggestions
      : ['Explore new experiences weekly.', 'Build consistent daily routines.', 'Leverage your strengths in your career.'];

    suggestions.forEach((s, i) => {
      doc.fillColor('#333').fontSize(10).font('Helvetica')
        .text(`${i + 1}.  ${s}`, LEFT, doc.y, { width: PAGE_WIDTH, lineGap: 3 });
      doc.moveDown(0.4);
    });

    // ── Footer ───────────────────────────────────────────────
    doc.moveDown(1.5);
    doc.fillColor('#aaa').fontSize(8).font('Helvetica')
      .text('This report is based on the Big Five Personality Model (OCEAN). Results are for self-reflection purposes only.', LEFT, doc.y, { align: 'center', width: PAGE_WIDTH });

    doc.end();
  } catch (error) {
    console.error('PDF error:', error);
    if (!res.headersSent) res.status(500).json({ success: false, message: 'Failed to generate PDF.' });
  }
};

const emailPDF = async (req, res) => {
  try {
    const result = await Result.findOne({ sessionId: req.params.sessionId, userId: req.user._id });
    if (!result) return res.status(404).json({ success: false, message: 'Result not found.' });

    const user = req.user;
    const toEmail = req.body.email || user.email;

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(toEmail)) {
      return res.status(400).json({ success: false, message: 'Invalid email address.' });
    }

    // Respond immediately — send email in background
    res.json({ success: true, message: `Report sent to ${toEmail}` });

    // Send email after response (non-blocking)
    sendReportEmail(toEmail, user.name, result, user)
      .then(() => console.log(`✅ Email sent to ${toEmail}`))
      .catch(err => console.error(`❌ Email failed: ${err.message}`));

  } catch (error) {
    console.error('Email PDF error:', error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: 'Failed to send email. Please try again.' });
    }
  }
};

module.exports = { submitAnswers, getResult, getHistory, downloadPDF, emailPDF, getGlobalStats };
