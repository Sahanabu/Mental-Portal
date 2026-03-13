# Quick Start Guide - Mental Wellness Portal

## 🚀 Get Started in 5 Minutes

### Step 1: MongoDB Atlas Setup (2 minutes)

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create a free account
3. Create a free cluster (M0)
4. Click "Connect" → "Connect your application"
5. Copy your connection string

### Step 2: Configure Backend (1 minute)

1. Open `backend/services/server/.env`
2. Replace the MongoDB connection string:

```env
MONGO_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/mental-wellness?retryWrites=true&w=majority
```

Example:
```env
MONGO_URI=mongodb+srv://john:mypass123@cluster0.abc123.mongodb.net/mental-wellness?retryWrites=true&w=majority
```

### Step 3: Test Connection (30 seconds)

```bash
cd backend/services/server
node test-connection.js
```

You should see:
```
✅ MongoDB Connected Successfully!
✅ All required environment variables found
```

### Step 4: Start Everything (30 seconds)

Double-click `start-all.bat` or run:

```bash
start-all.bat
```

This will open two terminal windows:
- Backend: http://localhost:5000
- Frontend: http://localhost:3000

### Step 5: Test the App (1 minute)

1. Open http://localhost:3000
2. Click "Create Account"
3. Enter username and password
4. Complete the assessment
5. View your dashboard with AI recommendations!

## 🎯 Optional: Enable AI Chat

To enable AI-powered chat responses:

1. Get an OpenAI API key from https://platform.openai.com/api-keys
2. Add to `backend/services/server/.env`:

```env
OPENAI_API_KEY=sk-your-actual-api-key-here
```

3. Restart the backend server

## ✅ Verify Everything Works

### Test Checklist:
- [ ] Backend running on port 5000
- [ ] Frontend running on port 3000
- [ ] Can create an account
- [ ] Can complete assessment
- [ ] Dashboard shows results
- [ ] Can log mood
- [ ] Chat works (with or without AI)

## 🔧 Troubleshooting

### "MongoDB Connection Failed"
- Check your IP is whitelisted in MongoDB Atlas (Network Access)
- Verify username/password in connection string
- Try using 0.0.0.0/0 for development (allows all IPs)

### "Port 5000 already in use"
- Close any other apps using port 5000
- Or change PORT in backend/.env

### "Cannot connect to backend"
- Ensure backend is running
- Check http://localhost:5000/api/health
- Look for errors in backend terminal

## 📊 What's Connected?

```
Frontend (Next.js)
    ↓
API Service (Axios)
    ↓
Backend (Express)
    ↓
MongoDB Atlas (Cloud Database)
    ↓
OpenAI API (Optional - AI Chat)
```

## 🎉 You're All Set!

Your Mental Wellness Portal is now fully connected with:
- ✅ User authentication
- ✅ Assessment storage
- ✅ Mood tracking
- ✅ AI recommendations
- ✅ Real-time chat
- ✅ Cloud database

Enjoy building your mental wellness journey! 🌟
