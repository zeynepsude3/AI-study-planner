# 📚 AI-Powered Study Planner

A web-based academic planning application that helps university students manage their courses, exams, assignments, and daily study tasks with AI-driven personalized recommendations.

🔗 **Live Demo:** [ai-study-planner-neon.vercel.app](https://ai-study-planner-neon.vercel.app)

---

## ✨ Features

- **Authentication** — Register and login with JWT-based security
- **Course Management** — Add courses with credits, difficulty level, and color
- **Task Tracking** — Create, update, and filter tasks by status and priority
- **Exam Countdown** — Track upcoming exams with color-coded urgency badges
- **AI Study Plan** — Personalized daily study recommendations based on exam proximity and task urgency
- **Dashboard** — Overview of progress, upcoming exams, today's tasks, and AI suggestions
- **Cloud Deployment** — Accessible from any device via Vercel + Render + Railway

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js 18, React Router v6, Axios |
| Backend | Node.js, Express.js |
| Database | MySQL 8.0 (Railway) |
| ORM | Sequelize |
| Authentication | JWT + bcryptjs |
| Deployment | Vercel (frontend), Render (backend), Railway (DB) |

---

## 🏗️ Architecture

The system follows a **Layered Architecture** (4-tier):

```
Presentation Layer  →  React SPA (Vercel)
Application Layer   →  Express REST API (Render)
Business Logic      →  AIRecommendationService
Data Layer          →  MySQL via Sequelize (Railway)
```

---

## 🤖 How the AI Works

The AI Recommendation Module is a rule-based prioritization engine:

- **Exam proximity** → exams within 14 days get highest priority (4h if tomorrow, 3h if 2-3 days, 2h if within a week)
- **Task urgency** → tasks due within 3 days are marked urgent
- **Course completion** → courses below 50% completion get review suggestions
- All blocks are ranked by priority score and top 8 are returned as the daily study plan

---

## 🚀 Getting Started (Local)

### Prerequisites
- Node.js 18+
- MySQL 8.0

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```
PORT=5001
JWT_SECRET=your_secret_key
DB_NAME=study_planner
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_HOST=localhost
CLIENT_URL=http://localhost:3000
```

Create the database in MySQL:

```sql
CREATE DATABASE study_planner;
```

Start the backend:

```bash
node server.js
```

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

The app will be available at `http://localhost:3000`

---

## 📁 Project Structure

```
AI-study-planner/
├── frontend/
│   └── src/
│       ├── App.jsx
│       ├── context/AuthContext.jsx
│       ├── services/api.js
│       ├── components/Layout.jsx
│       └── pages/
│           ├── Dashboard.jsx
│           ├── AuthPage.jsx
│           ├── CoursesPage.jsx
│           ├── TasksPage.jsx
│           ├── ExamsPage.jsx
│           └── StudyPlanPage.jsx
└── backend/
    ├── server.js
    ├── config/database.js
    ├── middleware/auth.js
    ├── models/         (User, Course, Task, Exam)
    ├── routes/         (authRouter, taskRouter, courseRouter, examRouter, aiRouter)
    └── services/AIRecommendationService.js
```

---

## 👥 Team

| Name | Role |
|------|------|
| Zeynep Sude Ağcabay | Frontend Developer |
| Ezgi Turan | Backend Developer |
| Murat Emre Doğan | Database & Architecture |

---

## 📄 License

This project was developed as a Software Architecture course project at İstinye Üniversitesi.
