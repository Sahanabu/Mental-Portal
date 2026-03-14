const Interaction = require('../models/Interaction');

// POST /api/interactions/save
exports.save = async (req, res) => {
  try {
    const { type, encryptedPayload } = req.body;
    if (!type || !encryptedPayload) return res.status(400).json({ error: 'type and encryptedPayload required' });

    const interaction = new Interaction({ userId: req.userId, type, encryptedPayload });
    await interaction.save();

    res.json({ id: interaction._id, createdAt: interaction.createdAt });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save interaction' });
  }
};

// GET /api/interactions/user/:userId
exports.getForUser = async (req, res) => {
  try {
    // Only allow users to fetch their own data
    if (req.userId.toString() !== req.params.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { type } = req.query;
    const filter = { userId: req.userId };
    if (type) filter.type = type;

    // Return only encrypted payloads + metadata — server never decrypts
    const interactions = await Interaction.find(filter)
      .sort({ createdAt: -1 })
      .select('type encryptedPayload createdAt')
      .lean();

    res.json({ interactions });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch interactions' });
  }
};
