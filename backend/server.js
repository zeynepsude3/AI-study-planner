require('dotenv').config();
const express   = require('express');
const cors      = require('cors');
const sequelize = require('./config/database');

require('./models/User');
require('./models/Course');
require('./models/Task');
require('./models/Exam');

const app = express();
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://ai-study-planner-neon.vercel.app'
  ],
  credentials: true
}));

app.use(express.json());

app.use('/api/auth',    require('./routes/authRouter'));
app.use('/api/tasks',   require('./routes/taskRouter'));
app.use('/api/courses', require('./routes/courseRouter'));
app.use('/api/exams',   require('./routes/examRouter'));
app.use('/api/ai',      require('./routes/aiRouter'));
app.use('/api/admin',   require('./routes/adminrouter'));
app.get('/api/health',  (req, res) => res.json({ status: 'ok' }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 5001;
sequelize.sync({ alter: true })
  .then(() => {
    console.log('✅ Veritabanı hazır');
    app.listen(PORT, () => console.log(`🚀 Server: http://localhost:${PORT}`));
  })
  .catch(err => {
    console.error('❌ Veritabanı hatası:', err.message);
    process.exit(1);
  });
// force redeploy 19 May 2026 Sal +03 19:52:05
