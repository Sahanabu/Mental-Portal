const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.chat = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      return res.json({
        message: "I hear you. Whatever you're feeling is valid. Would you like to try a breathing exercise or talk more about what's on your mind?"
      });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = `You are a supportive mental wellness companion. Provide encouraging, non-medical guidance. Be empathetic and understanding. Do not diagnose or provide medical advice. Always encourage seeking professional help for serious concerns.

User message: ${message}

Respond with supportive, caring advice (max 150 words):`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiMessage = response.text();

    res.json({
      message: aiMessage
    });
  } catch (error) {
    console.error('Gemini AI error:', error.message);
    res.json({
      message: "I'm here to listen. Sometimes talking about our feelings can help. Would you like to share more about what you're experiencing?"
    });
  }
};
