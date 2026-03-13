const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const auth = require('../middleware/auth');

router.post('/', auth, chatController.chat);
router.get('/conversations', auth, chatController.getConversations);
router.get('/conversations/:sessionId', auth, chatController.getConversation);
router.delete('/conversations/:sessionId', auth, chatController.deleteConversation);
router.delete('/conversations', auth, chatController.deleteAllConversations);

module.exports = router;
