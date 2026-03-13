const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const getRecommendations = (category) => {
  const recommendations = {
    Minimal: [
      'Maintain healthy habits',
      'Continue regular exercise',
      'Keep a consistent sleep schedule',
      'Stay connected with friends and family'
    ],
    Mild: [
      'Practice meditation daily',
      'Try breathing exercises',
      'Engage in regular physical activity',
      'Consider mindfulness practices'
    ],
    Moderate: [
      'Start journaling your thoughts',
      'Increase physical activity',
      'Talk to friends or family',
      'Consider stress management techniques',
      'Limit caffeine and alcohol'
    ],
    Severe: [
      'Seek professional help immediately',
      'Contact a mental health professional',
      'Reach out to support helplines',
      'Talk to someone you trust',
      'Do not isolate yourself'
    ]
  };

  return recommendations[category] || [];
};

const getAIRecommendations = async (category, score, answers, language = 'en') => {
  try {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      return getRecommendations(category);
    }

    const languageInstructions = {
      'en': 'Respond in English.',
      'hi': 'आपको हिंदी में जवाब देना है। सरल और स्पष्ट हिंदी का उपयोग करें। (You must respond in Hindi. Use simple and clear Hindi.)',
      'kn': 'ನೀವು ಕನ್ನಡದಲ್ಲಿ ಉತ್ತರಿಸಬೇಕು. ಸರಳ ಮತ್ತು ಸ್ಪಷ್ಟವಾದ ಕನ್ನಡವನ್ನು ಬಳಸಿ. (You must respond in Kannada. Use simple and clear Kannada.)'
    };
    const langInstruction = languageInstructions[language] || languageInstructions['en'];

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = `As a mental wellness advisor, provide 5 personalized, practical recommendations for someone with a ${category} mental wellness score of ${score}/27.

Guidelines:
- Keep recommendations supportive and actionable
- Focus on self-care and wellness practices
- Do not diagnose or provide medical advice
- Encourage professional help if needed
- Format as a numbered list

IMPORTANT: ${langInstruction}

Provide exactly 5 recommendations:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiResponse = response.text();
    
    // Parse the response into an array
    const recommendations = aiResponse
      .split('\n')
      .filter(line => line.trim().length > 0)
      .map(line => line.replace(/^[\d\-\.\*]+\s*/, '').trim())
      .filter(line => line.length > 10)
      .slice(0, 5);
    
    return recommendations.length > 0 ? recommendations : getRecommendations(category);
  } catch (error) {
    console.log('Gemini AI recommendations unavailable, using default:', error.message);
    return getRecommendations(category);
  }
};

module.exports = { getRecommendations, getAIRecommendations };
