const { Resend } = require('resend');
const PDFDocument = require('pdfkit');

const generatePDFBuffer = (result, user) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4', bufferPages: true });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const PAGE_WIDTH = 512;
    const LEFT = 50;

    const traitColors = {
      openness: '#a855f7',
      conscientiousness: '#00d4aa',
      extraversion: '#f5c842',
      agreeableness: '#ff6b6b',
      neuroticism: '#4fc3f7',
    };
    const traitLabels = {
      openness: 'Openness',
      conscientiousness: 'Conscientiousness',
      extraversion: 'Extraversion',
      agreeableness: 'Agreeableness',
      neuroticism: 'Neuroticism',
    };

    // Header
    doc.rect(0, 0, 612, 110).fill('#1a1a2e');
    doc.fillColor('#ffffff').fontSize(26).font('Helvetica-Bold')
      .text('Digital Personality Report', LEFT, 30, { align: 'center', width: PAGE_WIDTH });
    doc.fontSize(11).font('Helvetica')
      .text('Powered by the Big Five (OCEAN) Model', LEFT, 68, { align: 'center', width: PAGE_WIDTH });

    // User info - start below header
    doc.fillColor('#1a1a2e').fontSize(12).font('Helvetica-Bold').text(`Name: ${user.name}`, LEFT, 130);
    doc.fillColor('#555').fontSize(10).font('Helvetica').text(`Email: ${user.email}`, LEFT);
    doc.text(`Date: ${new Date(result.completedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, LEFT);

    // Personality type
    doc.moveDown(1);
    doc.fillColor('#1a1a2e').fontSize(14).font('Helvetica-Bold').text('Personality Type:', LEFT);
    const cleanType = (result.personalityType || 'Balanced').replace(/[^\x00-\x7F]/g, '').trim() || 'Balanced';
    doc.fillColor('#7c5cfc').fontSize(13).font('Helvetica').text(cleanType, LEFT);

    // Trait scores
    doc.moveDown(1);
    doc.fillColor('#1a1a2e').fontSize(14).font('Helvetica-Bold').text('Trait Scores', LEFT);
    doc.moveDown(0.4);

    const BAR_X = 180;
    const BAR_W = 270;
    const SCORE_X = BAR_X + BAR_W + 10;

    Object.entries(result.scores).forEach(([trait, score]) => {
      const s = typeof score === 'object' ? score.score : (score || 0);
      const y = doc.y;

      doc.fillColor('#333').fontSize(10).font('Helvetica-Bold')
        .text(traitLabels[trait] || trait, LEFT, y, { width: 125, lineBreak: false });

      doc.rect(BAR_X, y + 3, BAR_W, 9).fill('#e8e8e8');

      const filled = Math.max(0, Math.round((s / 100) * BAR_W));
      if (filled > 0) doc.rect(BAR_X, y + 3, filled, 9).fill(traitColors[trait] || '#888');

      doc.fillColor(traitColors[trait] || '#333').fontSize(10).font('Helvetica-Bold')
        .text(`${s}%`, SCORE_X, y, { width: 35, align: 'right', lineBreak: false });

      doc.moveDown(1.2);
    });

    // Summary
    doc.moveDown(0.5);
    doc.fillColor('#1a1a2e').fontSize(14).font('Helvetica-Bold')
      .text('Personality Summary', LEFT, doc.y, { width: PAGE_WIDTH });
    doc.moveDown(0.3);
    doc.fillColor('#333').fontSize(10).font('Helvetica')
      .text(result.summary || '', LEFT, doc.y, { width: PAGE_WIDTH, lineGap: 4 });

    // Suggestions
    doc.moveDown(1);
    doc.fillColor('#1a1a2e').fontSize(14).font('Helvetica-Bold')
      .text('Personalized Suggestions', LEFT, doc.y, { width: PAGE_WIDTH });
    doc.moveDown(0.3);

    const suggestions = (result.suggestions && result.suggestions.length > 0)
      ? result.suggestions
      : ['Explore new experiences weekly.', 'Build consistent daily routines.', 'Leverage your strengths in your career.'];

    suggestions.forEach((s, i) => {
      doc.fillColor('#333').fontSize(10).font('Helvetica')
        .text(`${i + 1}.  ${s}`, LEFT, doc.y, { width: PAGE_WIDTH, lineGap: 3 });
      doc.moveDown(0.4);
    });

    // Footer
    doc.moveDown(1.5);
    doc.fillColor('#aaa').fontSize(8).font('Helvetica')
      .text('This report is based on the Big Five Personality Model (OCEAN). Results are for self-reflection purposes only.',
        LEFT, doc.y, { align: 'center', width: PAGE_WIDTH });

    doc.end();
  });
};

const sendReportEmail = async (toEmail, userName, result, user) => {
  const resend = new Resend(process.env.RESEND_API_KEY);

  const pdfBuffer = await generatePDFBuffer(result, user);

  const traitColors = { openness: '#a855f7', conscientiousness: '#00d4aa', extraversion: '#f5c842', agreeableness: '#ff6b6b', neuroticism: '#4fc3f7' };
  const traitLabels = { openness: 'Openness', conscientiousness: 'Conscientiousness', extraversion: 'Extraversion', agreeableness: 'Agreeableness', neuroticism: 'Neuroticism' };

  const traitRows = Object.entries(result.scores).map(([trait, score]) => {
    const s = typeof score === 'object' ? score.score : score;
    return `
      <tr>
        <td style="padding:8px 12px;font-size:14px;color:#333;">${traitLabels[trait]}</td>
        <td style="padding:8px 12px;">
          <div style="background:#eee;border-radius:10px;height:10px;width:200px;">
            <div style="background:${traitColors[trait]};width:${s}%;height:10px;border-radius:10px;"></div>
          </div>
        </td>
        <td style="padding:8px 12px;font-weight:bold;color:${traitColors[trait]};font-size:14px;">${s}%</td>
      </tr>`;
  }).join('');

  const htmlBody = `
  <!DOCTYPE html>
  <html>
  <head><meta charset="UTF-8"/></head>
  <body style="margin:0;padding:0;background:#f4f4f8;font-family:'Helvetica Neue',Arial,sans-serif;">
    <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.1);">
      <div style="background:linear-gradient(135deg,#1a1a2e,#2d2b55);padding:40px 32px;text-align:center;">
        <h1 style="color:#ffffff;font-size:24px;margin:0 0 8px;">Your Personality Report</h1>
        <p style="color:#8892b0;font-size:14px;margin:0;">Big Five OCEAN Model Assessment</p>
      </div>
      <div style="padding:32px 32px 0;">
        <h2 style="color:#1a1a2e;font-size:20px;margin:0 0 8px;">Hey ${userName}!</h2>
        <p style="color:#555;font-size:15px;line-height:1.6;margin:0;">Your personality assessment is complete. Your full PDF report is attached below.</p>
      </div>
      <div style="padding:24px 32px;">
        <div style="background:linear-gradient(135deg,#7c5cfc,#00d4aa);border-radius:12px;padding:20px;text-align:center;">
          <p style="color:rgba(255,255,255,0.8);font-size:12px;text-transform:uppercase;letter-spacing:2px;margin:0 0 8px;">Your Personality Type</p>
          <h2 style="color:#ffffff;font-size:22px;margin:0;">${result.personalityType}</h2>
        </div>
      </div>
      <div style="padding:0 32px 24px;">
        <h3 style="color:#1a1a2e;font-size:16px;margin:0 0 16px;text-transform:uppercase;letter-spacing:1px;">Trait Scores</h3>
        <table style="width:100%;border-collapse:collapse;">${traitRows}</table>
      </div>
      <div style="padding:0 32px 24px;">
        <h3 style="color:#1a1a2e;font-size:16px;margin:0 0 12px;text-transform:uppercase;letter-spacing:1px;">Summary</h3>
        <p style="color:#555;font-size:14px;line-height:1.8;background:#f8f8fc;border-left:3px solid #7c5cfc;padding:16px;border-radius:0 8px 8px 0;margin:0;">${result.summary}</p>
      </div>
      <div style="padding:0 32px 32px;text-align:center;">
        <p style="color:#888;font-size:13px;margin:0 0 16px;">Your full PDF report is attached to this email.</p>
        <a href="https://digital-personality-generator.onrender.com" style="display:inline-block;background:linear-gradient(135deg,#7c5cfc,#5b3fd1);color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:10px;font-size:15px;font-weight:bold;">Take Another Assessment</a>
      </div>
      <div style="background:#f8f8fc;padding:20px 32px;text-align:center;border-top:1px solid #eee;">
        <p style="color:#aaa;font-size:12px;margin:0;">PersonaIQ - Big Five OCEAN Assessment<br/>This report is for self-reflection purposes only.</p>
      </div>
    </div>
  </body>
  </html>`;

  await resend.emails.send({
    from: 'PersonaIQ <onboarding@resend.dev>',
    to: toEmail,
    subject: `Your Personality Report - ${result.personalityType}`,
    html: htmlBody,
    attachments: [
      {
        filename: `personality-report-${result.sessionId}.pdf`,
        content: pdfBuffer.toString('base64'),
      },
    ],
  });
};

module.exports = { sendReportEmail };
