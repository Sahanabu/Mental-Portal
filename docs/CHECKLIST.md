# ✅ Mental Wellness Portal - Setup Checklist

## 📋 Pre-Setup (5 minutes)

### MongoDB Atlas Account
- [ ] Go to https://www.mongodb.com/cloud/atlas/register
- [ ] Create FREE account (no credit card)
- [ ] Create FREE cluster (M0 tier)
- [ ] Click "Connect" → "Connect your application"
- [ ] Copy connection string
- [ ] Go to "Network Access" → "Add IP Address" → "Allow Access from Anywhere"

### OpenAI Account (Optional - for AI features)
- [ ] Go to https://platform.openai.com
- [ ] Create account
- [ ] Go to API Keys section
- [ ] Create new API key
- [ ] Copy the key (starts with sk-)

## 🔧 Configuration (2 minutes)

### Backend Configuration
- [ ] Open `backend/services/server/.env`
- [ ] Replace MongoDB connection string:
  ```
  MONGO_URI=mongodb+srv://YOUR_USER:YOUR_PASS@YOUR_CLUSTER.mongodb.net/mental-wellness
  ```
- [ ] (Optional) Add OpenAI API key:
  ```
  OPENAI_API_KEY=sk-your-actual-key-here
  ```
- [ ] Save the file

## 🧪 Testing (2 minutes)

### Test Backend Connection
- [ ] Open terminal
- [ ] Run:
  ```bash
  cd backend\services\server
  node test-connection.js
  ```
- [ ] Should see: ✅ MongoDB Connected Successfully!

### Install Dependencies (if needed)
- [ ] Backend:
  ```bash
  cd backend\services\server
  npm install
  ```
- [ ] Frontend:
  ```bash
  cd ../../..
  npm install
  ```

## 🚀 Launch (1 minute)

### Start Both Servers
- [ ] Double-click `start-all.bat`
- [ ] OR run manually:
  ```bash
  # Terminal 1
  cd backend\services\server
  npm run dev
  
  # Terminal 2
  npm run dev
  ```
- [ ] Backend should show: "Server running on port 5000"
- [ ] Frontend should show: "Ready on http://localhost:3000"

## ✅ Verification (3 minutes)

### Test Frontend
- [ ] Open http://localhost:3000
- [ ] Page loads successfully
- [ ] No errors in browser console

### Test Authentication
- [ ] Click "Create Account"
- [ ] Enter username: `testuser`
- [ ] Enter password: `test123`
- [ ] Click "Sign Up"
- [ ] Should redirect to assessment page

### Test Assessment
- [ ] Answer all 5 questions
- [ ] Click "Complete"
- [ ] Should see "Analyzing..." message
- [ ] Should redirect to dashboard

### Test Dashboard
- [ ] Dashboard loads with your score
- [ ] Category badge shows (Minimal/Mild/Moderate/Severe)
- [ ] Recommendations section appears
- [ ] If OpenAI configured: AI-generated recommendations
- [ ] If not: Default recommendations
- [ ] Weekly mood chart displays

### Test Mood Check-in
- [ ] Navigate to "Daily Check-In" (or /checkin)
- [ ] Select a mood (Happy/Neutral/Sad/Anxious)
- [ ] Click "Log Mood"
- [ ] Should see success message

### Test AI Chat
- [ ] Navigate to "AI Companion" (or /chat)
- [ ] Type a message: "I'm feeling stressed"
- [ ] Press Enter or click Send
- [ ] Should see typing indicator
- [ ] Should receive response (AI or fallback)

### Test Database
- [ ] Go to MongoDB Atlas dashboard
- [ ] Click "Browse Collections"
- [ ] Should see database: `mental-wellness`
- [ ] Should see collections:
  - [ ] `users` (with your test user)
  - [ ] `assessments` (with your assessment)
  - [ ] `moodlogs` (with your mood entry)

## 🎯 Feature Checklist

### Core Features Working
- [ ] User registration
- [ ] User login
- [ ] JWT authentication
- [ ] Assessment submission
- [ ] Score calculation
- [ ] Category determination
- [ ] Recommendations display
- [ ] Dashboard visualization
- [ ] Mood logging
- [ ] Mood history
- [ ] Data persistence

### AI Features (if OpenAI configured)
- [ ] AI-generated recommendations
- [ ] AI chat responses
- [ ] Personalized suggestions

### Security Features
- [ ] Password hashing
- [ ] JWT token generation
- [ ] Protected API routes
- [ ] CORS enabled
- [ ] Rate limiting active

## 🔍 Troubleshooting Checklist

### If MongoDB Connection Fails
- [ ] Check MONGO_URI in .env is correct
- [ ] Verify username and password
- [ ] Check cluster name is correct
- [ ] Ensure IP is whitelisted in MongoDB Atlas
- [ ] Try using 0.0.0.0/0 for all IPs (dev only)

### If Backend Won't Start
- [ ] Check port 5000 is not in use
- [ ] Verify all dependencies installed (npm install)
- [ ] Check .env file exists
- [ ] Look for error messages in terminal

### If Frontend Won't Start
- [ ] Check port 3000 is not in use
- [ ] Verify all dependencies installed (npm install)
- [ ] Clear .next folder and rebuild
- [ ] Check for errors in terminal

### If API Calls Fail
- [ ] Ensure backend is running
- [ ] Check http://localhost:5000/api/health
- [ ] Verify CORS is enabled
- [ ] Check browser console for errors
- [ ] Verify JWT token is being sent

### If AI Features Don't Work
- [ ] Check OPENAI_API_KEY in .env
- [ ] Verify API key is valid
- [ ] Check OpenAI account has credits
- [ ] Look for errors in backend logs
- [ ] Fallback responses should still work

## 📊 Success Criteria

### ✅ Everything is working when:
- [ ] Both servers start without errors
- [ ] MongoDB shows "Connected" in backend logs
- [ ] Can create account and login
- [ ] Assessment saves to database
- [ ] Dashboard shows results
- [ ] Mood logging works
- [ ] Chat responds to messages
- [ ] Data persists in MongoDB Atlas
- [ ] No errors in browser console
- [ ] No errors in backend terminal

## 🎉 Final Verification

### Complete User Journey
- [ ] Open http://localhost:3000
- [ ] Create new account
- [ ] Complete assessment
- [ ] View dashboard with recommendations
- [ ] Log daily mood
- [ ] Send chat message
- [ ] Logout and login again
- [ ] Data still there (persistence verified)

### Database Verification
- [ ] MongoDB Atlas shows all collections
- [ ] User document exists
- [ ] Assessment document exists
- [ ] Mood log document exists
- [ ] All data is correctly formatted

## 📝 Notes

### What's Working
- Full-stack integration complete
- All API endpoints functional
- Database connection established
- AI integration ready
- Security implemented
- Error handling in place

### What Needs Configuration
- MongoDB Atlas connection string (REQUIRED)
- OpenAI API key (OPTIONAL - for AI features)
- IP whitelist in MongoDB Atlas (REQUIRED)

### What's Optional
- OpenAI API key (app works with fallbacks)
- Custom JWT secret (default provided)
- Port numbers (defaults: 5000, 3000)

## 🚀 Quick Commands Reference

```bash
# Test MongoDB connection
cd backend\services\server
node test-connection.js

# Start backend only
cd backend\services\server
npm run dev

# Start frontend only
npm run dev

# Start both servers
start-all.bat

# Install backend dependencies
cd backend\services\server
npm install

# Install frontend dependencies
npm install
```

## 📚 Documentation Reference

- **README_CONNECTION.md** - Complete overview
- **QUICKSTART.md** - 5-minute setup
- **SETUP_GUIDE.md** - Detailed instructions
- **INTEGRATION.md** - Technical architecture
- **TROUBLESHOOTING.md** - Common issues

---

## ✅ Checklist Complete?

If all items are checked, your Mental Wellness Portal is fully operational! 🎉

**Next Steps:**
1. Test all features thoroughly
2. Add more users and data
3. Customize recommendations
4. Deploy to production (Vercel + Railway)
5. Share with users!

**Need Help?**
- Check TROUBLESHOOTING.md
- Review backend logs
- Check browser console
- Verify MongoDB Atlas connection
- Test API endpoints individually
