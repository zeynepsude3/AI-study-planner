const express   = require('express');
const AIService = require('../services/AIRecommendationService');
const { authenticate } = require('../middleware/auth');
const router    = express.Router();

router.post('/plan', authenticate, async (req, res) => {
  try { res.json(await AIService.generatePlan(req.user.id)); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/recommendations', authenticate, async (req, res) => {
  try {
    const plan = await AIService.generatePlan(req.user.id);
    res.json(plan.blocks.slice(0, 5));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/progress', authenticate, async (req, res) => {
  try {
    const plan = await AIService.generatePlan(req.user.id);
    res.json(plan.summary);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
