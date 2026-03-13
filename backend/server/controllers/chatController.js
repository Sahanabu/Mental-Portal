const Conversation = require('../models/Conversation');
const grok = require('./grokController');

exports.chat = async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    const userId = req.userId;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    // Generate session ID if not provided
    const currentSessionId = sessionId || `session_${Date.now()}_${userId}`;

    // Get or create conversation
    let conversation = await Conversation.findOne({ userId, sessionId: currentSessionId });
    
    if (!conversation) {
      conversation = new Conversation({
        userId,
        sessionId: currentSessionId,
        messages: []
      });
    }

    // Add user message to conversation
    conversation.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date()
    });

    let aiMessage = "I hear you. Whatever you're feeling is valid. Would you like to try a breathing exercise or talk more about what's on your mind?";

    try {
      const prompt = 'You are Aura, a supportive mental wellness companion. Provide encouraging, non-medical guidance. Be empathetic. Do not diagnose.\n\nUser: ' + message + '\n\nSupportive response:';
      aiMessage = await grok.chat(prompt);
    } catch (error) {
      console.error('Grok AI error:', error.message);
    }

    // Add AI response to conversation
    conversation.messages.push({
      role: 'assistant',
      content: aiMessage,
      timestamp: new Date()
    });

    // Save conversation (encrypted at rest by MongoDB)
    await conversation.save();

    res.json({
      message: aiMessage,
      sessionId: currentSessionId,
      conversationId: conversation._id
    });
  } catch (error) {
    console.error('Chat error:', error.message);
    res.json({
      message: "I'm here to listen. Sometimes talking about our feelings can help. Would you like to share more about what you're experiencing?"
    });
  }
};

exports.getConversations = async (req, res) => {
  try {
    const userId = req.userId;
    const { limit = 10 } = req.query;

    const conversations = await Conversation.find({ userId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .select('-__v');

    res.json({
      conversations,
      count: conversations.length
    });
  } catch (error) {
    console.error('Get conversations error:', error.message);
    res.status(500).json({ message: 'Failed to fetch conversations' });
  }
};

exports.getConversation = async (req, res) => {
  try {
    const userId = req.userId;
    const { sessionId } = req.params;

    const conversation = await Conversation.findOne({ userId, sessionId });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    res.json({ conversation });
  } catch (error) {
    console.error('Get conversation error:', error.message);
    res.status(500).json({ message: 'Failed to fetch conversation' });
  }
};

exports.deleteConversation = async (req, res) => {
  try {
    const userId = req.userId;
    const { sessionId } = req.params;

    const result = await Conversation.deleteOne({ userId, sessionId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    res.json({ message: 'Conversation deleted successfully' });
  } catch (error) {
    console.error('Delete conversation error:', error.message);
    res.status(500).json({ message: 'Failed to delete conversation' });
  }
};

exports.deleteAllConversations = async (req, res) => {
  try {
    const userId = req.userId;

    const result = await Conversation.deleteMany({ userId });

    res.json({ 
      message: 'All conversations deleted successfully',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Delete all conversations error:', error.message);
    res.status(500).json({ message: 'Failed to delete conversations' });
  }
};

