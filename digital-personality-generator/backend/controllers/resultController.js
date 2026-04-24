const PDFDocument = require('pdfkit');
const Answer = require('../models/Answer');
const Result = require('../models/Result');
const Question = require('../models/Question');
const User = require('../models/User');
const { processPersonalityResults } = require('../../utils/scoringEngine');

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
    doc.fontSize(14).font('Helvetica').fillColor('#7c5cfc').text((result.personalityType||'').replace(/[^\w\s]/g,'').trim());
    doc.moveDown(1);
    doc.fillColor('#1a1a2e').fontSize(16).font('Helvetica-Bold').text('Trait Scores');
    doc.moveDown(0.5);
    const traitColors = { openness:'#a855f7', conscientiousness:'#00d4aa', extraversion:'#f5c842', agreeableness:'#ff6b6b', neuroticism:'#4fc3f7' };
    const traitLabels = { openness:'Openness', conscientiousness:'Conscientiousness', extraversion:'Extraversion', agreeableness:'Agreeableness', neuroticism:'Neuroticism' };
    Object.entries(result.scores).forEach(([trait, score]) => {
      const s = typeof score === 'object' ? score.score : score;
      const rowY = doc.y;
      doc.fillColor('#333').fontSize(10).font('Helvetica-Bold').text(`${traitLabels[trait]}`, 50, rowY, {width:120});
      const barX = 175;
      const barW = 280;
      const filledW = Math.round((s / 100) * barW);
      doc.rect(barX, rowY + 2, barW, 10).fill('#e0e0e0');
      doc.rect(barX, rowY + 2, filledW, 10).fill(traitColors[trait] || '#666');
      doc.fillColor(traitColors[trait] || '#333').fontSize(10).font('Helvetica').text(`${s}%`, barX + barW + 8, rowY);
      doc.moveDown(1.5);
    });
    doc.moveDown(1);
    doc.text('', 50, doc.y);doc.fillColor('#1a1a2e').fontSize(16).font('Helvetica-Bold').text('Personality Summary', 50, doc.y, {width:490});
    doc.moveDown(0.5);
    doc.text('', 50, doc.y);doc.fillColor('#333').fontSize(11).font('Helvetica').text(result.summary, 50, doc.y, { lineGap: 6, width: 490 });
    doc.moveDown(1.5);
    doc.text('', 50, doc.y);doc.fillColor('#1a1a2e').fontSize(16).font('Helvetica-Bold').text('Personalized Suggestions', 50, doc.y, {width:490});
    doc.moveDown(0.5);
    result.suggestions.forEach((s, i) => {
      doc.text('', 50, doc.y);doc.fillColor('#333').fontSize(11).font('Helvetica').text(`${i+1}. ${s}`, { lineGap: 4, width: 512 });
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

module.exports = { submitAnswers, getResult, getHistory, downloadPDF };
