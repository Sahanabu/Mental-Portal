const express = require('express');
const router = express.Router();
const assessmentController = require('../controllers/assessmentController');
const auth = require('../middleware/auth');

router.post('/questions', assessmentController.generateQuestions);
router.post('/analyze', auth, assessmentController.analyzeAnswers);
router.post('/submit', auth, assessmentController.submitAssessment);
router.get('/history', auth, assessmentController.getHistory);

module.exports = router;
