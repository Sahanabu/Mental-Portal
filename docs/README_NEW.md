# Mental Wellness Self-Assessment Portal

A modern, immersive mental wellness web application built with Next.js, featuring 3D animations, AI chat companion, and comprehensive mood tracking.

## 🌟 Features

### Core Functionality
- **Landing Page**: Scroll-based 3D storytelling with GSAP animations
- **Authentication**: Login/Signup with anonymous option
- **Self Assessment**: PHQ-9 & GAD-7 style questionnaire with progress tracking
- **Results Dashboard**: Mood visualization with charts and analytics
- **Daily Mood Check-in**: Emoji-based mood logging
- **AI Companion Chat**: Conversational mental wellness support
- **Guided Breathing**: 4-4-6 breathing exercise with animations
- **Ambient Mode**: Calming soundscapes and visual environments
- **Resources**: Mental health resources and emergency contacts

### Technical Features
- **3D Visuals**: React Three Fiber particle systems and brain models
- **Smooth Animations**: Framer Motion and GSAP ScrollTrigger
- **Modern UI**: Glassmorphism design with TailwindCSS
- **Responsive Design**: Mobile-first approach
- **API Integration**: Axios-based backend communication
- **State Management**: Custom hooks and Zustand

## 🚀 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Styling**: TailwindCSS v4
- **Components**: Shadcn UI + Radix UI
- **3D Graphics**: React Three Fiber + Drei + Three.js
- **Animations**: Framer Motion + GSAP + ScrollTrigger
- **Charts**: Recharts
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod
- **State**: Zustand

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mentalport
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── ambient/           # Ambient relaxation mode
│   ├── assessment/        # Self-assessment questionnaire
│   ├── auth/             # Authentication pages
│   ├── breathe/          # Guided breathing exercise
│   ├── chat/             # AI companion chat
│   ├── checkin/          # Daily mood check-in
│   ├── dashboard/        # Results dashboard
│   ├── resources/        # Mental health resources
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Landing page
├── components/            # Reusable components
│   ├── ui/               # Shadcn UI components
│   ├── AssessmentCard.tsx
│   ├── BreathingAnimation.tsx
│   ├── ChatWindow.tsx
│   ├── Footer.tsx
│   ├── MoodCard.tsx
│   ├── MoodChart.tsx
│   └── Navbar.tsx
├── hooks/                # Custom React hooks
│   ├── useAuth.ts
│   └── useMood.ts
├── lib/                  # Utilities
│   ├── store.ts
│   └── utils.ts
├── services/             # API services
│   └── api.ts
└── three/                # 3D components
    └── Scene.tsx
```

## 🔌 API Integration

The application is designed to work with a backend API. Configure the base URL in `src/services/api.ts`:

```typescript
const BASE_URL = 'http://localhost:5000/api';
```

### API Endpoints

- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /assessment/submit` - Submit assessment results
- `GET /assessment/history` - Get assessment history
- `POST /mood/log` - Log daily mood
- `GET /mood/history` - Get mood history
- `POST /chat` - AI chat messages
- `GET /resources` - Get mental health resources

## 🎨 Design System

### Color Palette
- **Primary**: Soft blues and purples
- **Secondary**: Calming greens and lavenders
- **Accent**: Gentle gradients
- **Background**: Light, airy tones

### Components
- **Glass Cards**: Glassmorphism with backdrop blur
- **Rounded Corners**: Consistent 2rem border radius
- **Smooth Animations**: Framer Motion transitions
- **3D Elements**: Particle systems and floating objects

## 🌐 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically

### Manual Build
```bash
npm run build
npm start
```

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### TailwindCSS
The project uses TailwindCSS v4 with custom configuration in `src/app/globals.css`.

## 📱 Mobile Support

The application is fully responsive with:
- Mobile-first design approach
- Touch-friendly interactions
- Optimized 3D performance
- Collapsible navigation

## 🧪 Development

### Adding New Pages
1. Create a new folder in `src/app/`
2. Add a `page.tsx` file
3. Update navigation in `src/components/Navbar.tsx`

### Creating Components
1. Add to `src/components/`
2. Follow the existing naming convention
3. Use TypeScript interfaces
4. Include proper styling with TailwindCSS

### 3D Development
- 3D components go in `src/three/`
- Use React Three Fiber conventions
- Optimize for performance

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the documentation
- Open an issue on GitHub
- Contact the development team

---

**Note**: This application is for educational and wellness purposes only. It is not intended to replace professional medical advice, diagnosis, or treatment.