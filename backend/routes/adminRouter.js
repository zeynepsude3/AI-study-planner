const express = require('express');
const User    = require('../models/User');
const Task    = require('../models/Task');
const Course  = require('../models/Course');
const Exam    = require('../models/Exam');
const { authenticate } = require('../middleware/auth');
const router  = express.Router();

const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  next();
};

router.get('/users', authenticate, adminOnly, async (req, res) => {
  try {
    const users = await User.findAll({ attributes: ['id','name','email','role','createdAt'], order: [['createdAt','DESC']] });
    res.json(users);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/users/:id/role', authenticate, adminOnly, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.id === req.user.id) return res.status(400).json({ error: 'Cannot change your own role' });
    await user.update({ role: req.body.role });
    res.json(user);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.delete('/users/:id', authenticate, adminOnly, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.id === req.user.id) return res.status(400).json({ error: 'Cannot delete yourself' });
    await user.destroy();
    res.json({ message: 'User deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/stats', authenticate, adminOnly, async (req, res) => {
  try {
    const totalUsers   = await User.count();
    const totalCourses = await Course.count();
    const totalTasks   = await Task.count();
    const totalExams   = await Exam.count();
    const doneTasks    = await Task.count({ where: { status: 'done' } });
    const pendingTasks = await Task.count({ where: { status: 'pending' } });
    const adminUsers   = await User.count({ where: { role: 'admin' } });
    const studentUsers = await User.count({ where: { role: 'student' } });
    res.json({ totalUsers, totalCourses, totalTasks, totalExams, doneTasks, pendingTasks, adminUsers, studentUsers, completionRate: totalTasks ? Math.round((doneTasks/totalTasks)*100) : 0 });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;