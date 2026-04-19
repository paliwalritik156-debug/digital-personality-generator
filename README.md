# 🧬 Digital Personality Generator

🚀 A modern full-stack web application that analyzes human personality using the **Big Five OCEAN Model** and provides meaningful insights through visualization and reports.

---

## 🌟 Overview

The **Digital Personality Generator** is an intelligent web-based system designed to evaluate personality traits through a structured 25-question assessment. It helps users understand their behavioral patterns and provides insights for personal growth, career guidance, and self-improvement.

---

## 🧠 Personality Model (OCEAN)

This system is based on the scientifically validated **Big Five Personality Traits**:

- 🔵 **Openness** – Creativity and curiosity  
- 🟢 **Conscientiousness** – Discipline and responsibility  
- 🟡 **Extraversion** – Sociability and energy  
- 🟣 **Agreeableness** – Kindness and cooperation  
- 🔴 **Neuroticism** – Emotional stability  

---

## 🚀 Features

- ✅ 25-Question Personality Assessment  
- 📊 Real-time Personality Scoring  
- 📈 Radar Chart Visualization (Chart.js)  
- 💡 Personalized Insights & Suggestions  
- 📄 Downloadable PDF Report  
- 🔐 Secure Authentication (JWT + bcrypt)  
- 🕒 Test History Tracking  

---

## 🛠️ Tech Stack

### 🔹 Frontend
- HTML5  
- CSS3  
- JavaScript  
- Chart.js  

### 🔹 Backend
- Node.js  
- Express.js  

### 🔹 Database
- MongoDB (Mongoose)  

### 🔹 Security
- JSON Web Token (JWT)  
- bcrypt  

### 🔹 Tools
- PDFKit  
- dotenv  

---

## 📂 Project Structure
digital-personality-generator/
│
├── backend/
│ ├── models/
│ ├── controllers/
│ ├── routes/
│ ├── middleware/
│
├── frontend/
│ ├── index.html
│ ├── style.css
│ ├── script.js
│
├── utils/
├── config/
├── server.js
└── README.md

---

## ⚙️ Installation & Setup

### 1️⃣ Clone Repository
```bash
git clone https://github.com/ritikpaliwal/digital-personality-generator.git
cd digital-personality-generator

2️⃣ Install Dependencies
npm install

3️⃣ Setup Environment Variables
Create a .env file:
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=5000

4️⃣ Run the Application
npm start

🔮 Future Enhancements
🤖 AI-based personality insights
📱 Mobile App (React Native)
🌍 Multi-language support
🎯 Career Recommendation System


👨‍💻 Author
Ritik Paliwal
🎓 MCA (AI & ML) – Chandigarh University


