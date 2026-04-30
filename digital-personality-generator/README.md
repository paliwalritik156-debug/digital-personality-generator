# PersonaIQ — AI Personality Intelligence Platform

> Discover your digital self with the scientifically validated Big Five OCEAN model.

🔗 **Live Demo:** [digital-personality-generator.onrender.com](https://digital-personality-generator.onrender.com)

---

## ✨ Features

### 🧬 Core Assessment
- **25-question Big Five OCEAN assessment** — Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism
- Instant AI-generated personality type, summary, and personalized suggestions
- Radar chart visualization of trait scores

### 🎬 Unique Features
- **Cinematic Movie Trailer** — Full-screen dramatic reveal with audio effects (boom, impact, whoosh), particle animations, and cinematic bars
- **AI Digital Twin** — 3D animated avatar representing your personality (Three.js)
- **Voice Features** — Read questions aloud, answer by voice (1-5), listen to your full report
- **Shareable Personality Card** — Download as PNG, share on WhatsApp/Twitter

### 📊 Analytics
- **Personality Over Time** — Line chart showing trait evolution across multiple assessments
- **Global Comparison** — Percentile ranking vs all users (e.g., "74th percentile in Openness")

### 📧 Reports
- **PDF Report** — Download detailed personality report
- **Email Report** — Send PDF to any email via Resend

### 🔐 Auth & Profile
- Email/Password registration and login
- **Google OAuth** — One-click Google sign-in
- **Forgot Password** — OTP-based password reset via email
- **Change Password** — From profile page
- Profile page with stats, personality badge, login method

### 🎨 UI/UX
- **Dark/Light Mode** toggle — Preference saved locally
- Mobile responsive + PWA (installable as app)
- Cinematic dark theme with particle background (Three.js)
- Smooth animations and transitions

### 📄 Pages
- About, Privacy Policy, Terms of Service, Contact

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vanilla JS, HTML5, CSS3 |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose) |
| Auth | JWT, bcryptjs, Passport.js (Google OAuth) |
| Email | Resend API |
| PDF | PDFKit |
| Charts | Chart.js |
| 3D | Three.js |
| Deployment | Render |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB
- Resend API key
- Google OAuth credentials

### Installation

```bash
git clone https://github.com/paliwalritik156-debug/digital-personality-generator
cd digital-personality-generator
npm install
```

### Environment Variables

Create a `.env` file:

```env
PORT=3000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d

# Email
RESEND_API_KEY=re_xxxxxxxxxxxx

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
```

### Seed Questions

```bash
npm run seed
```

### Run

```bash
npm run dev
```

---

## 📁 Project Structure

```
digital-personality-generator/
├── backend/
│   ├── controllers/     # Auth, Questions, Results
│   ├── middleware/       # JWT auth, Passport
│   ├── models/          # User, Question, Answer, Result
│   └── routes/          # API routes
├── frontend/
│   ├── css/styles.css
│   ├── js/app.js
│   └── index.html
├── utils/
│   ├── emailService.js  # Resend email + PDF
│   ├── scoringEngine.js # OCEAN scoring
│   └── seedQuestions.js
└── server.js
```

---

## 🧠 OCEAN Model

The Big Five personality traits are the most scientifically validated framework in personality psychology:

| Trait | Description |
|-------|-------------|
| **O**penness | Creativity, curiosity, openness to experience |
| **C**onscientiousness | Organization, dependability, self-discipline |
| **E**xtraversion | Sociability, assertiveness, positive emotions |
| **A**greeableness | Cooperation, trust, empathy |
| **N**euroticism | Emotional instability, anxiety, moodiness |

---

## 📝 License

MIT License — feel free to use and modify.

---

Built with ❤️ by [Ritik Paliwal](https://github.com/paliwalritik156-debug)
