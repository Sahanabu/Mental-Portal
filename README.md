# Mental Wellness Portal - MERN Stack Application

A comprehensive mental wellness self-assessment platform with AI-powered recommendations and real-time chat support.

## 🏗️ Project Structure

```
Mental-Portal/
├── frontend/                 # React/Next.js Frontend
│   ├── src/
│   │   ├── app/             # Next.js pages
│   │   ├── components/      # Reusable UI components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API integration
│   │   └── three/           # 3D components
│   ├── public/              # Static assets
│   └── package.json         # Frontend dependencies
│
├── backend/                 # Express.js Backend
│   └── services/
│       └── server/
│           ├── config/      # Database configuration
│           ├── controllers/ # API controllers
│           ├── models/      # MongoDB schemas
│           ├── routes/      # API routes
│           ├── middleware/  # Auth middleware
│           ├── utils/       # Helper functions
│           ├── .env         # Environment variables
│           └── server.js    # Express app
│
├── docs/                    # Documentation
│   ├── START_HERE.md       # Quick start guide
│   ├── MERN_STACK_GUIDE.md # Technical guide
│   └── ...                 # Other docs
│
└── start.bat               # Launch both servers
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account
- Google Gemini API key

### 1. Configure Backend

Edit `backend/services/server/.env`:
```env
MONGO_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/mental-wellness
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
JWT_SECRET=your_secret_key
PORT=5000
```

### 2. Install Dependencies

**Backend:**
```bash
cd backend/services/server
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### 3. Start Application

**Option 1: Use start script (Recommended)**
```bash
start.bat
```

**Option 2: Manual start**

Terminal 1 - Backend:
```bash
cd backend/services/server
npm run dev
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

### 4. Open Browser
```
http://localhost:3000
```

## 🎯 Tech Stack

### Frontend
- **Framework:** Next.js 16 (React 19)
- **Styling:** TailwindCSS
- **UI Components:** Shadcn UI
- **Animations:** Framer Motion
- **3D Graphics:** React Three Fiber
- **Charts:** Recharts
- **HTTP Client:** Axios

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB Atlas
- **ODM:** Mongoose
- **Authentication:** JWT + bcrypt
- **AI:** Google Gemini Pro
- **Security:** Helmet, CORS, Rate Limiting

## ✨ Features

### 🔐 User Authentication
- Secure registration and login
- JWT token-based authentication
- Password hashing with bcrypt
- Anonymous mode available

### 📊 Mental Wellness Assessment
- 5-question PHQ-9/GAD-7 style assessment
- Automatic score calculation (0-27 scale)
- Category determination (Minimal/Mild/Moderate/Severe)
- AI-powered personalized recommendations

### 🤖 AI Features (Google Gemini)
- **Smart Recommendations:** Personalized advice based on assessment scores
- **AI Chat Companion:** Real-time conversational support
- **Context-Aware:** Understands user needs and provides relevant guidance

### 📈 Dashboard & Analytics
- Visual score display with category badges
- Weekly mood trend charts
- AI-generated recommendations
- Progress tracking over time

### 😊 Mood Tracking
- Daily mood check-in (Happy/Neutral/Sad/Anxious)
- 7-day mood history
- Visual mood trends
- Integration with dashboard charts

### 📜 Assessment History
- View all past assessments
- Score progression timeline
- Detailed answer breakdown
- Progress statistics

### 🧘 Wellness Tools
- **Guided Breathing:** Animated breathing exercises
- **Ambient Mode:** Calming background animations
- **Resources:** Mental health helplines and support

### 💬 AI Chat Companion
- Real-time Gemini AI responses
- Supportive, non-medical guidance
- Context-aware conversations
- Typing indicators

## 📊 API Endpoints

### Authentication
```
POST /api/auth/register - Register new user
POST /api/auth/login    - Login user
```

### Assessment
```
POST /api/assessment/submit  - Submit assessment
GET  /api/assessment/history - Get assessment history
```

### Mood Tracking
```
POST /api/mood/log     - Log daily mood
GET  /api/mood/history - Get mood history (7 days)
```

### AI Chat
```
POST /api/chat - Send message to AI companion
```

### Resources
```
GET /api/resources - Get mental health resources
```

## 🗄️ Database Schema

### Users Collection
```javascript
{
  username: String,
  passwordHash: String,
  anonymous: Boolean,
  createdAt: Date
}
```

### Assessments Collection
```javascript
{
  userId: ObjectId,
  answers: [Number],
  score: Number,
  category: String,
  createdAt: Date
}
```

### MoodLogs Collection
```javascript
{
  userId: ObjectId,
  mood: String,
  createdAt: Date
}
```

## 🔐 Security Features

- ✅ Password hashing (bcrypt, 10 rounds)
- ✅ JWT authentication (7-day expiry)
- ✅ Protected API routes
- ✅ CORS configuration
- ✅ Rate limiting (100 req/15min)
- ✅ Helmet.js security headers
- ✅ Input validation

## 📚 Documentation

All documentation is in the `docs/` folder:

- **START_HERE.md** - Quick start guide
- **MERN_STACK_GUIDE.md** - Complete technical guide
- **FRONTEND_DYNAMIC_DATA.md** - Frontend integration
- **COMPLETE_INTEGRATION.md** - Full integration overview
- **QUICKSTART.md** - 5-minute setup
- **CHECKLIST.md** - Verification steps

## 🧪 Testing

### Test Backend Connection
```bash
cd backend/services/server
node test-connection.js
```

### Test Full Flow
1. Create account → Check MongoDB users collection
2. Complete assessment → Check assessments collection
3. View AI recommendations → Generated by Gemini
4. Log mood → Check moodlogs collection
5. View dashboard → Real-time mood chart
6. View history → All assessments displayed
7. Chat with AI → Gemini responds

## 🌐 Environment Variables

### Backend (.env)
```env
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_secret_key
GEMINI_API_KEY=your_gemini_key
```

### Frontend
No environment variables needed - API URL configured in `src/services/api.ts`

## 🚀 Deployment

### Frontend (Vercel)
```bash
cd frontend
vercel --prod
```

### Backend (Railway/Render)
```bash
cd backend/services/server
# Set environment variables in platform
# Deploy via Git push
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- MongoDB Atlas for cloud database
- Google Gemini for AI capabilities
- Shadcn UI for beautiful components
- Next.js team for amazing framework

## 📞 Support

For issues and questions:
- Check `docs/TROUBLESHOOTING.md`
- Review `docs/QUICKSTART.md`
- Open an issue on GitHub

---

**Built with ❤️ using MERN Stack + Google Gemini AI**

🌟 Star this repo if you find it helpful!
