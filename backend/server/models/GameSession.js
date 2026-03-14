const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  question:     { type: String, required: true },
  options:      [String],
  correctAnswer:{ type: String, required: true },
  userAnswer:   { type: String, default: null },
  isCorrect:    { type: Boolean, default: false },
}, { _id: false });

const GameSessionSchema = new mongoose.Schema({
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username:     { type: String, default: 'Anonymous' },
  gameType:     { type: String, required: true },
  difficulty:   { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  questions:    [QuestionSchema],
  totalScore:   { type: Number, default: 0 },
  totalXP:      { type: Number, default: 0 },
  correctCount: { type: Number, default: 0 },
  totalCount:   { type: Number, default: 0 },
  completed:    { type: Boolean, default: false },
  createdAt:    { type: Date, default: Date.now },
});

// Index for leaderboard queries
GameSessionSchema.index({ totalScore: -1 });
GameSessionSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('GameSession', GameSessionSchema);
