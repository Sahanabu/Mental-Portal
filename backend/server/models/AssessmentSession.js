const mongoose = require('mongoose');

const assessmentSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  conversation: [
    {
      role: { type: String, enum: ['user', 'assistant'], required: true },
      message: { type: String, required: true },
      timestamp: { type: Date, default: Date.now }
    }
  ],
  result: {
    score: Number,
    category: { type: String, enum: ['Minimal', 'Mild', 'Moderate', 'Severe'] },
    summary: String,
    recommendations: [String],
    exercises: [mongoose.Schema.Types.Mixed],
    musicSuggestions: [mongoose.Schema.Types.Mixed],
    videoSuggestions: [mongoose.Schema.Types.Mixed],
    activities: [String]
  },
  completed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AssessmentSession', assessmentSessionSchema);
