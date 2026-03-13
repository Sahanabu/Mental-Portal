# Mental Wellness Portal - Full Stack Integration

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (Next.js)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │   Auth   │  │Assessment│  │Dashboard │  │   Chat   │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  │
│       └─────────────┴─────────────┴─────────────┘         │
│                         │                                   │
│                   API Service (Axios)                       │
└─────────────────────────┬───────────────────────────────────┘
                          │ HTTP/REST
┌─────────────────────────┴───────────────────────────────────┐
│                   BACKEND (Express.js)                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              API Routes & Controllers                 │  │
│  │  /auth  /assessment  /mood  /chat  /resources       │  │
│  └──────────────────────────────────────────────────────┘  │
│                          │                                  │
│  ┌──────────────┐   ┌────────────┐   ┌─────────────────┐ │
│  │ JWT Auth     │   │ AI Engine  │   │ Recommendations │ │
│  │ Middleware   │   │ (OpenAI)   │   │ Engine          │ │
│  └──────────────┘   └────────────┘   └─────────────────┘ │
└─────────────────────────┬───────────────────────────────────┘
                          │ Mongoose ODM
┌─────────────────────────┴───────────────────────────────────┐
│                   MongoDB Atlas (Cloud)                     │
│  ┌──────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │  Users   │  │ Assessments  │  │  Mood Logs   │        │
│  └──────────┘  └──────────────┘  └──────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

## 🔌 API Integration Points

### 1. Authentication Flow

**Frontend → Backend → MongoDB**

```javascript
// Frontend: src/app/auth/page.tsx
const response = await authAPI.register({ name, email, password });
tokenManager.setToken(response.data.token);

// Backend: controllers/authController.js
const passwordHash = await bcrypt.hash(password, 10);
const user = new User({ username, passwordHash });
await user.save();
const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

// MongoDB: Stores user document
{
  _id: ObjectId,
  username: String,
  passwordHash: String,
  createdAt: Date
}
```

### 2. Assessment Submission Flow

**Frontend → Backend → AI → MongoDB**

```javascript
// Frontend: src/app/assessment/page.tsx
const response = await assessmentAPI.submit({ answers, totalScore });
localStorage.setItem('lastAssessment', JSON.stringify(response.data));

// Backend: controllers/assessmentController.js
const score = answers.reduce((sum, val) => sum + val, 0);
const category = calculateCategory(score);
const recommendations = await getAIRecommendations(category, score);

// AI: utils/recommendations.js
const completion = await openai.chat.completions.create({
  model: 'gpt-3.5-turbo',
  messages: [{ role: 'system', content: '...' }]
});

// MongoDB: Stores assessment
{
  _id: ObjectId,
  userId: ObjectId,
  answers: [Number],
  score: Number,
  category: String,
  createdAt: Date
}
```

### 3. Mood Tracking Flow

**Frontend → Backend → MongoDB**

```javascript
// Frontend: src/app/checkin/page.tsx
const result = await moodAPI.log({ mood, date });

// Backend: controllers/moodController.js
const moodLog = new MoodLog({ userId: req.userId, mood });
await moodLog.save();

// MongoDB: Stores mood log
{
  _id: ObjectId,
  userId: ObjectId,
  mood: String,
  createdAt: Date
}
```

### 4. AI Chat Flow

**Frontend → Backend → OpenAI → Frontend**

```javascript
// Frontend: src/app/chat/page.tsx
const response = await chatAPI.sendMessage(messageText);
const botMessage = response.data.message;

// Backend: controllers/chatController.js
const completion = await openai.chat.completions.create({
  model: 'gpt-3.5-turbo',
  messages: [
    { role: 'system', content: 'You are a supportive mental wellness companion...' },
    { role: 'user', content: message }
  ]
});
```

## 🔐 Security Features

### JWT Authentication
- Tokens expire in 7 days
- Stored in localStorage
- Automatically attached to requests via Axios interceptor

### Password Security
- Hashed with bcrypt (10 rounds)
- Never stored in plain text
- Validated on login

### API Security
- Helmet.js for HTTP headers
- CORS enabled
- Rate limiting (100 requests per 15 minutes)
- Protected routes require valid JWT

## 📡 API Endpoints

### Authentication
```
POST /api/auth/register
Body: { username, password, anonymous? }
Response: { token, userId, message }

POST /api/auth/login
Body: { username, password }
Response: { token, userId, message }
```

### Assessment
```
POST /api/assessment/submit
Headers: { Authorization: Bearer <token> }
Body: { answers: [Number] }
Response: { score, category, recommendations, assessmentId }

GET /api/assessment/history
Headers: { Authorization: Bearer <token> }
Response: { assessments: [...] }
```

### Mood Tracking
```
POST /api/mood/log
Headers: { Authorization: Bearer <token> }
Body: { mood: 'happy'|'neutral'|'sad'|'anxious' }
Response: { message, moodLog }

GET /api/mood/history
Headers: { Authorization: Bearer <token> }
Response: { moodLogs: [...] }
```

### AI Chat
```
POST /api/chat
Headers: { Authorization: Bearer <token> }
Body: { message: String }
Response: { message: String }
```

### Resources
```
GET /api/resources
Response: { resources: [...] }
```

## 🤖 AI Integration

### Assessment Recommendations
- Uses OpenAI GPT-3.5-turbo
- Generates personalized recommendations based on score and category
- Fallback to rule-based recommendations if AI unavailable

### Chat Companion
- Real-time AI responses
- Supportive, non-medical guidance
- Context-aware conversations
- Fallback to predefined responses if AI unavailable

## 💾 Data Models

### User Schema
```javascript
{
  username: String (required, unique),
  passwordHash: String (required),
  anonymous: Boolean (default: false),
  createdAt: Date (default: now)
}
```

### Assessment Schema
```javascript
{
  userId: ObjectId (ref: User),
  answers: [Number] (required),
  score: Number (required),
  category: String (enum: Minimal|Mild|Moderate|Severe),
  createdAt: Date (default: now)
}
```

### MoodLog Schema
```javascript
{
  userId: ObjectId (ref: User),
  mood: String (enum: happy|neutral|sad|anxious),
  createdAt: Date (default: now)
}
```

## 🔄 State Management

### Frontend State
- **Zustand**: Global state (optional, configured in lib/store.ts)
- **React Hooks**: Local component state
- **localStorage**: Token persistence, last assessment cache

### Backend State
- **MongoDB**: Persistent data storage
- **JWT**: Stateless authentication
- **In-memory**: Rate limiting counters

## 🚀 Deployment Guide

### Frontend (Vercel)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Backend (Railway/Render)
```bash
# Set environment variables
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_secret_key
OPENAI_API_KEY=your_openai_key
PORT=5000

# Deploy
git push railway main
```

### MongoDB Atlas
- Already cloud-hosted
- No deployment needed
- Configure IP whitelist for production

## 📊 Data Flow Examples

### Complete User Journey

1. **Registration**
   ```
   User → Frontend → POST /api/auth/register → Backend → MongoDB
   ← JWT Token ← Response ← Backend ← MongoDB
   ```

2. **Assessment**
   ```
   User → Frontend → POST /api/assessment/submit → Backend → OpenAI
   → MongoDB → Backend → Frontend → Dashboard
   ```

3. **Mood Check-in**
   ```
   User → Frontend → POST /api/mood/log → Backend → MongoDB
   ← Success ← Response ← Backend
   ```

4. **AI Chat**
   ```
   User → Frontend → POST /api/chat → Backend → OpenAI
   ← AI Response ← Backend ← OpenAI
   ```

## 🧪 Testing

### Test Backend Connection
```bash
cd backend/services/server
node test-connection.js
```

### Test API Endpoints
```bash
# Health check
curl http://localhost:5000/api/health

# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test123"}'
```

### Test Frontend
```bash
npm run dev
# Open http://localhost:3000
```

## 📈 Monitoring & Logs

### Backend Logs
- MongoDB connection status
- API request logs
- Error stack traces
- AI service status

### Frontend Logs
- API call status (browser console)
- Authentication state
- Error boundaries

## 🔧 Configuration Files

### Backend
- `.env` - Environment variables
- `server.js` - Express app setup
- `config/db.js` - MongoDB connection

### Frontend
- `src/services/api.ts` - Axios configuration
- `next.config.js` - Next.js settings
- `tailwind.config.js` - Styling

## 🎯 Key Features Implemented

✅ User authentication with JWT
✅ Secure password hashing
✅ Assessment submission and storage
✅ AI-powered recommendations
✅ Mood tracking and history
✅ Real-time AI chat companion
✅ Protected API routes
✅ Error handling and fallbacks
✅ Responsive design
✅ Cloud database integration

## 📝 Environment Variables

### Backend (.env)
```env
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_secret_key
OPENAI_API_KEY=sk-...
```

### Frontend
No environment variables needed - API URL configured in `src/services/api.ts`

## 🎉 Success Indicators

Your integration is working when:
- ✅ Users can register and login
- ✅ Assessments are saved to MongoDB
- ✅ Dashboard shows personalized recommendations
- ✅ Mood logs are tracked over time
- ✅ AI chat responds to messages
- ✅ Data persists across sessions
- ✅ All features work without errors

---

**Built with ❤️ using Next.js, Express, MongoDB Atlas, and OpenAI**
