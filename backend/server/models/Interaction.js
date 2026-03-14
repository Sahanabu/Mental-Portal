const mongoose = require('mongoose');

const interactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['assessment', 'checkin', 'chat', 'recommendation'], required: true },
  encryptedPayload: { type: String, required: true }, // AES encrypted JSON string
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Interaction', interactionSchema);
