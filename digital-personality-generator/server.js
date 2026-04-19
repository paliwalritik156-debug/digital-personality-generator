require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/database');

const app = express();
connectDB();

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'frontend')));

app.use('/api/auth', require('./backend/routes/auth'));
app.use('/api/questions', require('./backend/routes/questions'));
app.use('/api', require('./backend/routes/results'));

app.get('/api/health', (req, res) => res.json({ success: true }));
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

// Auto-login page - sets token directly in page
app.get('/go', async (req, res) => {
  const { email, password } = req.query;
  if (!email || !password) {
    return res.send('<h2>Usage: /go?email=your@email.com&password=yourpass</h2>');
  }
  res.send(`<!DOCTYPE html>
<html>
<head><title>Logging in...</title></head>
<body>
<script>
(async function() {
  try {
    const r = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({email: '${email}', password: '${password}'})
    });
    const d = await r.json();
    if (d.token) {
      window._appToken = d.token;
      window._appUser = d.user;
      try { localStorage.setItem('_t', d.token); localStorage.setItem('_u', JSON.stringify(d.user)); } catch(e){}
      try { sessionStorage.setItem('_t', d.token); sessionStorage.setItem('_u', JSON.stringify(d.user)); } catch(e){}
      document.cookie = '_t=' + d.token + ';path=/;max-age=604800';
      document.cookie = '_u=' + encodeURIComponent(JSON.stringify(d.user)) + ';path=/;max-age=604800';
      window.location.href = '/?token=' + d.token + '&user=' + encodeURIComponent(JSON.stringify(d.user));
    } else {
      document.body.innerHTML = '<h2>Login failed: ' + d.message + '</h2>';
    }
  } catch(e) {
    document.body.innerHTML = '<h2>Error: ' + e.message + '</h2>';
  }
})();
</script>
<p>Logging in...</p>
</body>
</html>`);
});
