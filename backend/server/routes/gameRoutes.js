const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { generateChallenge, generateSession, saveSession, getUserSessions, getLeaderboard } = require('../controllers/gameController');

router.post('/challenge', generateChallenge);           // public
router.post('/session/generate', generateSession);      // public
router.post('/session/save', auth, saveSession);        // auth required
router.get('/sessions/:userId', auth, getUserSessions); // auth required
router.get('/leaderboard', getLeaderboard);             // public

module.exports = router;
