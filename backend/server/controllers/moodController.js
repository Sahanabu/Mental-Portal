const MoodLog = require('../models/MoodLog');

exports.logMood = async (req, res) => {
  try {
    const { mood } = req.body;

    if (!mood || !['happy', 'neutral', 'sad', 'anxious', 'stressed', 'tired'].includes(mood)) {
      return res.status(400).json({ message: 'Valid mood value is required (happy, neutral, sad, anxious, stressed, tired)' });
    }

    const moodLog = new MoodLog({
      userId: req.userId,
      mood
    });

    await moodLog.save();

    res.status(201).json({
      message: 'Mood logged successfully',
      moodLog: {
        id: moodLog._id,
        mood: moodLog.mood,
        date: moodLog.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getMoodHistory = async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const moodLogs = await MoodLog.find({
      userId: req.userId,
      createdAt: { $gte: sevenDaysAgo }
    })
      .sort({ createdAt: 1 })
      .select('mood createdAt');

    // Transform data for chart display
    const moodData = moodLogs.map(log => ({
      date: log.createdAt.toISOString().split('T')[0],
      mood: log.mood,
      score: getMoodScore(log.mood)
    }));

    res.json({ 
      moodLogs: moodData,
      count: moodData.length 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getMoodScore = (mood) => {
  const moodScores = {
    happy: 8,
    neutral: 5,
    sad: 3,
    anxious: 2,
    stressed: 2,
    tired: 4
  };
  return moodScores[mood] || 5;
};
