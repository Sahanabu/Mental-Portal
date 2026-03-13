# Mental Wellness Self-Assessment Portal - Backend API

## Setup Instructions

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the server directory:
```
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/mental-wellness?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_here
OPENAI_API_KEY=your_openai_api_key_here
```

### 3. Run the Server
```bash
npm start
# or for development with auto-reload
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Assessment
- `POST /api/assessment/submit` - Submit assessment (Protected)
- `GET /api/assessment/history` - Get assessment history (Protected)

### Mood Tracker
- `POST /api/mood/log` - Log daily mood (Protected)
- `GET /api/mood/history` - Get last 7 days mood logs (Protected)

### AI Chat
- `POST /api/chat` - Chat with AI companion (Protected)

### Resources
- `GET /api/resources` - Get mental health resources

### Health Check
- `GET /api/health` - API health status

## Authentication
Protected routes require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

## Scoring System
- 0-4: Minimal
- 5-9: Mild
- 10-14: Moderate
- 15+: Severe

## Security Features
- JWT authentication
- bcrypt password hashing
- Helmet security headers
- CORS enabled
- Rate limiting (100 requests per 15 minutes)
