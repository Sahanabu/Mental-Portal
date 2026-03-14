require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const assessmentRoutes = require('./routes/assessmentRoutes');
const moodRoutes = require('./routes/moodRoutes');
const chatRoutes = require('./routes/chatRoutes');
const resourcesRoutes = require('./routes/resourcesRoutes');
const aiRoutes = require('./routes/aiRoutes');
const adaptiveAssessmentRoutes = require('./routes/adaptiveAssessmentRoutes');
const dataRoutes = require('./routes/dataRoutes');
const gameRoutes = require('./routes/gameRoutes');

const app = express();\n\nconsole.log('✅ Express app created');

// Connect to MongoDB (graceful)\nconnectDB().catch((error) => {\n  console.error('❌ Database connection failed:', error.message);\n  console.log('📡 Server continuing without full DB for health/monitoring');\n});

// Security middleware
app.use(helmet());

// OPTIONS preflight exemption for rate limiting
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    console.log(`[CORS] Preflight request from ${req.headers.origin} to ${req.path}`);
    return next();
  }
  next();
});

// Rate limiting (after OPTIONS exemption)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://mentalportal.netlify.app',
    /\.vercel\.app$/,
    /\.netlify\.app$/,
    process.env.FRONTEND_URL || 'https://mentalportal.netlify.app'
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Body parser
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/assessment', assessmentRoutes);
app.use('/api/mood', moodRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/resources', resourcesRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/ai-assessment', adaptiveAssessmentRoutes);
app.use('/api', dataRoutes);
app.use('/api/games', gameRoutes);\n\nconsole.log('✅ All routes registered');

// Health check\napp.get('/api/health', (req, res) => {\n  res.json({ status: 'OK', message: 'Mental Wellness API is running', timestamp: new Date().toISOString() });\n});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

app.listen(PORT, () => {\n  console.log(`✅ Server running successfully on port ${PORT}`);\n});
