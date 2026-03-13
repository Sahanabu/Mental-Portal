const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

exports.chat = async (prompt) => {
  try {
    const completion = await openai.chat.completions.create({
      model: 'llama-3.1-8b-instant', // Correct Groq model name
      messages: [
        {
          role: "system",
          content: "You are Aura, a supportive mental wellness companion. Provide encouraging, non-medical guidance. Be empathetic. Do not diagnose or give medical advice."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 200,
      temperature: 0.7
    });
    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Groq AI error:', error.message);
    return "I'm here to support you. Let's talk about how you're feeling.";
  }
};

exports.generateQuestions = async () => {
  const prompt = `Generate exactly 6 mental health screening questions covering anxiety, depression, energy, focus, sleep, social connection. Format: "Over the last 2 weeks, how often have you...?" Scale 0-3.

Return ONLY valid JSON array:
[{"id":1, "question":"...", "category":"Anxiety"}, {"id":2,"question":"...", "category":"Depression"}...]`;

  const text = await exports.chat(prompt);
  let questions;
  try {
    questions = JSON.parse(text);
  } catch {
    questions = fallbackQuestions();
  }
  return questions;
};

exports.analyzeAnswers = async (answers, questions) => {
  const prompt = `Analyze mental health screening answers (0-3 scale):
Answers: ${JSON.stringify(answers)}
Questions: ${JSON.stringify(questions)}

Score, categorize (Minimal/Mild/Moderate/Severe), 3-4 personalized recs.

ONLY JSON:
{
  "score": number,
  "category": "Minimal|Mild|Moderate|Severe",
  "severity": "low|medium|high",
  "recommendations": ["rec1","rec2","rec3"]
}`;

  const text = await exports.chat(prompt);
  let analysis;
  try {
    analysis = JSON.parse(text);
  } catch {
    analysis = fallbackAnalysis(answers);
  }
  return analysis;
};

const fallbackQuestions = () => [
  {"id":1, "question":"Over the last 2 weeks, how often have you felt nervous, anxious, or on edge?", "category":"Anxiety"},
  {"id":2, "question":"How often have you not been able to stop or control worrying?", "category":"Worry"},
  {"id":3, "question":"How often have you felt down, depressed, or hopeless?", "category":"Mood"},
  {"id":4, "question":"How often have you felt tired or had little energy?", "category":"Energy"},
  {"id":5, "question":"How often have you had little interest in doing things?", "category":"Interest"},
  {"id":6, "question":"How often have you had trouble sleeping?", "category":"Sleep"}
];

const fallbackAnalysis = (answers) => {
  const score = answers.reduce((sum, val) => sum + val, 0);
  const category = score <= 6 ? 'Minimal' : score <= 12 ? 'Mild' : score <= 15 ? 'Moderate' : 'Severe';
  return {
    score,
    category,
    severity: score <= 6 ? 'low' : score <= 12 ? 'medium' : 'high',
    recommendations: ['Practice daily mindfulness', 'Track mood patterns', 'Guided breathing exercises', 'Seek professional support if needed']
  };
};

