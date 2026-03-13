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
    const { userConcerns, assessmentScore, language = 'en' } = req.body;

    const prompt = `You are a mental health resource advisor. The user has concerns about: "${userConcerns || 'general wellness'}" and their recent assessment score is ${assessmentScore || 'not provided'}.

Recommend 3 specific types of resources or support they should explore (max 120 words). Be practical and supportive.`;

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

    const prompt = `You are a mood tracking wellness coach. The user just logged their mood as "${mood}". Their recent mood pattern is: ${recentMoods?.join(', ') || 'not available'}.

Provide a brief, encouraging insight about their mood pattern (max 80 words). Be supportive and offer one actionable tip.`;

    const aiMessage = await getAIResponse(prompt, language);

    res.json({
      insight: aiMessage || "Thank you for checking in. Tracking your mood helps you understand patterns. If you're feeling low, try a short walk or reach out to someone you trust."
    });
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

    res.json({ exercises });
  } catch (error) {
    console.error('AI exercise generation error:', error.message);
    res.json({ exercises: getFallbackExercises(req.body.mood) });
  }
};

const getFallbackExercises = (mood) => {
  const exercises = {
    happy: [
      {
        title: "Energizing Breath",
        description: "Boost your positive energy with deep breathing",
        duration: "2 minutes",
        type: "breathing",
        animationType: "breathingCircle",
        animationUrl: "",
        steps: ["Inhale deeply for 4 seconds", "Hold for 2 seconds", "Exhale slowly for 4 seconds"]
      },
      {
        title: "Standing Side Stretch",
        description: "No equipment needed — open up your sides at home",
        duration: "3 minutes",
        type: "stretching",
        animationType: "gifAnimation",
        animationUrl: "/exercises/8xUv4J7.gif",
        steps: ["Stand tall with feet hip-width apart", "Raise one arm and lean to the opposite side", "Hold 10 seconds, switch sides"]
      },
      {
        title: "Bodyweight Squats",
        description: "Classic home exercise — no gym needed",
        duration: "3 minutes",
        type: "physical",
        animationType: "gifAnimation",
        animationUrl: "/exercises/6sMAmNv.gif",
        steps: ["Stand with feet shoulder-width apart", "Lower hips until thighs are parallel to floor", "Push through heels to stand back up"]
      }
    ],
    anxious: [
      {
        title: "4-7-8 Calming Breath",
        description: "Proven technique to reduce anxiety fast",
        duration: "3 minutes",
        type: "breathing",
        animationType: "breathingCircle",
        animationUrl: "",
        steps: ["Inhale for 4 seconds", "Hold for 4 seconds", "Exhale for 6 seconds"]
      },
      {
        title: "Seated Neck Rolls",
        description: "Do this anywhere — chair or floor",
        duration: "2 minutes",
        type: "stretching",
        animationType: "gifAnimation",
        animationUrl: "/exercises/7inpWch.gif",
        steps: ["Sit comfortably and drop chin to chest", "Slowly roll head to right shoulder", "Continue rolling to left, repeat 5 times"]
      },
      {
        title: "Floor Crunches",
        description: "Simple core exercise on your mat at home",
        duration: "3 minutes",
        type: "physical",
        animationType: "gifAnimation",
        animationUrl: "/exercises/6HiHHe0.gif",
        steps: ["Lie on your back, knees bent", "Place hands behind head lightly", "Lift shoulders off floor, lower slowly"]
      }
    ],
    sad: [
      {
        title: "Uplifting Breath",
        description: "Breathe in positivity, breathe out tension",
        duration: "3 minutes",
        type: "breathing",
        animationType: "breathingCircle",
        animationUrl: "",
        steps: ["Breathe in slowly for 4 seconds", "Hold and feel the calm", "Release fully for 6 seconds"]
      },
      {
        title: "Child's Pose Stretch",
        description: "Gentle floor stretch — just a yoga mat needed",
        duration: "3 minutes",
        type: "stretching",
        animationType: "gifAnimation",
        animationUrl: "/exercises/3tAXPQ6.gif",
        steps: ["Kneel on the floor and sit back on heels", "Stretch arms forward on the floor", "Rest forehead down, breathe deeply"]
      },
      {
        title: "Standing March",
        description: "Light indoor cardio to lift your mood",
        duration: "3 minutes",
        type: "physical",
        animationType: "gifAnimation",
        animationUrl: "/exercises/5bpPTHv.gif",
        steps: ["Stand in place with good posture", "Lift knees alternately to hip height", "Swing arms naturally, keep a steady pace"]
      }
    ],
    stressed: [
      {
        title: "Box Breathing",
        description: "Used by Navy SEALs to reduce stress instantly",
        duration: "4 minutes",
        type: "breathing",
        animationType: "breathingCircle",
        animationUrl: "",
        steps: ["Inhale deeply for 5 seconds", "Hold for 3 seconds", "Exhale slowly for 7 seconds"]
      },
      {
        title: "Doorway Chest Opener",
        description: "Use any doorframe at home",
        duration: "2 minutes",
        type: "stretching",
        animationType: "gifAnimation",
        animationUrl: "/exercises/8xUv4J7.gif",
        steps: ["Stand in a doorway, arms at 90 degrees on frame", "Gently lean forward until you feel chest stretch", "Hold 20 seconds, breathe deeply"]
      },
      {
        title: "Wall Push-ups",
        description: "No floor needed — do these against any wall",
        duration: "2 minutes",
        type: "physical",
        animationType: "gifAnimation",
        animationUrl: "/exercises/4dF3maG.gif",
        steps: ["Stand arm's length from wall, palms flat on it", "Bend elbows to bring chest toward wall", "Push back to start, repeat 10-15 times"]
      }
    ],
    tired: [
      {
        title: "Energizing Breath",
        description: "Wake up your body with quick breathing",
        duration: "2 minutes",
        type: "breathing",
        animationType: "breathingCircle",
        animationUrl: "",
        steps: ["Quick inhale through nose for 2 seconds", "Hold for 2 seconds", "Sharp exhale through mouth for 2 seconds"]
      },
      {
        title: "Cat-Cow Stretch",
        description: "Floor stretch to wake up your spine",
        duration: "3 minutes",
        type: "stretching",
        animationType: "gifAnimation",
        animationUrl: "/exercises/3XFdb1Z.gif",
        steps: ["Get on hands and knees on the floor", "Arch back up like a cat, tuck chin", "Drop belly down, lift head — repeat slowly"]
      },
      {
        title: "Jumping Jacks",
        description: "Classic home cardio to boost energy fast",
        duration: "2 minutes",
        type: "physical",
        animationType: "gifAnimation",
        animationUrl: "/exercises/5bpPTHv.gif",
        steps: ["Stand with feet together, arms at sides", "Jump feet out while raising arms overhead", "Jump back to start, repeat at a brisk pace"]
      }
    ],
    neutral: [
      {
        title: "Balanced Breath",
        description: "Maintain your calm and centered state",
        duration: "3 minutes",
        type: "breathing",
        animationType: "breathingCircle",
        animationUrl: "",
        steps: ["Inhale for 4 seconds", "Hold for 4 seconds", "Exhale for 4 seconds"]
      },
      {
        title: "Seated Forward Fold",
        description: "Simple hamstring stretch on the floor",
        duration: "3 minutes",
        type: "stretching",
        animationType: "gifAnimation",
        animationUrl: "/exercises/7zdxRTl.gif",
        steps: ["Sit on floor with legs straight out", "Reach hands toward your feet", "Hold the stretch for 20 seconds, breathe"]
      },
      {
        title: "Bodyweight Lunges",
        description: "No equipment — do these in your living room",
        duration: "3 minutes",
        type: "physical",
        animationType: "gifAnimation",
        animationUrl: "/exercises/6kSxYnw.gif",
        steps: ["Stand tall with feet together", "Step one foot forward and lower back knee toward floor", "Push back to start, alternate legs"]
      }
    ]
  };

  return exercises[mood] || exercises.neutral;
};
