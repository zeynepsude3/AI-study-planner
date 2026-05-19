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
app.get('/api/health',  (req, res) => res.json({ status: 'ok' }));
// Admin routes inline
const User2 = require('./models/User');
const Task2 = require('./models/Task');
const Course2 = require('./models/Course');
const Exam2 = require('./models/Exam');
const { authenticate: auth2 } = require('./middleware/auth');

app.get('/api/admin/users', auth2, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  try {
    const users = await User2.findAll({ attributes: ['id','name','email','role','createdAt'], order: [['createdAt','DESC']] });
    res.json(users);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/admin/stats', auth2, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  try {
    const totalUsers = await User2.count();
    const totalCourses = await Course2.count();
    const totalTasks = await Task2.count();
    const totalExams = await Exam2.count();
    const doneTasks = await Task2.count({ where: { status: 'done' } });
    const pendingTasks = await Task2.count({ where: { status: 'pending' } });
    const adminUsers = await User2.count({ where: { role: 'admin' } });
    const studentUsers = await User2.count({ where: { role: 'student' } });
    res.json({ totalUsers, totalCourses, totalTasks, totalExams, doneTasks, pendingTasks, adminUsers, studentUsers, completionRate: totalTasks ? Math.round((doneTasks/totalTasks)*100) : 0 });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/admin/users/:id/role', auth2, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  try {
    const user = await User2.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'Not found' });
    await user.update({ role: req.body.role });
    res.json(user);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/admin/users/:id', auth2, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  try {
    const user = await User2.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'Not found' });
    await user.destroy();
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
}); 
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
