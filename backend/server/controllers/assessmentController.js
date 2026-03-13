const Assessment = require('../models/Assessment');
const { getAIRecommendations } = require('../utils/recommendations');

const calculateCategory = (score) => {
  if (score <= 4) return 'Minimal';
  if (score <= 9) return 'Mild';
  if (score <= 14) return 'Moderate';
  return 'Severe';
};

exports.submitAssessment = async (req, res) => {
  try {
    const { answers } = req.body;

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ message: 'Answers array is required' });
    }

    const score = answers.reduce((sum, val) => sum + val, 0);
    const category = calculateCategory(score);
    const recommendations = await getAIRecommendations(category, score, answers);

    const assessment = new Assessment({
      userId: req.userId,
      answers,
      score,
      category
    });

    await assessment.save();

    res.status(201).json({
      score,
      category,
      recommendations,
      assessmentId: assessment._id
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const assessments = await Assessment.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .select('answers score category createdAt')
      .lean();

    // Transform data for frontend
    const formattedAssessments = assessments.map(assessment => ({
      id: assessment._id,
      score: assessment.score,
      category: assessment.category,
      date: assessment.createdAt,
      answers: assessment.answers
    }));

    res.json({ 
      assessments: formattedAssessments,
      count: formattedAssessments.length 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
