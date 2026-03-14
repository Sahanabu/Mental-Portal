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

const app = express();

console.log('✅ Express app created');

// Connect to MongoDB (graceful)
connectDB().catch((error) => {
  console.error('❌ Database connection failed:', error.message);
  console.log('📡 Server continuing without full DB for health/monitoring');
});

// CORS first so every response (including errors) gets CORS headers
const allowedOrigins = [
  'http://localhost:3000',
  'https://mentalportal.netlify.app',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. Postman, same-origin)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    if (/\.netlify\.app$/.test(origin) || /\.vercel\.app$/.test(origin)) return callback(null, true);
    console.log('[CORS] Rejected origin:', origin);
    callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Security middleware – allow cross-origin so CORS works with Helmet
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// OPTIONS preflight exemption for rate limiting
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    return next();
  }
  next();
});

// Rate limiting (after CORS so preflight always gets headers)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100
});
app.use('/api/', limiter);

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
app.use('/api/games', gameRoutes);

console.log('✅ All routes registered');

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Mental Wellness API is running', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running successfully on port ${PORT}`);
});
