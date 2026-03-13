const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const getAIResponse = async (prompt) => {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
    return null;
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini AI error:', error.message);
    return null;
  }
};

exports.getBreathingTips = async (req, res) => {
  try {
    const { currentMood, stressLevel } = req.body;

    const prompt = `You are a mindfulness and breathing expert. The user is about to do a breathing exercise. Their current mood is "${currentMood || 'neutral'}" and stress level is ${stressLevel || 'moderate'}.

Provide 3 short, personalized tips for their breathing session (max 100 words total). Be encouraging and specific to their state.`;

    const aiMessage = await getAIResponse(prompt);

    res.json({
      tips: aiMessage || "Focus on slow, deep breaths. Inhale for 4 counts, hold for 4, exhale for 6. Let your shoulders relax with each breath."
    });
  } catch (error) {
    console.error('AI breathing tips error:', error.message);
    res.json({
      tips: "Focus on slow, deep breaths. Inhale for 4 counts, hold for 4, exhale for 6. Let your shoulders relax with each breath."
    });
  }
};

exports.getAmbientGuidance = async (req, res) => {
  try {
    const { timeOfDay, mood } = req.body;

    const prompt = `You are a relaxation and ambient wellness guide. It's ${timeOfDay || 'daytime'} and the user's mood is "${mood || 'neutral'}".

Provide a short, calming message (max 80 words) to help them relax in this ambient space. Be soothing and present-focused.`;

    const aiMessage = await getAIResponse(prompt);

    res.json({
      guidance: aiMessage || "Take this moment for yourself. Let the gentle movements calm your mind. There's nowhere you need to be right now. Just breathe and be present."
    });
  } catch (error) {
    console.error('AI ambient guidance error:', error.message);
    res.json({
      guidance: "Take this moment for yourself. Let the gentle movements calm your mind. There's nowhere you need to be right now. Just breathe and be present."
    });
  }
};

exports.getResourceRecommendations = async (req, res) => {
  try {
    const { userConcerns, assessmentScore } = req.body;

    const prompt = `You are a mental health resource advisor. The user has concerns about: "${userConcerns || 'general wellness'}" and their recent assessment score is ${assessmentScore || 'not provided'}.

Recommend 3 specific types of resources or support they should explore (max 120 words). Be practical and supportive.`;

    const aiMessage = await getAIResponse(prompt);

    res.json({
      recommendations: aiMessage || "Consider exploring: 1) Local support groups for peer connection, 2) Mental health apps for daily tracking, 3) Professional counseling for personalized guidance. Remember, seeking help is a sign of strength."
    });
  } catch (error) {
    console.error('AI resource recommendations error:', error.message);
    res.json({
      recommendations: "Consider exploring: 1) Local support groups for peer connection, 2) Mental health apps for daily tracking, 3) Professional counseling for personalized guidance. Remember, seeking help is a sign of strength."
    });
  }
};

exports.getCheckinInsights = async (req, res) => {
  try {
    const { mood, recentMoods } = req.body;

    const prompt = `You are a mood tracking wellness coach. The user just logged their mood as "${mood}". Their recent mood pattern is: ${recentMoods?.join(', ') || 'not available'}.

Provide a brief, encouraging insight about their mood pattern (max 80 words). Be supportive and offer one actionable tip.`;

    const aiMessage = await getAIResponse(prompt);

    res.json({
      insight: aiMessage || "Thank you for checking in. Tracking your mood helps you understand patterns. If you're feeling low, try a short walk or reach out to someone you trust."
    });
  } catch (error) {
    console.error('AI checkin insights error:', error.message);
    res.json({
      insight: "Thank you for checking in. Tracking your mood helps you understand patterns. If you're feeling low, try a short walk or reach out to someone you trust."
    });
  }
};

exports.getHistoryAnalysis = async (req, res) => {
  try {
    const { assessments, moodLogs } = req.body;

    const prompt = `You are a wellness progress analyst. The user has ${assessments?.length || 0} assessments and ${moodLogs?.length || 0} mood logs.

Recent assessment scores: ${assessments?.slice(-3).map(a => a.score).join(', ') || 'none'}.
Recent moods: ${moodLogs?.slice(-7).map(m => m.mood).join(', ') || 'none'}.

Provide a brief, encouraging analysis of their progress (max 100 words). Highlight positive trends or suggest areas for focus.`;

    const aiMessage = await getAIResponse(prompt);

    res.json({
      analysis: aiMessage || "Your journey is unique. Regular tracking shows self-awareness and commitment to your wellbeing. Keep noting patterns and celebrate small improvements."
    });
  } catch (error) {
    console.error('AI history analysis error:', error.message);
    res.json({
      analysis: "Your journey is unique. Regular tracking shows self-awareness and commitment to your wellbeing. Keep noting patterns and celebrate small improvements."
    });
  }
};
