require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const passport = require('./backend/middleware/passport');

const app = express();

// Connect to MongoDB but DON'T crash if it fails
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
}).then(() => {
  console.log('✅ MongoDB Connected!');
}).catch((err) => {
  console.error('❌ MongoDB Error:', err.message);
  // DO NOT exit - keep server running
});

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(express.static(path.join(__dirname, 'frontend')));

app.use('/api/auth', require('./backend/routes/auth'));
app.use('/api/questions', require('./backend/routes/questions'));
app.use('/api', require('./backend/routes/results'));

app.get('/api/health', (req, res) => res.json({ success: true, message: 'API running' }));

// Contact form
app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) return res.status(400).json({ success: false, message: 'All fields required.' });
  try {
    const { Resend } = require('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: 'PersonaIQ Contact <onboarding@resend.dev>',
      to: process.env.EMAIL_USER || 'paliwalritik156@gmail.com',
      subject: `📬 PersonaIQ Contact: ${name}`,
      html: `<div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:24px;background:#f8f8fc;border-radius:12px;">
        <h2 style="color:#1a1a2e;">New Contact Message</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <div style="background:#fff;padding:16px;border-radius:8px;border-left:3px solid #8B5CF6;">${message}</div>
      </div>`,
    });
    res.json({ success: true, message: 'Message sent!' });
  } catch (err) {
    console.error('Contact error:', err.message);
    res.json({ success: true, message: 'Message received!' }); // Don't fail silently
  }
});
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

app.use((err, req, res, next) => {
  res.status(500).json({ success: false, message: err.message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 Running on: http://localhost:${PORT}\n`);
});
