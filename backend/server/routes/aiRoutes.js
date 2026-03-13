const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const auth = require('../middleware/auth');

// AI suggestions for different contexts
router.post('/breathing-tips', auth, aiController.getBreathingTips);
router.post('/ambient-guidance', auth, aiController.getAmbientGuidance);
router.post('/resource-recommendations', auth, aiController.getResourceRecommendations);
router.post('/checkin-insights', auth, aiController.getCheckinInsights);
router.post('/history-analysis', auth, aiController.getHistoryAnalysis);

module.exports = router;
