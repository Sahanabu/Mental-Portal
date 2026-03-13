const express = require('express');
const router = express.Router();
const moodController = require('../controllers/moodController');
const auth = require('../middleware/auth');

router.post('/log', auth, moodController.logMood);
router.get('/history', auth, moodController.getMoodHistory);

module.exports = router;
