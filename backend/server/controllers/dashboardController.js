const Assessment = require('../models/Assessment');
const AssessmentSession = require('../models/AssessmentSession');
const MoodLog = require('../models/MoodLog');
const Conversation = require('../models/Conversation');
const Interaction = require('../models/Interaction');
const Recommendation = require('../models/Recommendation');

// GET /api/dashboard/user/:userId
exports.getDashboard = async (req, res) => {
  try {
    if (req.userId.toString() !== req.params.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const userId = req.userId;

    const [assessments, sessions, moodLogs, interactions, recommendations] = await Promise.all([
      Assessment.find({ userId }).sort({ createdAt: -1 }).limit(20).lean(),
      AssessmentSession.find({ userId, completed: true }).sort({ createdAt: -1 }).limit(10)
        .select('result createdAt conversation').lean(),
      MoodLog.find({ userId }).sort({ createdAt: -1 }).limit(30).lean(),
      Interaction.find({ userId }).sort({ createdAt: -1 }).limit(50)
        .select('type encryptedPayload createdAt').lean(),
      Recommendation.find({ userId }).sort({ createdAt: -1 }).limit(20)
        .select('type mood items createdAt').lean()
    ]);

    // Mood trend — last 7 days
    const moodScoreMap = { happy: 9, neutral: 5, sad: 2, anxious: 3, stressed: 2, tired: 4 };
    const moodTrend = moodLogs.slice(0, 7).reverse().map(log => ({
      date: new Date(log.createdAt).toLocaleDateString('en-US', { weekday: 'short' }),
      mood: log.mood,
      score: moodScoreMap[log.mood] || 5
    }));

    // Assessment score trend
    const scoreTrend = assessments.slice(0, 10).reverse().map(a => ({
      date: new Date(a.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      score: a.score,
      category: a.category
    }));

    const latest = assessments[0] || null;
    const latestSession = sessions[0] || null;

    res.json({
      summary: {
        totalAssessments: assessments.length,
        totalMoodLogs: moodLogs.length,
        totalInteractions: interactions.length,
        latestScore: latest?.score ?? null,
        latestCategory: latest?.category ?? null,
        latestSummary: latestSession?.result?.summary ?? null,
        latestRecommendations: latestSession?.result?.recommendations ?? latest?.recommendations ?? []
      },
      moodTrend,
      scoreTrend,
      recentMoods: moodLogs.slice(0, 7).map(m => ({ mood: m.mood, date: m.createdAt })),
      assessmentSessions: sessions,
      recommendations: recommendations.map(r => ({
        id: r._id,
        type: r.type,
        mood: r.mood,
        itemCount: r.items?.length || 0,
        createdAt: r.createdAt
      })),
      // Encrypted interactions — client decrypts
      interactions: interactions.map(i => ({
        id: i._id,
        type: i.type,
        encryptedPayload: i.encryptedPayload,
        createdAt: i.createdAt
      }))
    });
  } catch (error) {
    console.error('Dashboard error:', error.message);
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
};
