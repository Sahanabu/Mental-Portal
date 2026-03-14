const GameSession = require('../models/GameSession');
const User = require('../models/User');
const grok = require('./grokController');

const DIFFICULTY_XP    = { easy: 10, medium: 20, hard: 35 };
const DIFFICULTY_SCORE = { easy: 100, medium: 200, hard: 350 };
const QUESTION_COUNT   = { easy: 5, medium: 7, hard: 10 };

const TYPE_LABELS = {
  logic:   'logic reasoning',
  pattern: 'pattern recognition',
  word:    'word puzzle',
  number:  'numerical puzzle',
  memory:  'memory challenge',
};

// POST /api/games/session/generate  — generate all questions for a session at once
exports.generateSession = async (req, res) => {
  try {
    const { gameType = 'logic', difficulty = 'medium', count = 7 } = req.body;
    const label = TYPE_LABELS[gameType] || 'logic reasoning';
    const isMemory = gameType === 'memory';
    const questionCount = Math.min(Math.max(parseInt(count) || 7, 5), 10);

    const memoryExtra = isMemory
      ? `- "memorySequence": array of 4-6 strings to memorize\n- "memoryDuration": seconds (8 easy, 12 medium, 16 hard)`
      : `- "memorySequence": null\n- "memoryDuration": null`;

    const prompt = `Generate exactly ${questionCount} unique ${difficulty} ${label} challenges.
Return ONLY a valid JSON array of ${questionCount} objects, no markdown:
[{
  "type": "${gameType}",
  "memorySequence": null,
  "memoryDuration": null,
  "question": "the challenge question",
  "options": ["A","B","C","D"],
  "correctAnswer": "exact match of one option",
  "difficulty": "${difficulty}",
  "hint": "subtle hint"
}]
Rules:
- Each question must be unique and different from the others
- options must have exactly 4 items
- correctAnswer must exactly match one option
${memoryExtra}`;

    const raw = await grok.chatJSON(prompt, 2000);
    let questions;
    try { questions = JSON.parse(raw.match(/\[[\s\S]*\]/)?.[0]); } catch { questions = null; }

    if (!Array.isArray(questions) || questions.length < 3) {
      return res.status(500).json({ error: 'Failed to generate session questions' });
    }

    // Validate each question
    const valid = questions.filter(q => q?.question && Array.isArray(q?.options) && q?.correctAnswer)
      .map(q => {
        if (!q.options.includes(q.correctAnswer)) q.options[0] = q.correctAnswer;
        return q;
      });

    res.json({ questions: valid.slice(0, questionCount) });
  } catch (err) {
    console.error('generateSession error:', err.message);
    res.status(500).json({ error: 'Failed to generate session' });
  }
};

// POST /api/games/challenge  (public — no auth needed to generate)
exports.generateChallenge = async (req, res) => {
  try {
    const { gameType = 'logic', difficulty = 'medium' } = req.body;
    const label = TYPE_LABELS[gameType] || 'logic reasoning';
    const isMemory = gameType === 'memory';

    const memoryExtra = isMemory
      ? `- "memorySequence": array of strings to memorize BEFORE the question (4-6 items easy, 6-8 medium, 8-10 hard)
- "question": follow-up question asked AFTER memorizing (e.g. "What was the 3rd item?")
- "memoryDuration": seconds to memorize (8 easy, 12 medium, 16 hard)`
      : `- "memorySequence": null\n- "memoryDuration": null`;

    const prompt = `Generate one unique ${difficulty} ${label} challenge.
Return ONLY valid JSON, no markdown:
{
  "type": "${gameType}",
  "memorySequence": <see rules>,
  "memoryDuration": <see rules>,
  "question": "the challenge question",
  "options": ["A","B","C","D"],
  "correctAnswer": "exact match of one option",
  "difficulty": "${difficulty}",
  "hint": "subtle hint"
}
Rules:
- options must have exactly 4 items
- correctAnswer must exactly match one option
- question must be clear and unambiguous
${memoryExtra}`;

    const raw = await grok.chatJSON(prompt, 600);
    let parsed;
    try { parsed = JSON.parse(raw.match(/\{[\s\S]*\}/)?.[0]); } catch { parsed = null; }

    if (!parsed?.question || !parsed?.options || !parsed?.correctAnswer) {
      return res.status(500).json({ error: 'Failed to generate challenge' });
    }
    if (!parsed.options.includes(parsed.correctAnswer)) {
      parsed.options[0] = parsed.correctAnswer;
    }

    res.json({ challenge: parsed });
  } catch (err) {
    console.error('generateChallenge error:', err.message);
    res.status(500).json({ error: 'Failed to generate challenge' });
  }
};

// POST /api/games/session/save  (auth required) — accepts array OR single question
exports.saveSession = async (req, res) => {
  try {
    const { gameType, difficulty, questions, challenge, correctAnswer, userAnswer, options } = req.body;

    // Normalise: single-question payload → wrap in array
    let qs = Array.isArray(questions) && questions.length > 0
      ? questions
      : [{ question: challenge, options: options || [], correctAnswer, userAnswer }];

    if (!qs[0]?.question && !qs[0]?.correctAnswer) {
      return res.status(400).json({ error: 'question data required' });
    }

    const diff = ['easy', 'medium', 'hard'].includes(difficulty) ? difficulty : 'medium';
    const scored = qs.map(q => {
      const isCorrect = (q.userAnswer ?? '').trim().toLowerCase() === (q.correctAnswer ?? '').trim().toLowerCase();
      return { ...q, isCorrect };
    });

    const correctCount = scored.filter(q => q.isCorrect).length;
    const totalCount   = scored.length;
    const totalScore   = correctCount * (DIFFICULTY_SCORE[diff] ?? 200);
    const totalXP      = correctCount * (DIFFICULTY_XP[diff] ?? 20) + Math.floor((totalCount - correctCount) * 2);

    let username = 'Anonymous';
    try {
      const user = await User.findById(req.userId).select('username name').lean();
      username = user?.username || user?.name || 'Anonymous';
    } catch {}

    const session = await GameSession.create({
      userId: req.userId,
      username,
      gameType,
      difficulty: diff,
      questions: scored,
      totalScore,
      totalXP,
      correctCount,
      totalCount,
      completed: true,
    });

    res.json({ session, totalScore, totalXP, correctCount, totalCount });
  } catch (err) {
    console.error('saveSession error:', err.message);
    res.status(500).json({ error: 'Failed to save session' });
  }
};

// GET /api/games/sessions/:userId  (auth required)
exports.getUserSessions = async (req, res) => {
  try {
    if (req.params.userId !== req.userId.toString()) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const sessions = await GameSession.find({ userId: req.userId, completed: true })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const totalGames   = sessions.length;
    const totalCorrect = sessions.reduce((s, g) => s + (g.correctCount || 0), 0);
    const totalAnswered= sessions.reduce((s, g) => s + (g.totalCount || 0), 0);
    const totalXP      = sessions.reduce((s, g) => s + (g.totalXP || 0), 0);
    const accuracy     = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

    res.json({ sessions, stats: { total: totalGames, correct: totalCorrect, accuracy, totalXP } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
};

// GET /api/games/leaderboard  (public) — paginated, page=1&pageSize=50
exports.getLeaderboard = async (req, res) => {
  try {
    const { gameType, difficulty, page = 1, pageSize = 50 } = req.query;
    const pg   = Math.max(1, parseInt(page));
    const size = Math.min(100, Math.max(1, parseInt(pageSize)));
    const skip = (pg - 1) * size;

    const match = { completed: true };
    if (gameType)   match.gameType   = gameType;
    if (difficulty) match.difficulty = difficulty;

    // Total distinct users for pagination metadata
    const totalUsers = await GameSession.distinct('userId', match).then(a => a.length);

    const leaderboard = await GameSession.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$userId',
          username:    { $first: '$username' },
          bestScore:   { $max: '$totalScore' },
          totalXP:     { $sum: '$totalXP' },
          gamesPlayed: { $sum: 1 },
          totalCorrect:{ $sum: '$correctCount' },
          totalAnswered:{ $sum: '$totalCount' },
        }
      },
      {
        $addFields: {
          accuracy: {
            $cond: [
              { $gt: ['$totalAnswered', 0] },
              { $round: [{ $multiply: [{ $divide: ['$totalCorrect', '$totalAnswered'] }, 100] }, 0] },
              0
            ]
          }
        }
      },
      { $sort: { bestScore: -1, totalXP: -1 } },
      { $skip: skip },
      { $limit: size },
      {
        $project: {
          _id: 0,
          userId: '$_id',
          username: 1,
          bestScore: 1,
          totalXP: 1,
          gamesPlayed: 1,
          accuracy: 1,
        }
      }
    ]);

    res.json({
      leaderboard,
      pagination: { page: pg, pageSize: size, total: totalUsers, totalPages: Math.ceil(totalUsers / size) },
    });
  } catch (err) {
    console.error('leaderboard error:', err.message);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
};
