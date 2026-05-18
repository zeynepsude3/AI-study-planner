const express = require('express');
const Task    = require('../models/Task');
const { authenticate } = require('../middleware/auth');
const router  = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const tasks = await Task.findAll({ where: { userId: req.user.id }, order: [['priority','DESC'],['dueDate','ASC']] });
    res.json(tasks);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', authenticate, async (req, res) => {
  const { title, description, courseId, dueDate, priority, estimatedHours } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });
  try {
    const task = await Task.create({ title, description, courseId, dueDate, priority: priority || 1, estimatedHours: estimatedHours || 1, status: 'pending', userId: req.user.id });
    res.status(201).json(task);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.put('/:id', authenticate, async (req, res) => {
  try {
    const task = await Task.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    await task.update(req.body);
    res.json(task);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.delete('/:id', authenticate, async (req, res) => {
  try {
    const task = await Task.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    await task.destroy();
    res.json({ message: 'Task deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
