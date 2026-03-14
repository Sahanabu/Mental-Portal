const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/adaptiveAssessmentController');
const auth = require('../middleware/auth');

router.post('/start', auth, ctrl.startSession);
router.post('/respond', auth, ctrl.respond);
router.get('/sessions', auth, ctrl.getSessions);

module.exports = router;
