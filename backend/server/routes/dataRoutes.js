const express = require('express');
const router = express.Router();
const interactionCtrl = require('../controllers/interactionController');
const dashboardCtrl = require('../controllers/dashboardController');
const auth = require('../middleware/auth');

router.post('/interactions/save', auth, interactionCtrl.save);
router.get('/interactions/user/:userId', auth, interactionCtrl.getForUser);
router.get('/dashboard/user/:userId', auth, dashboardCtrl.getDashboard);

module.exports = router;
