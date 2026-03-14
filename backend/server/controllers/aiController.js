const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const getAIResponse = async (prompt, language = 'en') => {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
    return null;
  }

  try {
    const languageInstructions = {
      'en': 'Respond in English.',
      'hi': 'आपको हिंदी में जवाब देना है। सरल और स्पष्ट हिंदी का उपयोग करें। (You must respond in Hindi. Use simple and clear Hindi.)',
      'kn': 'ನೀವು ಕನ್ನಡದಲ್ಲಿ ಉತ್ತರಿಸಬೇಕು. ಸರಳ ಮತ್ತು ಸ್ಪಷ್ಟವಾದ ಕನ್ನಡವನ್ನು ಬಳಸಿ. (You must respond in Kannada. Use simple and clear Kannada.)'
    };
    const langInstruction = languageInstructions[language] || languageInstructions['en'];
    const fullPrompt = `${prompt}\n\nIMPORTANT: ${langInstruction}`;
    
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini AI error:', error.message);
    return null;
  }
};

exports.getBreathingTips = async (req, res) => {
  try {
    const { currentMood, stressLevel, language = 'en' } = req.body;

    const prompt = `You are a mindfulness and breathing expert. The user is about to do a breathing exercise. Their current mood is "${currentMood || 'neutral'}" and stress level is ${stressLevel || 'moderate'}.

Provide 3 short, personalized tips for their breathing session (max 100 words total). Be encouraging and specific to their state.`;

    const aiMessage = await getAIResponse(prompt, language);

    res.json({
      tips: aiMessage || "Focus on slow, deep breaths. Inhale for 4 counts, hold for 4, exhale for 6. Let your shoulders relax with each breath."
    });
  } catch (error) {
    console.error('AI breathing tips error:', error.message);
    res.json({
      tips: "Focus on slow, deep breaths. Inhale for 4 counts, hold for 4, exhale for 6. Let your shoulders relax with each breath."
    });
  }
};

exports.getAmbientGuidance = async (req, res) => {
  try {
    const { timeOfDay, mood, language = 'en' } = req.body;

    const prompt = `You are a relaxation and ambient wellness guide. It's ${timeOfDay || 'daytime'} and the user's mood is "${mood || 'neutral'}".

Provide a short, calming message (max 80 words) to help them relax in this ambient space. Be soothing and present-focused.`;

    const aiMessage = await getAIResponse(prompt, language);

    res.json({
      guidance: aiMessage || "Take this moment for yourself. Let the gentle movements calm your mind. There's nowhere you need to be right now. Just breathe and be present."
    });
  } catch (error) {
    console.error('AI ambient guidance error:', error.message);
    res.json({
      guidance: "Take this moment for yourself. Let the gentle movements calm your mind. There's nowhere you need to be right now. Just breathe and be present."
    });
  }
};

exports.getResourceRecommendations = async (req, res) => {
  try {
    const { language = 'en' } = req.body;
    const Assessment = require('../models/Assessment');
    const MoodLog = require('../models/MoodLog');

    const [latestAssessment, recentMoods] = await Promise.all([
      Assessment.findOne({ userId: req.userId }).sort({ createdAt: -1 }),
      MoodLog.find({ userId: req.userId }).sort({ createdAt: -1 }).limit(7)
    ]);

    const scoreInfo = latestAssessment
      ? `latest assessment score ${latestAssessment.score} (${latestAssessment.category})`
      : 'no assessment taken yet';
    const moodInfo = recentMoods.length
      ? `recent moods: ${recentMoods.map(m => m.mood).join(', ')}`
      : 'no mood logs yet';

    const prompt = `You are a mental health resource advisor. This specific user has: ${scoreInfo}. Their ${moodInfo}.

Based on their actual data, recommend 3 specific, personalised resources or actions they should explore right now (max 120 words). Be direct, practical, and tailored to their exact situation — not generic advice.`;

    const aiMessage = await getAIResponse(prompt, language);

    res.json({
      recommendations: aiMessage || "Consider exploring: 1) Local support groups for peer connection, 2) Mental health apps for daily tracking, 3) Professional counseling for personalized guidance. Remember, seeking help is a sign of strength."
    });
  } catch (error) {
    console.error('AI resource recommendations error:', error.message);
    res.json({
      recommendations: "Consider exploring: 1) Local support groups for peer connection, 2) Mental health apps for daily tracking, 3) Professional counseling for personalized guidance. Remember, seeking help is a sign of strength."
    });
  }
};

exports.getCheckinInsights = async (req, res) => {
  try {
    const { mood, recentMoods, language = 'en' } = req.body;
    const Interaction = require('../models/Interaction');

    const prompt = `You are a mood tracking wellness coach. The user just logged their mood as "${mood}". Their recent mood pattern is: ${recentMoods?.join(', ') || 'not available'}.

Provide a brief, encouraging insight about their mood pattern (max 80 words). Be supportive and offer one actionable tip.`;

    const aiMessage = await getAIResponse(prompt, language);
    const insight = aiMessage || "Thank you for checking in. Tracking your mood helps you understand patterns. If you're feeling low, try a short walk or reach out to someone you trust.";

    // Store as interaction record (plaintext insight — encrypted payload handled client-side)
    if (req.userId) {
      Interaction.create({
        userId: req.userId,
        type: 'checkin',
        encryptedPayload: JSON.stringify({ mood, insight, recentMoods, date: new Date().toISOString() })
      }).catch(() => {});
    }

    res.json({ insight });
  } catch (error) {
    console.error('AI checkin insights error:', error.message);
    res.json({
      insight: "Thank you for checking in. Tracking your mood helps you understand patterns. If you're feeling low, try a short walk or reach out to someone you trust."
    });
  }
};

exports.getHistoryAnalysis = async (req, res) => {
  try {
    const { assessments, moodLogs, language = 'en' } = req.body;

    const prompt = `You are a wellness progress analyst. The user has ${assessments?.length || 0} assessments and ${moodLogs?.length || 0} mood logs.

Recent assessment scores: ${assessments?.slice(-3).map(a => a.score).join(', ') || 'none'}.
Recent moods: ${moodLogs?.slice(-7).map(m => m.mood).join(', ') || 'none'}.

Provide a brief, encouraging analysis of their progress (max 100 words). Highlight positive trends or suggest areas for focus.`;

    const aiMessage = await getAIResponse(prompt, language);

    res.json({
      analysis: aiMessage || "Your journey is unique. Regular tracking shows self-awareness and commitment to your wellbeing. Keep noting patterns and celebrate small improvements."
    });
  } catch (error) {
    console.error('AI history analysis error:', error.message);
    res.json({
      analysis: "Your journey is unique. Regular tracking shows self-awareness and commitment to your wellbeing. Keep noting patterns and celebrate small improvements."
    });
  }
};

exports.generateExercises = async (req, res) => {
  try {
    const { mood, language = 'en' } = req.body;
    const Recommendation = require('../models/Recommendation');

    const prompt = `User mood: ${mood}

Suggest 3 HOME-FRIENDLY wellness exercises (no gym equipment needed) suitable for this mood.

Each exercise must include:
- title
- description (mention "no equipment" or "at home" or "bodyweight")
- duration
- type (breathing, stretching, or physical)
- animationType: always use "gifAnimation" for stretching and physical, "breathingCircle" for breathing only
- animationUrl: pick one from this list based on exercise type:
  stretching (home): "/exercises/7inpWch.gif" or "/exercises/8xUv4J7.gif" or "/exercises/3tAXPQ6.gif" or "/exercises/3XFdb1Z.gif" or "/exercises/7zdxRTl.gif"
  physical (home): "/exercises/6sMAmNv.gif" or "/exercises/5bpPTHv.gif" or "/exercises/4dF3maG.gif" or "/exercises/6HiHHe0.gif" or "/exercises/6kSxYnw.gif"
  breathing: leave animationUrl empty string
- steps (array of 3-4 detailed home-friendly instructions)

Return ONLY valid JSON array:
[{"title":"...","description":"...","duration":"...","type":"...","animationType":"...","animationUrl":"...","steps":["...","...","..."]}]`;

    const aiMessage = await getAIResponse(prompt, language);

    let exercises;
    try {
      const jsonMatch = aiMessage.match(/\[.*\]/s);
      exercises = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch (e) {
      exercises = null;
    }

    if (!exercises || !Array.isArray(exercises)) {
      exercises = getFallbackExercises(mood);
    }

    // Save to Recommendation collection
    if (req.userId) {
      Recommendation.create({ userId: req.userId, type: 'exercise', mood, items: exercises }).catch(() => {});
    }

    res.json({ exercises });
  } catch (error) {
    console.error('AI exercise generation error:', error.message);
    res.json({ exercises: getFallbackExercises(req.body.mood) });
  }
};

const getFallbackExercises = (mood) => {
  const exercises = {
    happy: [
      { title: "Energizing Breath", description: "Boost your positive energy with deep breathing", duration: "2 minutes", type: "breathing", animationType: "breathingCircle", animationUrl: "", steps: ["Inhale deeply for 4 seconds", "Hold for 2 seconds", "Exhale slowly for 4 seconds"] },
      { title: "Standing Side Stretch", description: "No equipment needed — open up your sides at home", duration: "3 minutes", type: "stretching", animationType: "gifAnimation", animationUrl: "/exercises/8xUv4J7.gif", steps: ["Stand tall with feet hip-width apart", "Raise one arm and lean to the opposite side", "Hold 10 seconds, switch sides"] },
      { title: "Bodyweight Squats", description: "Classic home exercise — no gym needed", duration: "3 minutes", type: "physical", animationType: "gifAnimation", animationUrl: "/exercises/6sMAmNv.gif", steps: ["Stand with feet shoulder-width apart", "Lower hips until thighs are parallel to floor", "Push through heels to stand back up"] }
    ],
    anxious: [
      { title: "4-7-8 Calming Breath", description: "Proven technique to reduce anxiety fast", duration: "3 minutes", type: "breathing", animationType: "breathingCircle", animationUrl: "", steps: ["Inhale for 4 seconds", "Hold for 4 seconds", "Exhale for 6 seconds"] },
      { title: "Seated Neck Rolls", description: "Do this anywhere — chair or floor", duration: "2 minutes", type: "stretching", animationType: "gifAnimation", animationUrl: "/exercises/7inpWch.gif", steps: ["Sit comfortably and drop chin to chest", "Slowly roll head to right shoulder", "Continue rolling to left, repeat 5 times"] },
      { title: "Floor Crunches", description: "Simple core exercise on your mat at home", duration: "3 minutes", type: "physical", animationType: "gifAnimation", animationUrl: "/exercises/6HiHHe0.gif", steps: ["Lie on your back, knees bent", "Place hands behind head lightly", "Lift shoulders off floor, lower slowly"] }
    ],
    sad: [
      { title: "Uplifting Breath", description: "Breathe in positivity, breathe out tension", duration: "3 minutes", type: "breathing", animationType: "breathingCircle", animationUrl: "", steps: ["Breathe in slowly for 4 seconds", "Hold and feel the calm", "Release fully for 6 seconds"] },
      { title: "Child's Pose Stretch", description: "Gentle floor stretch — just a yoga mat needed", duration: "3 minutes", type: "stretching", animationType: "gifAnimation", animationUrl: "/exercises/3tAXPQ6.gif", steps: ["Kneel on the floor and sit back on heels", "Stretch arms forward on the floor", "Rest forehead down, breathe deeply"] },
      { title: "Standing March", description: "Light indoor cardio to lift your mood", duration: "3 minutes", type: "physical", animationType: "gifAnimation", animationUrl: "/exercises/5bpPTHv.gif", steps: ["Stand in place with good posture", "Lift knees alternately to hip height", "Swing arms naturally, keep a steady pace"] }
    ],
    stressed: [
      { title: "Box Breathing", description: "Used by Navy SEALs to reduce stress instantly", duration: "4 minutes", type: "breathing", animationType: "breathingCircle", animationUrl: "", steps: ["Inhale deeply for 5 seconds", "Hold for 3 seconds", "Exhale slowly for 7 seconds"] },
      { title: "Doorway Chest Opener", description: "Use any doorframe at home", duration: "2 minutes", type: "stretching", animationType: "gifAnimation", animationUrl: "/exercises/8xUv4J7.gif", steps: ["Stand in a doorway, arms at 90 degrees on frame", "Gently lean forward until you feel chest stretch", "Hold 20 seconds, breathe deeply"] },
      { title: "Wall Push-ups", description: "No floor needed — do these against any wall", duration: "2 minutes", type: "physical", animationType: "gifAnimation", animationUrl: "/exercises/4dF3maG.gif", steps: ["Stand arm's length from wall, palms flat on it", "Bend elbows to bring chest toward wall", "Push back to start, repeat 10-15 times"] }
    ],
    tired: [
      { title: "Energizing Breath", description: "Wake up your body with quick breathing", duration: "2 minutes", type: "breathing", animationType: "breathingCircle", animationUrl: "", steps: ["Quick inhale through nose for 2 seconds", "Hold for 2 seconds", "Sharp exhale through mouth for 2 seconds"] },
      { title: "Cat-Cow Stretch", description: "Floor stretch to wake up your spine", duration: "3 minutes", type: "stretching", animationType: "gifAnimation", animationUrl: "/exercises/3XFdb1Z.gif", steps: ["Get on hands and knees on the floor", "Arch back up like a cat, tuck chin", "Drop belly down, lift head — repeat slowly"] },
      { title: "Jumping Jacks", description: "Classic home cardio to boost energy fast", duration: "2 minutes", type: "physical", animationType: "gifAnimation", animationUrl: "/exercises/5bpPTHv.gif", steps: ["Stand with feet together, arms at sides", "Jump feet out while raising arms overhead", "Jump back to start, repeat at a brisk pace"] }
    ],
    neutral: [
      { title: "Balanced Breath", description: "Maintain your calm and centered state", duration: "3 minutes", type: "breathing", animationType: "breathingCircle", animationUrl: "", steps: ["Inhale for 4 seconds", "Hold for 4 seconds", "Exhale for 4 seconds"] },
      { title: "Seated Forward Fold", description: "Simple hamstring stretch on the floor", duration: "3 minutes", type: "stretching", animationType: "gifAnimation", animationUrl: "/exercises/7zdxRTl.gif", steps: ["Sit on floor with legs straight out", "Reach hands toward your feet", "Hold the stretch for 20 seconds, breathe"] },
      { title: "Bodyweight Lunges", description: "No equipment — do these in your living room", duration: "3 minutes", type: "physical", animationType: "gifAnimation", animationUrl: "/exercises/6kSxYnw.gif", steps: ["Stand tall with feet together", "Step one foot forward and lower back knee toward floor", "Push back to start, alternate legs"] }
    ]
  };

  return exercises[mood] || exercises.neutral;
};

exports.generateMusicRecommendations = async (req, res) => {
  try {
    const { moodCategory, language = 'en', assessmentScore } = req.body;
    const grok = require('./grokController');
    const Recommendation = require('../models/Recommendation');

    const langLabel = language === 'hi' ? 'Hindi' : language === 'kn' ? 'Kannada' : 'English';
    const scoreContext = assessmentScore != null ? `Assessment score: ${assessmentScore}.` : '';

    const prompt = `You are a music therapist. ${scoreContext} User mood/state: "${moodCategory}". Preferred language: ${langLabel}.

Suggest exactly 3 real, well-known music tracks that genuinely help with this specific mood.
Language rules:
- Hindi: artists like Arijit Singh, Sonu Nigam, Shreya Ghoshal, A.R. Rahman
- Kannada: artists like Vijay Prakash, Rajesh Krishnan, Sonu Nigam
- English: artists like Ed Sheeran, Coldplay, Adele, Pharrell Williams, Marconi Union

Return ONLY a valid JSON array, no explanation:
[{"title":"Song title","artist":"Artist name","deezerQuery":"Song title Artist name","language":"${langLabel}","moodType":"relaxing|uplifting|calming|motivating"}]`;

    let tracks = null;
    try {
      const aiText = await grok.chatJSON(prompt);
      const match = aiText.match(/\[[\s\S]*\]/);
      if (match) tracks = JSON.parse(match[0]);
    } catch (e) { tracks = null; }

    if (!tracks || !Array.isArray(tracks) || tracks.length === 0) {
      tracks = getMusicFallback(moodCategory, language);
    }

    // Save to Recommendation collection
    if (req.userId) {
      Recommendation.create({ userId: req.userId, type: 'music', mood: moodCategory, items: tracks }).catch(() => {});
    }

    res.json({ tracks });
  } catch (error) {
    console.error('Music recommendations error:', error.message);
    res.json({ tracks: getMusicFallback(req.body.moodCategory, req.body.language) });
  }
};

const getMusicFallback = (moodCategory, language = 'en') => {
  const cat = (moodCategory || '').toLowerCase();
  if (language === 'hi') {
    return [
      { title: 'Tum Hi Ho', artist: 'Arijit Singh', deezerQuery: 'Tum Hi Ho Arijit Singh', language: 'Hindi', moodType: 'calming' },
      { title: 'Kal Ho Naa Ho', artist: 'Sonu Nigam', deezerQuery: 'Kal Ho Naa Ho Sonu Nigam', language: 'Hindi', moodType: 'uplifting' },
      { title: 'Lag Ja Gale', artist: 'Shreya Ghoshal', deezerQuery: 'Lag Ja Gale Shreya Ghoshal', language: 'Hindi', moodType: 'relaxing' },
    ];
  }
  if (language === 'kn') {
    return [
      { title: 'Ninna Nenapu', artist: 'Vijay Prakash', deezerQuery: 'Ninna Nenapu Vijay Prakash', language: 'Kannada', moodType: 'calming' },
      { title: 'Ee Hrudaya', artist: 'Vijay Prakash', deezerQuery: 'Ee Hrudaya Kannada', language: 'Kannada', moodType: 'uplifting' },
      { title: 'Bombe Helutaite', artist: 'Vijay Prakash', deezerQuery: 'Bombe Helutaite Vijay Prakash', language: 'Kannada', moodType: 'relaxing' },
    ];
  }
  if (cat.includes('severe') || cat.includes('moderate')) {
    return [
      { title: 'Fix You', artist: 'Coldplay', deezerQuery: 'Fix You Coldplay', language: 'English', moodType: 'calming' },
      { title: 'The Scientist', artist: 'Coldplay', deezerQuery: 'The Scientist Coldplay', language: 'English', moodType: 'relaxing' },
      { title: 'Weightless', artist: 'Marconi Union', deezerQuery: 'Weightless Marconi Union', language: 'English', moodType: 'calming' },
    ];
  }
  return [
    { title: 'Perfect', artist: 'Ed Sheeran', deezerQuery: 'Perfect Ed Sheeran', language: 'English', moodType: 'uplifting' },
    { title: 'Happy', artist: 'Pharrell Williams', deezerQuery: 'Happy Pharrell Williams', language: 'English', moodType: 'uplifting' },
    { title: 'Viva La Vida', artist: 'Coldplay', deezerQuery: 'Viva La Vida Coldplay', language: 'English', moodType: 'motivating' },
  ];
};

exports.generateMovieSuggestions = async (req, res) => {
  try {
    const { mood, language = 'en' } = req.body;
    const grok = require('./grokController');
    const Recommendation = require('../models/Recommendation');

    const langLabel = language === 'hi' ? 'Hindi' : language === 'kn' ? 'Kannada' : 'English';

    const prompt = `You are a movie therapist. User mood/state: "${mood}". Preferred language: ${langLabel}.

Suggest exactly 4 real, well-known movies that will make anyone smile, laugh, or feel motivated — universally loved feel-good films.
Language rules:
- Hindi: Bollywood feel-good films (e.g. 3 Idiots, Munna Bhai, Dil Chahta Hai, PK, Taare Zameen Par)
- Kannada: Kannada feel-good films (e.g. Mungaru Male, Kirik Party, Lucia, Ulidavaru Kandanthe)
- English: Hollywood feel-good films (e.g. The Pursuit of Happyness, Good Will Hunting, Soul, Up, Forrest Gump)

For each movie provide a real IMDB ID (starts with tt followed by digits).

Return ONLY valid JSON array, no explanation:
[{"title":"Movie title","year":"2023","genre":"Comedy|Drama","imdbId":"tt1234567","reason":"One sentence why this helps the mood","language":"${langLabel}"}]`;

    let movies = null;
    try {
      const aiText = await grok.chatJSON(prompt);
      const match = aiText.match(/\[[\s\S]*\]/);
      if (match) movies = JSON.parse(match[0]);
    } catch (e) { movies = null; }

    if (!movies || !Array.isArray(movies) || movies.length === 0) {
      movies = getMovieFallback(mood, language);
    }

    // Save to Recommendation collection
    if (req.userId) {
      Recommendation.create({ userId: req.userId, type: 'movie', mood, items: movies }).catch(() => {});
    }

    res.json({ movies });
  } catch (error) {
    console.error('Movie suggestions error:', error.message);
    res.json({ movies: getMovieFallback(req.body.mood, req.body.language) });
  }
};

const getMovieFallback = (mood, language = 'en') => {
  if (language === 'hi') {
    return [
      { title: '3 Idiots', year: '2009', genre: 'Comedy/Drama', imdbId: 'tt1187043', reason: 'Hilarious and deeply inspiring — will make you laugh and rethink life.', language: 'Hindi' },
      { title: 'Munna Bhai M.B.B.S.', year: '2003', genre: 'Comedy/Drama', imdbId: 'tt0374887', reason: 'Warm-hearted comedy that spreads joy and positivity.', language: 'Hindi' },
      { title: 'PK', year: '2014', genre: 'Comedy/Drama', imdbId: 'tt2338151', reason: 'Funny and thought-provoking — guaranteed to bring a smile.', language: 'Hindi' },
      { title: 'Dil Chahta Hai', year: '2001', genre: 'Comedy/Drama', imdbId: 'tt0292490', reason: 'A feel-good friendship story full of laughter and heart.', language: 'Hindi' },
    ];
  }
  if (language === 'kn') {
    return [
      { title: 'Kirik Party', year: '2016', genre: 'Comedy/Drama', imdbId: 'tt6016436', reason: 'Energetic college comedy that will have you laughing throughout.', language: 'Kannada' },
      { title: 'Mungaru Male', year: '2006', genre: 'Romance/Drama', imdbId: 'tt0839588', reason: 'A beloved feel-good classic that warms the heart.', language: 'Kannada' },
      { title: '3 Idiots', year: '2009', genre: 'Comedy/Drama', imdbId: 'tt1187043', reason: 'Universally loved — funny and uplifting for everyone.', language: 'Hindi' },
      { title: 'Soul', year: '2020', genre: 'Animation/Drama', imdbId: 'tt2948372', reason: 'A beautiful Pixar film about finding joy in everyday life.', language: 'English' },
    ];
  }
  return [
    { title: 'The Pursuit of Happyness', year: '2006', genre: 'Drama', imdbId: 'tt0454921', reason: 'An incredibly moving story of resilience that will inspire you deeply.', language: 'English' },
    { title: 'Soul', year: '2020', genre: 'Animation/Drama', imdbId: 'tt2948372', reason: 'A beautiful Pixar film about finding joy and purpose in life.', language: 'English' },
    { title: 'Good Will Hunting', year: '1997', genre: 'Drama', imdbId: 'tt0119217', reason: 'Deeply emotional and uplifting — a masterpiece about human potential.', language: 'English' },
    { title: 'Forrest Gump', year: '1994', genre: 'Drama/Comedy', imdbId: 'tt0109830', reason: 'Timeless, heartwarming, and guaranteed to make you smile.', language: 'English' },
  ];
};

exports.generateVideoRecommendations = async (req, res) => {
  try {
    const { category, score, language = 'en' } = req.body;
    const Recommendation = require('../models/Recommendation');

    const prompt = `User mental wellness score category: ${category} (score: ${score})

Suggest 3 real YouTube videos to cheer up someone feeling ${category.toLowerCase()}.
PRIORITY: At least 2 of the 3 videos MUST be funny/comedy/laughing content (stand-up comedy, funny compilations, comedy sketches, hilarious animals, bloopers).
Use only real well-known YouTube video IDs that actually exist.

Return ONLY valid JSON array:
[{"title":"...","youtubeId":"...","description":"...","category":"entertainment|laughing|relaxation|motivation"}]`;

    const aiMessage = await getAIResponse(prompt, language);
    let videos = null;
    if (aiMessage) {
      try {
        const match = aiMessage.match(/\[[\s\S]*\]/);
        if (match) videos = JSON.parse(match[0]);
      } catch (e) { videos = null; }
    }

    if (!videos || !Array.isArray(videos) || videos.length === 0) {
      videos = getFallbackVideos(category);
    }

    // Save to Recommendation collection
    if (req.userId) {
      Recommendation.create({ userId: req.userId, type: 'video', mood: category, items: videos }).catch(() => {});
    }

    res.json({ videos });
  } catch (error) {
    console.error('Video recommendations error:', error.message);
    res.json({ videos: getFallbackVideos(req.body.category) });
  }
};

const FUNNY_VIDEO_POOL = [
  { title: 'Funny Cats Compilation', youtubeId: 'J---aiyznGQ', description: 'Cats being wonderfully weird and hilarious', category: 'laughing' },
  { title: 'Sneezing Baby Panda', youtubeId: 'FzRH3iTQPrk', description: 'The most startling sneeze from the cutest panda cub', category: 'laughing' },
  { title: 'Ultimate Dog Tease', youtubeId: 'nGeKSiCQkPw', description: 'A dog reacting to food descriptions in the most hilarious way', category: 'laughing' },
  { title: 'Talking Twin Babies', youtubeId: '_JmA2ClUvUY', description: 'Twin babies having a full conversation only they understand', category: 'laughing' },
  { title: 'Gangnam Style - PSY', youtubeId: '9bZkp7q19f0', description: 'The most-watched video ever - still makes everyone laugh and dance', category: 'laughing' },
  { title: 'Fix You - Coldplay', youtubeId: 'k4V3Mo61fJM', description: 'Coldplay delivering one of the most emotionally healing songs ever written', category: 'relaxation' },
  { title: 'Someone Like You - Adele', youtubeId: 'hLQl3WQQoQ0', description: 'Adele pouring raw emotion into every word of this timeless ballad', category: 'relaxation' },
  { title: 'The Sound of Silence - Simon and Garfunkel', youtubeId: 'u9Dg-g7t2l4', description: 'A hauntingly beautiful song that speaks to the soul', category: 'relaxation' },
  { title: 'Kid President Pep Talk', youtubeId: 'l-gQLqv9f4o', description: 'The most inspiring and funny pep talk that will make you want to do something great', category: 'motivation' },
  { title: 'Happy - Pharrell Williams', youtubeId: 'ZbZSe6N_BXs', description: 'The ultimate feel-good song that makes it impossible to stay sad', category: 'motivation' },
  { title: 'Eye of the Tiger - Survivor', youtubeId: 'btPJPFnesV4', description: 'The ultimate pump-up anthem to make you feel unstoppable', category: 'motivation' },
  { title: 'Uptown Funk - Bruno Mars', youtubeId: 'OPf0YbXqDm0', description: 'Bruno Mars delivering pure feel-good energy that gets you moving', category: 'motivation' },
  { title: 'Weightless - Marconi Union', youtubeId: 'UfcAVejslrU', description: 'Scientifically proven to reduce anxiety by 65 percent - deeply calming', category: 'relaxation' },
  { title: 'Lofi Hip Hop Radio - Beats to Relax', youtubeId: 'jfKfPfyJRdk', description: 'Chill lofi beats to help you unwind and feel completely at ease', category: 'relaxation' },
  { title: 'Clair de Lune - Debussy', youtubeId: 'CvFH_6DNRCY', description: 'One of the most beautiful piano pieces ever composed, deeply soothing', category: 'relaxation' },
];

const getFallbackVideos = (category) => {
  const shuffled = [...FUNNY_VIDEO_POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3);
};
