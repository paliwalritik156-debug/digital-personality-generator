# 🧬 Digital Personality Generator

A full-stack web application for personality assessment based on the **Big Five OCEAN Model**.

---

## 🏗️ Tech Stack

| Layer      | Technology                         |
|------------|------------------------------------|
| Backend    | Node.js + Express.js               |
| Frontend   | HTML5, CSS3, Vanilla JavaScript    |
| Database   | MongoDB with Mongoose ODM          |
| Auth       | JWT (jsonwebtoken) + bcryptjs      |
| Charts     | Chart.js (Radar Chart)             |
| PDF        | pdfkit                             |
| Styling    | Custom CSS (dark cosmic theme)     |

---

## 📁 Project Structure

```
digital-personality-generator/
├── server.js                    ← Express app entry point
├── .env                         ← Environment variables
├── package.json
│
├── config/
│   └── database.js              ← MongoDB connection
│
├── backend/
│   ├── models/
│   │   ├── User.js              ← User schema + bcrypt hooks
│   │   ├── Question.js          ← Assessment questions schema
│   │   ├── Answer.js            ← Per-session answers schema
│   │   └── Result.js            ← Computed results schema
│   │
│   ├── controllers/
│   │   ├── authController.js    ← Register, login, /me
│   │   ├── questionController.js← Fetch questions
│   │   └── resultController.js  ← Submit, results, history, PDF
│   │
│   ├── routes/
│   │   ├── auth.js              ← /api/auth/*
│   │   ├── questions.js         ← /api/questions
│   │   └── results.js           ← /api/submit, /api/result/:id, etc.
│   │
│   └── middleware/
│       └── auth.js              ← JWT protect middleware
│
├── utils/
│   ├── scoringEngine.js         ← OCEAN scoring + personality logic
│   └── seedQuestions.js         ← Seed 25 questions to DB
│
└── frontend/
    ├── index.html               ← Single-page application
    ├── css/
    │   └── styles.css           ← Full dark theme stylesheet
    └── js/
        └── app.js               ← All frontend logic
```

---

## 🚀 Quick Start

### 1. Prerequisites

- **Node.js** v16+ ([nodejs.org](https://nodejs.org))
- **MongoDB** running locally on `mongodb://localhost:27017`
  - OR use a free cloud instance: [MongoDB Atlas](https://www.mongodb.com/atlas)

### 2. Install Dependencies

```bash
cd digital-personality-generator
npm install
```

### 3. Configure Environment

Edit `.env` file:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/personality_generator
JWT_SECRET=change_this_to_a_strong_random_secret
JWT_EXPIRE=7d
NODE_ENV=development
```

> For MongoDB Atlas, replace MONGODB_URI with your connection string:
> `MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/personality_generator`

### 4. Seed the Database

```bash
npm run seed
```

This inserts 25 personality questions across all 5 OCEAN traits.

### 5. Start the Server

```bash
# Production
npm start

# Development (auto-reload)
npm run dev
```

### 6. Open the App

Visit: **[http://localhost:3000](http://localhost:3000)**

---

## 🌐 API Reference

### Authentication

| Method | Endpoint              | Auth | Description           |
|--------|-----------------------|------|-----------------------|
| POST   | `/api/auth/register`  | No   | Create account        |
| POST   | `/api/auth/login`     | No   | Login + get JWT token |
| GET    | `/api/auth/me`        | Yes  | Get current user      |

#### Register Body
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "secret123"
}
```

### Questions

| Method | Endpoint         | Auth | Description          |
|--------|------------------|------|----------------------|
| GET    | `/api/questions` | Yes  | Get all 25 questions |

### Results

| Method | Endpoint                      | Auth | Description              |
|--------|-------------------------------|------|--------------------------|
| POST   | `/api/submit`                 | Yes  | Submit answers           |
| GET    | `/api/result/:sessionId`      | Yes  | Get a specific result    |
| GET    | `/api/history`                | Yes  | Get user's result history|
| GET    | `/api/result/:sessionId/pdf`  | Yes  | Download PDF report      |

#### Submit Body
```json
{
  "answers": [
    { "questionId": "...", "value": 4 },
    { "questionId": "...", "value": 2 }
  ]
}
```

---

## 🎯 OCEAN Scoring System

Each question is mapped to one of 5 traits. Some questions are **reversed** (disagreeing = higher trait score).

**Scoring Formula:**
1. Average all answers per trait (1–5 scale)
2. Normalize: `score = ((average - 1) / 4) * 100`
3. Result: 0–100 percentage per trait

**Personality Types** (10 archetypes):
- 🔮 The Visionary — High Openness + Extraversion
- 🛡️ The Guardian — High Conscientiousness + Agreeableness
- 🤝 The Diplomat — High Agreeableness + Extraversion
- 🏛️ The Architect — High Conscientiousness + Openness
- 🧭 The Explorer — Very High Openness
- ⚡ The Commander — High Extraversion + Conscientiousness
- 💖 The Empath — High Agreeableness + Neuroticism
- 🔬 The Analyst — High Conscientiousness + Low Extraversion
- 🌿 The Mediator — High Agreeableness + Low Neuroticism
- 🎭 The Maverick — High Openness + Low Agreeableness

---

## ⌨️ Keyboard Shortcuts (Quiz)

| Key    | Action             |
|--------|--------------------|
| `1–5`  | Select answer      |
| `→`    | Next question      |
| `←`    | Previous question  |
| `Enter`| Next / Submit      |

---

## 🔒 Security Features

- Passwords hashed with **bcrypt** (salt rounds: 12)
- **JWT tokens** expire in 7 days
- All result endpoints verify the user owns the data
- Input validation via **express-validator**
- Passwords excluded from all API responses

---

## 🐛 Troubleshooting

**"No questions found"**
→ Run `npm run seed`

**"MongoDB connection failed"**
→ Ensure MongoDB is running: `mongod --dbpath /data/db`

**PDF download not working**
→ Ensure the session ID in the URL is valid and belongs to the current user

---

## 📜 License

MIT — free to use and modify.
