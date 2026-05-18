const express = require('express');
const Exam    = require('../models/Exam');
const { authenticate } = require('../middleware/auth');
const router  = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const exams = await Exam.findAll({ where: { userId: req.user.id }, order: [['examDate','ASC']] });
    res.json(exams);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', authenticate, async (req, res) => {
  const { title, courseId, examDate, duration, location, notes } = req.body;
  if (!title || !examDate) return res.status(400).json({ error: 'Title and examDate are required' });
  try {
    const exam = await Exam.create({ title, courseId, examDate, duration, location, notes, userId: req.user.id });
    res.status(201).json(exam);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.put('/:id', authenticate, async (req, res) => {
  try {
    const exam = await Exam.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!exam) return res.status(404).json({ error: 'Exam not found' });
    await exam.update(req.body);
    res.json(exam);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.delete('/:id', authenticate, async (req, res) => {
  try {
    const exam = await Exam.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!exam) return res.status(404).json({ error: 'Exam not found' });
    await exam.destroy();
    res.json({ message: 'Exam deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
