require('dotenv').config();
const express   = require('express');
const cors      = require('cors');
const sequelize = require('./config/database');

require('./models/User');
require('./models/Course');
require('./models/Task');
require('./models/Exam');

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000' }));
app.use(express.json());

app.use('/api/auth',    require('./routes/authRouter'));
app.use('/api/tasks',   require('./routes/taskRouter'));
app.use('/api/courses', require('./routes/courseRouter'));
app.use('/api/exams',   require('./routes/examRouter'));
app.use('/api/ai',      require('./routes/aiRouter'));
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
