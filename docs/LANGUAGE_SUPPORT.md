# Multi-Language Support Configuration

## Overview
The Mental Wellness Portal now supports English, Hindi, and Kannada languages for both UI and AI responses.

## Language Files

### Location
`frontend/public/locales/`

### Available Languages
- `en.json` - English
- `hi.json` - Hindi (हिंदी)
- `kn.json` - Kannada (ಕನ್ನಡ)

## Backend API Changes

### Language Parameter
All AI-powered endpoints now accept an optional `language` parameter:
- `en` - English (default)
- `hi` - Hindi
- `kn` - Kannada

### Affected Endpoints

#### 1. Chat API
```javascript
POST /api/chat
{
  "message": "I'm feeling anxious",
  "sessionId": "session_123",
  "language": "hi"  // Optional, defaults to 'en'
}
```

#### 2. AI Controller Endpoints
```javascript
// Breathing Tips
POST /api/ai/breathing-tips
{
  "currentMood": "anxious",
  "stressLevel": "high",
  "language": "kn"
}

// Ambient Guidance
POST /api/ai/ambient-guidance
{
  "timeOfDay": "evening",
  "mood": "calm",
  "language": "hi"
}

// Resource Recommendations
POST /api/ai/resource-recommendations
{
  "userConcerns": "stress",
  "assessmentScore": 12,
  "language": "en"
}

// Check-in Insights
POST /api/ai/checkin-insights
{
  "mood": "happy",
  "recentMoods": ["happy", "neutral", "sad"],
  "language": "kn"
}

// History Analysis
POST /api/ai/history-analysis
{
  "assessments": [...],
  "moodLogs": [...],
  "language": "hi"
}
```

#### 3. Assessment Analysis
```javascript
POST /api/assessment/analyze
{
  "answers": [1, 2, 3, 2, 1, 0],
  "questions": [...],
  "language": "kn"
}
```

## Frontend Integration

### Using Language Files

```javascript
// Load language file
import en from '@/public/locales/en.json';
import hi from '@/public/locales/hi.json';
import kn from '@/public/locales/kn.json';

const translations = { en, hi, kn };

// Use in component
const [language, setLanguage] = useState('en');
const t = translations[language];

// Example usage
<h1>{t.app.title}</h1>
<button>{t.auth.login}</button>
```

### API Calls with Language

```javascript
// Chat example
const response = await axios.post('/api/chat', {
  message: userMessage,
  sessionId: currentSession,
  language: selectedLanguage  // 'en', 'hi', or 'kn'
});

// Assessment example
const result = await axios.post('/api/assessment/analyze', {
  answers: userAnswers,
  questions: assessmentQuestions,
  language: selectedLanguage
});
```

## AI Response Behavior

### How It Works
1. User selects language in frontend
2. Frontend sends `language` parameter with API requests
3. Backend appends language instruction to AI prompts
4. AI (Groq/Gemini) responds in requested language

### Language Instructions
The system uses these instructions for AI:
- English: "Respond in English."
- Hindi: "Respond in Hindi (हिंदी में जवाब दें)."
- Kannada: "Respond in Kannada (ಕನ್ನಡದಲ್ಲಿ ಉತ್ತರಿಸಿ)."

## Implementation Checklist

### Backend ✅
- [x] Chat controller language support
- [x] AI controller language support
- [x] Assessment controller language support
- [x] Recommendations utility language support

### Frontend (To Do)
- [ ] Add language selector component
- [ ] Implement i18n context/hook
- [ ] Update all components to use translations
- [ ] Pass language parameter in API calls
- [ ] Store language preference in localStorage

## Example Language Selector Component

```javascript
// components/LanguageSelector.jsx
import { useState } from 'react';

export default function LanguageSelector({ onChange }) {
  const [language, setLanguage] = useState('en');

  const handleChange = (lang) => {
    setLanguage(lang);
    onChange(lang);
    localStorage.setItem('language', lang);
  };

  return (
    <select value={language} onChange={(e) => handleChange(e.target.value)}>
      <option value="en">English</option>
      <option value="hi">हिंदी</option>
      <option value="kn">ಕನ್ನಡ</option>
    </select>
  );
}
```

## Testing

### Test Chat in Different Languages

```bash
# English
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"message": "I feel anxious", "language": "en"}'

# Hindi
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"message": "मुझे चिंता हो रही है", "language": "hi"}'

# Kannada
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"message": "ನನಗೆ ಆತಂಕವಾಗಿದೆ", "language": "kn"}'
```

## Notes

- Language defaults to English if not specified
- AI responses quality depends on the model's language capabilities
- Groq API supports multiple languages well
- All language files use UTF-8 encoding
- Frontend implementation is pending

## Next Steps

1. Create language selector UI component
2. Implement React context for language state
3. Update all frontend components to use translations
4. Add language parameter to all API calls
5. Test AI responses in all languages
