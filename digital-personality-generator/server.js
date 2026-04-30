require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const passport = require('./backend/middleware/passport');
const { Resend } = require('resend');

const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
}).then(() => {
  console.log('✅ MongoDB Connected!');
}).catch((err) => {
  console.error('❌ MongoDB Error:', err.message);
});

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '1mb' })); // Reduced from 10mb
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(passport.initialize());

// Cache static files
app.use(express.static(path.join(__dirname, 'frontend'), {
  maxAge: '1d',
  etag: true,
}));

app.use('/api/auth', require('./backend/routes/auth'));
app.use('/api/questions', require('./backend/routes/questions'));
app.use('/api', require('./backend/routes/results'));

app.get('/api/health', (req, res) => res.json({ success: true, message: 'API running', uptime: process.uptime() }));

// Contact form — Resend initialized once outside handler
const resendClient = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) return res.status(400).json({ success: false, message: 'All fields required.' });
  // Basic input sanitization
  const safeName = String(name).slice(0, 100).replace(/[<>]/g, '');
  const safeEmail = String(email).slice(0, 200);
  const safeMessage = String(message).slice(0, 2000).replace(/[<>]/g, '');
  // Respond immediately
  res.json({ success: true, message: 'Message sent!' });
  // Send email in background
  if (resendClient) {
    resendClient.emails.send({
      from: 'PersonaIQ Contact <onboarding@resend.dev>',
      to: process.env.EMAIL_USER || 'paliwalritik156@gmail.com',
      subject: `📬 PersonaIQ Contact: ${safeName}`,
      html: `<div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:24px;background:#f8f8fc;border-radius:12px;">
        <h2 style="color:#1a1a2e;">New Contact Message</h2>
        <p><strong>Name:</strong> ${safeName}</p>
        <p><strong>Email:</strong> ${safeEmail}</p>
        <p><strong>Message:</strong></p>
        <div style="background:#fff;padding:16px;border-radius:8px;border-left:3px solid #8B5CF6;">${safeMessage}</div>
      </div>`,
    }).catch(err => console.error('Contact email error:', err.message));
  }
});

app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  res.status(500).json({ success: false, message: 'Internal server error.' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 Running on: http://localhost:${PORT}\n`);
});
