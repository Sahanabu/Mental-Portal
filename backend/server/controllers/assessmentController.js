const Assessment = require('../models/Assessment');
const grok = require('./grokController');

const calculateCategory = (score) => {
  if (score <= 4) return 'Minimal';
  if (score <= 9) return 'Mild';
  if (score <= 14) return 'Moderate';
  return 'Severe';
};

exports.generateQuestions = async (req, res) => {
  try {
    const questions = await grok.generateQuestions();
    res.json({ questions });
  } catch (error) {
    console.error('Question generation error:', error);
    res.status(500).json({ error: 'Failed to generate questions', fallback: true });
  }
};

exports.analyzeAnswers = async (req, res) => {
  try {
    const { answers, questions, language = 'en' } = req.body;

    if (!answers || !Array.isArray(answers) || answers.length !== 6) {
      return res.status(400).json({ message: '6 answers required' });
    }

    const analysis = await grok.analyzeAnswers(answers, questions || [], language);

    const assessment = new Assessment({
      userId: req.userId,
      answers,
      questions: questions || [],
      score: analysis.score,
      category: analysis.category,
      severity: analysis.severity || 'medium',
      recommendations: analysis.recommendations || []
    });
    await assessment.save();

    res.json(analysis);
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Analysis failed' });
  }
};

exports.submitAssessment = async (req, res) => {
  try {
    const { answers } = req.body;

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ message: 'Answers array is required' });
    }

    const score = answers.reduce((sum, val) => sum + val, 0);
    const category = calculateCategory(score);

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
      recommendations: ['Fallback recommendation 1', 'Fallback recommendation 2'],
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
      .select('answers score category severity recommendations questions createdAt')
      .lean();

    const formattedAssessments = assessments.map(assessment => ({
      id: assessment._id,
      score: assessment.score,
      category: assessment.category,
      severity: assessment.severity,
      recommendations: assessment.recommendations || [],
      questions: assessment.questions || [],
      date: assessment.createdAt
    }));

    res.json({ 
      assessments: formattedAssessments,
      count: formattedAssessments.length 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

