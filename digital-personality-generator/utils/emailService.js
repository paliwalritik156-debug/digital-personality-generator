const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // TLS
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
  });
};

const generatePDFBuffer = (result, user) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

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
    doc.rect(0, 0, 612, 120).fill('#1a1a2e');
    doc.fillColor('#ffffff').fontSize(28).font('Helvetica-Bold')
      .text('Digital Personality Report', 50, 35, { align: 'center' });
    doc.fontSize(12).font('Helvetica')
      .text('Powered by the Big Five (OCEAN) Model', 50, 72, { align: 'center' });

    doc.moveDown(3);

    // User info
    doc.fillColor('#1a1a2e').fontSize(14).font('Helvetica-Bold').text(`Name: ${user.name}`);
    doc.fontSize(11).font('Helvetica').fillColor('#555').text(`Email: ${user.email}`);
    doc.text(`Date: ${new Date(result.completedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`);

    doc.moveDown(1);

    // Personality type
    doc.fillColor('#1a1a2e').fontSize(16).font('Helvetica-Bold').text('Personality Type:');
    doc.fontSize(14).font('Helvetica').fillColor('#7c5cfc').text(result.personalityType);

    doc.moveDown(1);

    // Trait scores
    doc.fillColor('#1a1a2e').fontSize(16).font('Helvetica-Bold').text('Trait Scores');
    doc.moveDown(0.5);

    Object.entries(result.scores).forEach(([trait, score]) => {
      doc.fillColor('#333').fontSize(11).font('Helvetica-Bold').text(`${traitLabels[trait]}: `, { continued: true });
      doc.fillColor(traitColors[trait] || '#666').font('Helvetica').text(`${score}%`);
      const barWidth = Math.round((score / 100) * 350);
      doc.rect(50, doc.y, 350, 10).fill('#e0e0e0');
      doc.rect(50, doc.y - 10, barWidth, 10).fill(traitColors[trait] || '#666');
      doc.moveDown(1);
    });

    doc.moveDown(1);

    // Summary
    doc.fillColor('#1a1a2e').fontSize(16).font('Helvetica-Bold').text('Personality Summary');
    doc.moveDown(0.5);
    doc.fillColor('#333').fontSize(11).font('Helvetica').text(result.summary, { lineGap: 6, width: 512 });

    doc.moveDown(1.5);

    // Suggestions
    doc.fillColor('#1a1a2e').fontSize(16).font('Helvetica-Bold').text('Personalized Suggestions');
    doc.moveDown(0.5);
    result.suggestions.forEach((s, i) => {
      doc.fillColor('#333').fontSize(11).font('Helvetica').text(`${i + 1}. ${s}`, { lineGap: 4, width: 512 });
      doc.moveDown(0.5);
    });

    doc.moveDown(2);

    // Footer
    doc.fillColor('#999').fontSize(9).font('Helvetica')
      .text('This report is based on the Big Five Personality Model (OCEAN). Results are for self-reflection purposes only.', { align: 'center', width: 512 });

    doc.end();
  });
};

const sendReportEmail = async (toEmail, userName, result, user) => {
  const transporter = createTransporter();

  const pdfBuffer = await generatePDFBuffer(result, user);

  const traitRows = Object.entries(result.scores)
    .map(([trait, score]) => {
      const colors = { openness: '#a855f7', conscientiousness: '#00d4aa', extraversion: '#f5c842', agreeableness: '#ff6b6b', neuroticism: '#4fc3f7' };
      const labels = { openness: 'Openness', conscientiousness: 'Conscientiousness', extraversion: 'Extraversion', agreeableness: 'Agreeableness', neuroticism: 'Neuroticism' };
      return `
        <tr>
          <td style="padding:8px 12px;font-size:14px;color:#333;text-transform:capitalize;">${labels[trait]}</td>
          <td style="padding:8px 12px;">
            <div style="background:#eee;border-radius:10px;height:10px;width:200px;">
              <div style="background:${colors[trait]};width:${score}%;height:10px;border-radius:10px;"></div>
            </div>
          </td>
          <td style="padding:8px 12px;font-weight:bold;color:${colors[trait]};font-size:14px;">${score}%</td>
        </tr>`;
    }).join('');

  const htmlBody = `
  <!DOCTYPE html>
  <html>
  <head><meta charset="UTF-8"/></head>
  <body style="margin:0;padding:0;background:#f4f4f8;font-family:'Helvetica Neue',Arial,sans-serif;">
    <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.1);">
      
      <!-- Header -->
      <div style="background:linear-gradient(135deg,#1a1a2e,#2d2b55);padding:40px 32px;text-align:center;">
        <div style="font-size:32px;margin-bottom:8px;">✦</div>
        <h1 style="color:#ffffff;font-size:24px;margin:0 0 8px;">Your Personality Report</h1>
        <p style="color:#8892b0;font-size:14px;margin:0;">Big Five OCEAN Model Assessment</p>
      </div>

      <!-- Greeting -->
      <div style="padding:32px 32px 0;">
        <h2 style="color:#1a1a2e;font-size:20px;margin:0 0 8px;">Hey ${userName}! 👋</h2>
        <p style="color:#555;font-size:15px;line-height:1.6;margin:0;">
          Your personality assessment is complete. Here's a quick look at your results — your full PDF report is attached below.
        </p>
      </div>

      <!-- Personality Type Badge -->
      <div style="padding:24px 32px;">
        <div style="background:linear-gradient(135deg,#7c5cfc,#00d4aa);border-radius:12px;padding:20px;text-align:center;">
          <p style="color:rgba(255,255,255,0.8);font-size:12px;text-transform:uppercase;letter-spacing:2px;margin:0 0 8px;">Your Personality Type</p>
          <h2 style="color:#ffffff;font-size:22px;margin:0;">${result.personalityType}</h2>
        </div>
      </div>

      <!-- Trait Scores -->
      <div style="padding:0 32px 24px;">
        <h3 style="color:#1a1a2e;font-size:16px;margin:0 0 16px;text-transform:uppercase;letter-spacing:1px;">Trait Scores</h3>
        <table style="width:100%;border-collapse:collapse;">
          ${traitRows}
        </table>
      </div>

      <!-- Summary -->
      <div style="padding:0 32px 24px;">
        <h3 style="color:#1a1a2e;font-size:16px;margin:0 0 12px;text-transform:uppercase;letter-spacing:1px;">📝 Summary</h3>
        <p style="color:#555;font-size:14px;line-height:1.8;background:#f8f8fc;border-left:3px solid #7c5cfc;padding:16px;border-radius:0 8px 8px 0;margin:0;">
          ${result.summary}
        </p>
      </div>

      <!-- CTA -->
      <div style="padding:0 32px 32px;text-align:center;">
        <p style="color:#888;font-size:13px;margin:0 0 16px;">Your full PDF report is attached to this email.</p>
        <a href="https://digital-personality-generator.onrender.com" 
           style="display:inline-block;background:linear-gradient(135deg,#7c5cfc,#5b3fd1);color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:10px;font-size:15px;font-weight:bold;">
          Take Another Assessment →
        </a>
      </div>

      <!-- Footer -->
      <div style="background:#f8f8fc;padding:20px 32px;text-align:center;border-top:1px solid #eee;">
        <p style="color:#aaa;font-size:12px;margin:0;">
          PersonalityLab · Big Five OCEAN Assessment<br/>
          This report is for self-reflection purposes only.
        </p>
      </div>

    </div>
  </body>
  </html>`;

  await transporter.sendMail({
    from: `"PersonalityLab" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `🧬 Your Personality Report — ${result.personalityType}`,
    html: htmlBody,
    attachments: [
      {
        filename: `personality-report-${result.sessionId}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
      },
    ],
  });
};

module.exports = { sendReportEmail };
