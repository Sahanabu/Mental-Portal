# 📁 Project Structure - Mental Wellness Portal

## 🏗️ Organized Directory Layout

```
Mental-Portal/
│
├── frontend/                    # Frontend Application (Next.js + React)
│   ├── src/
│   │   ├── app/                # Next.js App Router Pages
│   │   │   ├── ambient/        # Ambient relaxation mode
│   │   │   ├── assessment/     # Mental wellness assessment
│   │   │   ├── auth/           # Authentication (login/register)
│   │   │   ├── breathe/        # Guided breathing exercises
│   │   │   ├── chat/           # AI chat companion
│   │   │   ├── checkin/        # Daily mood check-in
│   │   │   ├── dashboard/      # User dashboard with analytics
│   │   │   ├── history/        # Assessment history
│   │   │   ├── resources/      # Mental health resources
│   │   │   ├── layout.tsx      # Root layout
│   │   │   ├── page.tsx        # Landing page
│   │   │   └── globals.css     # Global styles
│   │   │
│   │   ├── components/         # Reusable UI Components
│   │   │   ├── ui/             # Shadcn UI components
│   │   │   ├── AssessmentCard.tsx
│   │   │   ├── BreathingAnimation.tsx
│   │   │   ├── ChatWindow.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── MoodCard.tsx
│   │   │   ├── MoodChart.tsx
│   │   │   └── Navbar.tsx
│   │   │
│   │   ├── hooks/              # Custom React Hooks
│   │   │   ├── useAuth.ts      # Authentication hook
│   │   │   └── useMood.ts      # Mood tracking hook
│   │   │
│   │   ├── services/           # API Integration
│   │   │   └── api.ts          # Axios API service
│   │   │
│   │   ├── lib/                # Utilities
│   │   │   ├── store.ts        # Zustand store
│   │   │   └── utils.ts        # Helper functions
│   │   │
│   │   └── three/              # 3D Components
│   │       └── Scene.tsx       # Three.js scene
│   │
│   ├── public/                 # Static Assets
│   │   ├── file.svg
│   │   ├── globe.svg
│   │   ├── next.svg
│   │   ├── vercel.svg
│   │   └── window.svg
│   │
│   ├── .gitignore
│   ├── components.json         # Shadcn UI config
│   ├── eslint.config.mjs       # ESLint configuration
│   ├── next.config.js          # Next.js configuration
│   ├── next-env.d.ts           # Next.js TypeScript declarations
│   ├── package.json            # Frontend dependencies
│   ├── package-lock.json
│   ├── postcss.config.mjs      # PostCSS configuration
│   └── tsconfig.json           # TypeScript configuration
│
├── backend/                     # Backend Application (Express + Node.js)
│   └── services/
│       └── server/
│           ├── config/         # Configuration Files
│           │   └── db.js       # MongoDB connection
│           │
│           ├── controllers/    # API Controllers
│           │   ├── assessmentController.js
│           │   ├── authController.js
│           │   ├── chatController.js
│           │   ├── moodController.js
│           │   └── resourcesController.js
│           │
│           ├── middleware/     # Express Middleware
│           │   └── auth.js     # JWT authentication
│           │
│           ├── models/         # MongoDB Models
│           │   ├── Assessment.js
│           │   ├── MoodLog.js
│           │   └── User.js
│           │
│           ├── routes/         # API Routes
│           │   ├── assessmentRoutes.js
│           │   ├── authRoutes.js
│           │   ├── chatRoutes.js
│           │   ├── moodRoutes.js
│           │   └── resourcesRoutes.js
│           │
│           ├── utils/          # Utility Functions
│           │   └── recommendations.js
│           │
│           ├── .env            # Environment variables
│           ├── .env.example    # Environment template
│           ├── .gitignore
│           ├── package.json    # Backend dependencies
│           ├── package-lock.json
│           ├── server.js       # Express app entry point
│           ├── test-connection.js
│           └── README.md
│
├── docs/                        # Documentation
│   ├── CHECKLIST.md            # Verification checklist
│   ├── COMPLETE_INTEGRATION.md # Full integration guide
│   ├── CONNECTION_SUMMARY.md   # Connection overview
│   ├── FRONTEND_DYNAMIC_DATA.md # Frontend data guide
│   ├── IMPLEMENTATION_SUMMARY.md
│   ├── INTEGRATION.md          # Technical architecture
│   ├── MERN_STACK_GUIDE.md     # MERN + Gemini guide
│   ├── QUICKSTART.md           # 5-minute setup
│   ├── README_CONNECTION.md    # Connection details
│   ├── README_NEW.md
│   ├── SETUP_GUIDE.md          # Detailed setup
│   ├── START_HERE.md           # Quick start
│   ├── TODO.md                 # Task list
│   └── TROUBLESHOOTING.md      # Common issues
│
├── .gitignore                   # Root gitignore
├── README.md                    # Main project README
├── start.bat                    # Start both servers
└── start-dev.bat                # Alternative start script
```

## 📂 Directory Purposes

### Frontend (`/frontend`)
Contains the entire Next.js React application with all UI components, pages, hooks, and services.

**Key Directories:**
- `src/app/` - Next.js pages using App Router
- `src/components/` - Reusable React components
- `src/hooks/` - Custom React hooks for state management
- `src/services/` - API integration with Axios
- `public/` - Static assets (images, icons)

### Backend (`/backend/services/server`)
Contains the Express.js API server with MongoDB integration and Gemini AI.

**Key Directories:**
- `controllers/` - Business logic for API endpoints
- `models/` - MongoDB schemas using Mongoose
- `routes/` - API route definitions
- `middleware/` - Authentication and validation
- `utils/` - Helper functions and AI integration

### Documentation (`/docs`)
All project documentation, guides, and setup instructions.

## 🚀 Running the Application

### Start Both Servers
```bash
start.bat
```

### Start Backend Only
```bash
cd backend\services\server
npm run dev
```

### Start Frontend Only
```bash
cd frontend
npm run dev
```

## 📦 Dependencies

### Frontend Dependencies
- Next.js 16
- React 19
- TailwindCSS
- Shadcn UI
- Framer Motion
- React Three Fiber
- Recharts
- Axios

### Backend Dependencies
- Express.js
- Mongoose
- bcrypt
- jsonwebtoken
- @google/generative-ai
- cors
- helmet
- express-rate-limit

## 🔧 Configuration Files

### Frontend Config
- `next.config.js` - Next.js configuration
- `tsconfig.json` - TypeScript settings
- `tailwind.config.js` - TailwindCSS configuration
- `components.json` - Shadcn UI configuration

### Backend Config
- `.env` - Environment variables (MongoDB, Gemini API, JWT)
- `server.js` - Express app setup

## 🌐 API Structure

```
Backend API (http://localhost:5000/api)
├── /auth
│   ├── POST /register
│   └── POST /login
├── /assessment
│   ├── POST /submit
│   └── GET /history
├── /mood
│   ├── POST /log
│   └── GET /history
├── /chat
│   └── POST /
└── /resources
    └── GET /
```

## 📊 Data Flow

```
Frontend (React)
    ↓ Axios API calls
Backend (Express)
    ↓ Mongoose ODM
MongoDB Atlas
    + Gemini AI
```

## ✅ Clean Structure Benefits

1. **Separation of Concerns** - Frontend and backend are clearly separated
2. **Easy Navigation** - Logical folder structure
3. **Scalability** - Easy to add new features
4. **Documentation** - All docs in one place
5. **Deployment** - Frontend and backend can be deployed independently

## 🎯 Next Steps

1. Navigate to `docs/START_HERE.md` for quick start
2. Check `docs/MERN_STACK_GUIDE.md` for technical details
3. Review `docs/QUICKSTART.md` for 5-minute setup

---

**Project is now organized and ready for development!** 🚀
