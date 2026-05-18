const express = require('express');
const Course  = require('../models/Course');
const { authenticate } = require('../middleware/auth');
const router  = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const courses = await Course.findAll({ where: { userId: req.user.id }, order: [['name','ASC']] });
    res.json(courses);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', authenticate, async (req, res) => {
  const { name, credits, difficulty, color } = req.body;
  if (!name) return res.status(400).json({ error: 'Course name is required' });
  try {
    const course = await Course.create({ name, credits, difficulty, color, userId: req.user.id });
    res.status(201).json(course);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.put('/:id', authenticate, async (req, res) => {
  try {
    const course = await Course.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!course) return res.status(404).json({ error: 'Course not found' });
    await course.update(req.body);
    res.json(course);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.delete('/:id', authenticate, async (req, res) => {
  try {
    const course = await Course.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!course) return res.status(404).json({ error: 'Course not found' });
    await course.destroy();
    res.json({ message: 'Course deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
