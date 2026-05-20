🎓 AI-Powered Study Planner
A fully deployed web application that helps university students manage courses, exams, tasks, and daily study activities with an AI-powered recommendation engine.
Live Demo: ai-study-planner-neon.vercel.app
Backend API: ai-study-planner-g8lo.onrender.com
Repository: github.com/zeynepsude3/AI-study-planner

📋 Features

Dashboard — Daily tasks, upcoming exams, AI recommendations, progress stats
Courses — Add and manage courses with credits, difficulty, and color labels
Tasks — Full CRUD with priority stars, status filters, and due date countdown
Exams — Exam tracking with color-coded countdown badges
Study Plan — AI-generated personalized daily study schedule
Admin Panel — User management and system statistics (admin role only)
JWT Authentication — Secure login/register with bcrypt password hashing


🤖 AI Recommendation Engine
The AIRecommendationService generates a ranked list of up to 8 study blocks by:

Exam proximity scoring — priority = 10 - daysLeft
Task urgency — +5 if due today, +2 if due within 3 days
Course completion weight — review blocks for courses below 50% completion

Returns StudyBlock[] with type (exam_prep / task / review), suggested hours, and reason.

🛠 Tech Stack
LayerTechnologyHostingFrontendReact.js 18, React Router v6, AxiosVercelBackendNode.js 18, Express.jsRenderBusiness LogicAIRecommendationService, bcryptjs, JWTRenderORMSequelize v6RenderDatabaseMySQL 8.0RailwayVersion ControlGit, GitHubGitHub

🗂 Project Structure
AI-study-planner/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── AuthPage.jsx
│   │   │   ├── CoursesPage.jsx
│   │   │   ├── TasksPage.jsx
│   │   │   ├── ExamsPage.jsx
│   │   │   ├── StudyPlanPage.jsx
│   │   │   └── AdminPage.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   └── api.js
│   └── package.json
├── backend/
│   ├── routes/
│   │   ├── authRouter.js       # POST /api/auth/register, /login
│   │   ├── taskRouter.js       # CRUD /api/tasks
│   │   ├── courseRouter.js     # CRUD /api/courses
│   │   ├── examRouter.js       # CRUD /api/exams
│   │   ├── aiRouter.js         # POST /api/ai/plan, GET /recommendations
│   │   └── adminrouter.js      # GET /api/admin/users, /stats
│   ├── services/
│   │   └── AIRecommendationService.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Course.js
│   │   ├── Task.js
│   │   └── Exam.js
│   ├── middleware/
│   │   └── authenticate.js
│   └── server.js
└── README.md

🚀 Local Setup
Prerequisites

Node.js 18+
MySQL 8.0

Backend
bashcd backend
npm install
Create .env:
NODE_ENV=development
PORT=5001
JWT_SECRET=your_secret_key
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=study_planner
CLIENT_URL=http://localhost:3000
bashnode server.js
Frontend
bashcd frontend
npm install
Create .env:
REACT_APP_API_URL=http://localhost:5001/api
bashnpm start

☁️ Deployment
ServicePlatformURLFrontendVercel (auto-deploy from GitHub)ai-study-planner-neon.vercel.appBackendRender (free tier, auto-sleep)ai-study-planner-g8lo.onrender.comDatabaseRailway MySQL 8.0trolley.proxy.rlwy.net:37160

⚠️ Render free tier sleeps after 15 minutes of inactivity. First request may take ~30s to wake up.


🗃 Database Schema
TableKey Fieldsusersid, name, email, password (hashed), role (student/admin)coursesid, userId (FK), title, code, credits, difficulty, colortasksid, userId (FK), courseId (FK), title, dueDate, priority, statusexamsid, userId (FK), courseId (FK), title, examDate, duration, location
Tables are auto-synced via Sequelize.sync({ alter: true }) on server startup.

## 📄 License

This project was developed as a Software Architecture course project at İstinye Üniversitesi.
