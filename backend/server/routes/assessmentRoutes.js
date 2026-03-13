const express = require('express');
const router = express.Router();
const assessmentController = require('../controllers/assessmentController');
const auth = require('../middleware/auth');

router.post('/submit', auth, assessmentController.submitAssessment);
router.get('/history', auth, assessmentController.getHistory);

module.exports = router;
