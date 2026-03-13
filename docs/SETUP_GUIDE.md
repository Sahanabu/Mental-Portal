# Mental Wellness Portal - Complete Setup Guide

## Prerequisites
- Node.js (v18+)
- MongoDB Atlas Account
- OpenAI API Key (optional, for AI chat)

## Step 1: MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account or sign in
3. Create a new cluster (Free tier M0 is sufficient)
4. Click "Connect" on your cluster
5. Add your IP address (or use 0.0.0.0/0 for development)
6. Create a database user with username and password
7. Copy the connection string (looks like: `mongodb+srv://<username>:<password>@cluster.mongodb.net/`)

## Step 2: Backend Configuration

1. Navigate to backend directory:
```bash
cd backend/services/server
```

2. Create `.env` file with your credentials:
```env
PORT=5000
MONGO_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/mental-wellness?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_change_in_production
OPENAI_API_KEY=sk-your-openai-api-key-here
```

3. Install dependencies (already done):
```bash
npm install
```

4. Start the backend server:
```bash
npm run dev
```

Backend should now be running on `http://localhost:5000`

## Step 3: Frontend Configuration

1. Navigate to project root:
```bash
cd ../../..
```

2. Install frontend dependencies:
```bash
npm install
```

3. Start the frontend:
```bash
npm run dev
```

Frontend should now be running on `http://localhost:3000`

## Step 4: Verify Connection

1. Open browser to `http://localhost:3000`
2. Navigate to Auth page
3. Create an account
4. Complete an assessment
5. Check MongoDB Atlas - you should see data in the `mental-wellness` database

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Assessment
- `POST /api/assessment/submit` - Submit assessment
- `GET /api/assessment/history` - Get user's assessment history

### Mood Tracking
- `POST /api/mood/log` - Log daily mood
- `GET /api/mood/history` - Get mood history (last 7 days)

### AI Chat
- `POST /api/chat` - Send message to AI companion

### Resources
- `GET /api/resources` - Get mental health resources

## Troubleshooting

### Backend won't start
- Check MongoDB connection string in `.env`
- Ensure IP is whitelisted in MongoDB Atlas
- Verify all dependencies are installed

### Frontend can't connect to backend
- Ensure backend is running on port 5000
- Check browser console for CORS errors
- Verify API base URL in `src/services/api.ts`

### AI Chat not working
- Add valid OpenAI API key to backend `.env`
- Check OpenAI account has credits
- Review backend logs for errors

## Running Both Servers

Use the provided batch file:
```bash
start-dev.bat
```

Or run manually in separate terminals:

Terminal 1 (Backend):
```bash
cd backend/services/server
npm run dev
```

Terminal 2 (Frontend):
```bash
npm run dev
```

## Environment Variables Summary

### Backend (.env)
```
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=...
OPENAI_API_KEY=...
```

### Frontend
No environment variables needed - API URL is configured in `src/services/api.ts`

## Next Steps

1. Replace placeholder MongoDB credentials
2. Add OpenAI API key for AI chat functionality
3. Test all features end-to-end
4. Deploy to production (Vercel for frontend, Railway/Render for backend)
