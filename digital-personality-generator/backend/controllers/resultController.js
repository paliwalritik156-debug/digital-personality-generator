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
    await User.findByIdAndUpdate(userId, { $inc: { totalTests: 1 } });
    res.status(201).json({ success: true, message: 'Test completed!', result: { id: result._id, sessionId: result.sessionId, scores: result.scores, personalityType: result.personalityType, dominantTraits: result.dominantTraits, summary: result.summary, suggestions: result.suggestions, completedAt: result.completedAt } });
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
    const results = await Result.find({ userId: req.user._id }).sort({ completedAt: -1 }).select('sessionId scores personalityType dominantTraits completedAt').limit(20);
    res.json({ success: true, count: results.length, results });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch history.' });
  }
};

const downloadPDF = async (req, res) => {
  try {
    const result = await Result.findOne({ sessionId: req.params.sessionId, userId: req.user._id });
    if (!result) return res.status(404).json({ success: false, message: 'Result not found.' });
    const user = req.user;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="personality-report-${result.sessionId}.pdf"`);
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    doc.pipe(res);
    doc.rect(0, 0, 612, 120).fill('#1a1a2e');
    doc.fillColor('#ffffff').fontSize(28).font('Helvetica-Bold').text('Digital Personality Report', 50, 35, { align: 'center' });
    doc.fontSize(12).font('Helvetica').text('Powered by the Big Five (OCEAN) Model', 50, 72, { align: 'center' });
    doc.moveDown(3);
    doc.fillColor('#1a1a2e').fontSize(14).font('Helvetica-Bold').text(`Name: ${user.name}`);
    doc.fontSize(11).font('Helvetica').fillColor('#555').text(`Email: ${user.email}`);
    doc.text(`Date: ${new Date(result.completedAt).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })}`);
    doc.moveDown(1);
    doc.fillColor('#1a1a2e').fontSize(16).font('Helvetica-Bold').text('Personality Type:');
    doc.fontSize(14).font('Helvetica').fillColor('#7c5cfc').text(result.personalityType);
    doc.moveDown(1);
    doc.fillColor('#1a1a2e').fontSize(16).font('Helvetica-Bold').text('Trait Scores');
    doc.moveDown(0.5);
    const traitColors = { openness:'#a855f7', conscientiousness:'#00d4aa', extraversion:'#f5c842', agreeableness:'#ff6b6b', neuroticism:'#4fc3f7' };
    const traitLabels = { openness:'Openness', conscientiousness:'Conscientiousness', extraversion:'Extraversion', agreeableness:'Agreeableness', neuroticism:'Neuroticism' };
    Object.entries(result.scores).forEach(([trait, score]) => {
      doc.fillColor('#333').fontSize(11).font('Helvetica-Bold').text(`${traitLabels[trait]}: `, { continued: true });
      doc.fillColor(traitColors[trait] || '#666').font('Helvetica').text(`${score}%`);
      const barWidth = Math.round((score / 100) * 350);
      doc.rect(50, doc.y, 350, 10).fill('#e0e0e0');
      doc.rect(50, doc.y - 10, barWidth, 10).fill(traitColors[trait] || '#666');
      doc.moveDown(1);
    });
    doc.moveDown(1);
    doc.fillColor('#1a1a2e').fontSize(16).font('Helvetica-Bold').text('Personality Summary');
    doc.moveDown(0.5);
    doc.fillColor('#333').fontSize(11).font('Helvetica').text(result.summary, { lineGap: 6, width: 512 });
    doc.moveDown(1.5);
    doc.fillColor('#1a1a2e').fontSize(16).font('Helvetica-Bold').text('Personalized Suggestions');
    doc.moveDown(0.5);
    result.suggestions.forEach((s, i) => {
      doc.fillColor('#333').fontSize(11).font('Helvetica').text(`${i+1}. ${s}`, { lineGap: 4, width: 512 });
      doc.moveDown(0.5);
    });
    doc.moveDown(2);
    doc.fillColor('#999').fontSize(9).font('Helvetica').text('This report is based on the Big Five Personality Model (OCEAN). Results are for self-reflection purposes only.', { align:'center', width:512 });
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

    await sendReportEmail(toEmail, user.name, result, user);

    res.json({ success: true, message: `Report sent to ${toEmail}` });
  } catch (error) {
    console.error('Email PDF error:', error);
    res.status(500).json({ success: false, message: 'Failed to send email. Please try again.' });
  }
};

module.exports = { submitAnswers, getResult, getHistory, downloadPDF, emailPDF };
