const AssessmentSession = require('../models/AssessmentSession');
const Assessment = require('../models/Assessment');
const grok = require('./grokController');

// 7 predefined PHQ-9/GAD-7 style questions per language
const PREDEFINED_QUESTIONS = {
  en: [
    { id: 1, text: "Over the last 2 weeks, how often have you felt little interest or pleasure in doing things?", category: "Anhedonia" },
    { id: 2, text: "How often have you felt down, depressed, or hopeless?", category: "Depression" },
    { id: 3, text: "How often have you had trouble falling or staying asleep, or sleeping too much?", category: "Sleep" },
    { id: 4, text: "How often have you felt tired or had little energy?", category: "Energy" },
    { id: 5, text: "How often have you felt nervous, anxious, or on edge?", category: "Anxiety" },
    { id: 6, text: "How often have you been unable to stop or control worrying?", category: "Worry" },
    { id: 7, text: "How often have you had difficulty concentrating on things, such as reading or watching TV?", category: "Concentration" },
  ],
  hi: [
    { id: 1, text: "पिछले 2 हफ्तों में, आपको कितनी बार चीजों में कम रुचि या खुशी महसूस हुई?", category: "उदासीनता" },
    { id: 2, text: "आपको कितनी बार उदास, निराश या निराशाजनक महसूस हुआ?", category: "अवसाद" },
    { id: 3, text: "आपको कितनी बार सोने में या सोते रहने में परेशानी हुई, या बहुत ज्यादा सोए?", category: "नींद" },
    { id: 4, text: "आपको कितनी बार थका हुआ महसूस हुआ या कम ऊर्जा रही?", category: "ऊर्जा" },
    { id: 5, text: "आपको कितनी बार घबराहट, चिंता या बेचैनी महसूस हुई?", category: "चिंता" },
    { id: 6, text: "आपको कितनी बार चिंता को रोकने या नियंत्रित करने में असमर्थता महसूस हुई?", category: "फ़िक्र" },
    { id: 7, text: "आपको कितनी बार पढ़ने या टीवी देखने जैसी चीजों पर ध्यान केंद्रित करने में कठिनाई हुई?", category: "एकाग्रता" },
  ],
  kn: [
    { id: 1, text: "ಕಳೆದ 2 ವಾರಗಳಲ್ಲಿ, ನೀವು ಎಷ್ಟು ಬಾರಿ ಕೆಲಸಗಳಲ್ಲಿ ಕಡಿಮೆ ಆಸಕ್ತಿ ಅಥವಾ ಸಂತೋಷ ಅನುಭವಿಸಿದ್ದೀರಿ?", category: "ಆಸಕ್ತಿ ಕೊರತೆ" },
    { id: 2, text: "ನೀವು ಎಷ್ಟು ಬಾರಿ ಖಿನ್ನತೆ, ನಿರಾಶೆ ಅಥವಾ ಹತಾಶೆ ಅನುಭವಿಸಿದ್ದೀರಿ?", category: "ಖಿನ್ನತೆ" },
    { id: 3, text: "ನೀವು ಎಷ್ಟು ಬಾರಿ ನಿದ್ರಿಸಲು ಅಥವಾ ನಿದ್ರೆಯಲ್ಲಿ ಉಳಿಯಲು ತೊಂದರೆ ಅನುಭವಿಸಿದ್ದೀರಿ?", category: "ನಿದ್ರೆ" },
    { id: 4, text: "ನೀವು ಎಷ್ಟು ಬಾರಿ ದಣಿದಿರುವಿಕೆ ಅಥವಾ ಕಡಿಮೆ ಶಕ್ತಿ ಅನುಭವಿಸಿದ್ದೀರಿ?", category: "ಶಕ್ತಿ" },
    { id: 5, text: "ನೀವು ಎಷ್ಟು ಬಾರಿ ನರಗಳು, ಆತಂಕ ಅಥವಾ ಅಂಚಿನಲ್ಲಿ ಅನುಭವಿಸಿದ್ದೀರಿ?", category: "ಆತಂಕ" },
    { id: 6, text: "ನೀವು ಎಷ್ಟು ಬಾರಿ ಚಿಂತೆಯನ್ನು ನಿಲ್ಲಿಸಲು ಅಥವಾ ನಿಯಂತ್ರಿಸಲು ಅಸಮರ್ಥರಾಗಿದ್ದೀರಿ?", category: "ಚಿಂತೆ" },
    { id: 7, text: "ನೀವು ಎಷ್ಟು ಬಾರಿ ಓದುವುದು ಅಥವಾ ಟಿವಿ ನೋಡುವಂತಹ ಕೆಲಸಗಳಲ್ಲಿ ಗಮನ ಕೇಂದ್ರೀಕರಿಸಲು ತೊಂದರೆ ಅನುಭವಿಸಿದ್ದೀರಿ?", category: "ಏಕಾಗ್ರತೆ" },
  ],
};

const OPTIONS = {
  en: [
    { label: "Not at all", value: 0 },
    { label: "Several days", value: 1 },
    { label: "More than half the days", value: 2 },
    { label: "Nearly every day", value: 3 },
  ],
  hi: [
    { label: "बिल्कुल नहीं", value: 0 },
    { label: "कई दिन", value: 1 },
    { label: "आधे से अधिक दिन", value: 2 },
    { label: "लगभग हर दिन", value: 3 },
  ],
  kn: [
    { label: "ಇಲ್ಲವೇ ಇಲ್ಲ", value: 0 },
    { label: "ಕೆಲವು ದಿನಗಳು", value: 1 },
    { label: "ಅರ್ಧಕ್ಕಿಂತ ಹೆಚ್ಚು ದಿನಗಳು", value: 2 },
    { label: "ಬಹುತೇಕ ಪ್ರತಿದಿನ", value: 3 },
  ],
};

const LANG_INSTRUCTIONS = {
  en: 'Respond in English.',
  hi: 'Respond in Hindi (हिंदी में जवाब दें).',
  kn: 'Respond in Kannada (ಕನ್ನಡದಲ್ಲಿ ಉತ್ತರಿಸಿ).',
};

// Deterministic score: sum of 7 predefined answers (0-21) scaled to 0-27
// + up to 6 points from AI follow-up severity detection
const CATEGORY_THRESHOLDS = [
  { max: 6,  label: 'Minimal' },
  { max: 13, label: 'Mild' },
  { max: 19, label: 'Moderate' },
  { max: 27, label: 'Severe' },
];

function getCategory(score) {
  return CATEGORY_THRESHOLDS.find(t => score <= t.max)?.label || 'Severe';
}

// Scale 0-21 predefined sum to 0-21 (already in range), add follow-up bonus 0-6
function computeFinalScore(predefinedAnswers, followUpBonus) {
  const base = predefinedAnswers.reduce((s, v) => s + v, 0); // 0-21
  const scaled = Math.round((base / 21) * 21); // keep as-is
  return Math.min(27, scaled + Math.max(0, Math.min(6, followUpBonus)));
}

const FOLLOWUP_SYSTEM = (lang) =>
  `You are a compassionate mental wellness AI conducting follow-up questions after a structured assessment.
The user has already answered 7 standardized questions. Now ask 2-3 targeted follow-up questions to understand context, triggers, and severity depth.
Rules:
- Ask ONE question at a time.
- Questions should explore: duration of symptoms, impact on relationships/work, coping mechanisms, recent life events.
- Be warm, non-clinical, non-judgmental.
- ${LANG_INSTRUCTIONS[lang] || LANG_INSTRUCTIONS.en}
- After 2-3 exchanges, return the final JSON result.

ALWAYS return ONLY valid JSON:

If more questions needed:
{"type":"question","question":"your question here"}

If ready to conclude (after 2-3 exchanges):
{"type":"result","followUpBonus":0-6,"summary":"2-3 sentence emotional analysis based on ALL answers","recommendations":["rec1","rec2","rec3"],"exercises":[{"title":"","description":"","duration":"","type":"breathing|stretching|physical"}],"activities":["activity1","activity2"]}

followUpBonus: 0=no additional severity, 2=mild additional context, 4=moderate severity indicators, 6=severe additional indicators`;

const FALLBACKS = {
  en: {
    firstFollowUp: 'How long have you been experiencing these feelings?',
    continueFollowUp: 'How has this been affecting your relationships or work?',
    nextQuestion: 'How has this been affecting your daily routine?',
  },
  hi: {
    firstFollowUp: 'आप कितने समय से इन भावनाओं का अनुभव कर रहे हैं?',
    continueFollowUp: 'इसने आपके रिश्तों या काम पर कैसे असर डाला है?',
    nextQuestion: 'इसने आपकी दैनिक दिनचर्या पर कैसे असर डाला है?',
  },
  kn: {
    firstFollowUp: 'ನೀವು ಎಷ್ಟು ದಿನಗಳಿಂದ ಈ ಭಾವನೆಗಳನ್ನು ಅನುಭವಿಸುತ್ತಿದ್ದೀರಿ?',
    continueFollowUp: 'ಇದು ನಿಮ್ಮ ಸಂಬಂಧಗಳು ಅಥವಾ ಕೆಲಸಕ್ಕೆ ಹೇಗೆ ಪರಿಣಾಮ ಬಿದ್ದಿದೆ?',
    nextQuestion: 'ಇದು ನಿಮ್ಮ ದೈನಂದಿನ ಜೀವನಕ್ಕೆ ಹೇಗೆ ಪರಿಣಾಮ ಬಿದ್ದಿದೆ?',
  },
};

// POST /api/ai-assessment/start
exports.startSession = async (req, res) => {
  try {
    const { language = 'en' } = req.body;
    const lang = ['en', 'hi', 'kn'].includes(language) ? language : 'en';
    const session = new AssessmentSession({ userId: req.userId, conversation: [] });
    await session.save();

    res.json({
      sessionId: session._id,
      type: 'predefined',
      questions: PREDEFINED_QUESTIONS[lang] || PREDEFINED_QUESTIONS.en,
      options: OPTIONS[lang] || OPTIONS.en,
    });
  } catch (error) {
    console.error('Start session error:', error.message);
    res.status(500).json({ error: 'Failed to start assessment' });
  }
};

// POST /api/ai-assessment/respond
exports.respond = async (req, res) => {
  try {
    const { sessionId, message, language = 'en', predefinedAnswers, phase } = req.body;
    const lang = ['en', 'hi', 'kn'].includes(language) ? language : 'en';
    const fb = FALLBACKS[lang];
    const questions = PREDEFINED_QUESTIONS[lang] || PREDEFINED_QUESTIONS.en;

    const session = await AssessmentSession.findOne({ _id: sessionId, userId: req.userId });
    if (!session) return res.status(404).json({ error: 'Session not found' });
    if (session.completed) return res.status(400).json({ error: 'Session already completed' });

    // Phase 1: predefined answers submitted → start AI follow-up
    if (phase === 'predefined' && Array.isArray(predefinedAnswers)) {
      if (predefinedAnswers.length !== 7 || predefinedAnswers.some(v => v < 0 || v > 3)) {
        return res.status(400).json({ error: 'Invalid predefined answers' });
      }

      // Store predefined answers as a system message in conversation
      session.conversation.push({
        role: 'assistant',
        message: `[PREDEFINED_ANSWERS:${JSON.stringify(predefinedAnswers)}]`
      });
      await session.save();

      // Ask first AI follow-up question
      const baseScore = predefinedAnswers.reduce((s, v) => s + v, 0);
      const prompt = `${FOLLOWUP_SYSTEM(language)}

User's predefined assessment answers (0=Not at all, 3=Nearly every day):
${questions.map((q, i) => `${q.category}: ${predefinedAnswers[i]}/3`).join('\n')}
Base score: ${baseScore}/21

Start with your first follow-up question.`;

      const aiText = await grok.chatJSON(prompt, 400);
      let parsed;
      try { parsed = JSON.parse(aiText.match(/\{[\s\S]*\}/)?.[0]); } catch { parsed = null; }

      const question = parsed?.question || fb.firstFollowUp;
      session.conversation.push({ role: 'assistant', message: question });
      await session.save();

      return res.json({ type: 'question', question, sessionId });
    }

    // Phase 2: AI follow-up conversation
    if (phase === 'followup' && message) {
      session.conversation.push({ role: 'user', message });

      // Extract predefined answers from stored conversation
      const predefinedEntry = session.conversation.find(m => m.message.startsWith('[PREDEFINED_ANSWERS:'));
      const storedAnswers = predefinedEntry
        ? JSON.parse(predefinedEntry.message.replace('[PREDEFINED_ANSWERS:', '').replace(']', ''))
        : Array(7).fill(1);

      const baseScore = storedAnswers.reduce((s, v) => s + v, 0);
      const followUpExchanges = session.conversation.filter(m => m.role === 'user').length;
      const forceResult = followUpExchanges >= 3;

      // Build follow-up history (exclude the predefined answers entry)
      const history = session.conversation
        .filter(m => !m.message.startsWith('[PREDEFINED_ANSWERS:'))
        .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.message}`)
        .join('\n');

      const prompt = `${FOLLOWUP_SYSTEM(language)}

User's predefined assessment answers (0=Not at all, 3=Nearly every day):
${questions.map((q, i) => `${q.category}: ${storedAnswers[i]}/3`).join('\n')}
Base score: ${baseScore}/21

Follow-up conversation:
${history}

${forceResult ? 'You have enough information. Return the final result JSON now.' : 'Continue or conclude if you have enough context.'}`;

      const aiText = await grok.chatJSON(prompt, 700);
      let parsed;
      try { parsed = JSON.parse(aiText.match(/\{[\s\S]*\}/)?.[0]); } catch { parsed = null; }

      if (!parsed) {
        session.conversation.push({ role: 'assistant', message: fb.continueFollowUp });
        await session.save();
        return res.json({ type: 'question', question: fb.continueFollowUp, sessionId });
      }

      if (parsed.type === 'result' || forceResult) {
        const followUpBonus = Math.max(0, Math.min(6, Number(parsed.followUpBonus) || 0));
        const finalScore = computeFinalScore(storedAnswers, followUpBonus);
        const category = getCategory(finalScore);

        const result = {
          score: finalScore,
          category,
          summary: parsed.summary || '',
          recommendations: parsed.recommendations || [],
          exercises: parsed.exercises || [],
          musicSuggestions: [],
          videoSuggestions: [],
          activities: parsed.activities || [],
          predefinedAnswers: storedAnswers,
          followUpBonus,
        };

        session.result = result;
        session.completed = true;
        session.conversation.push({ role: 'assistant', message: `Assessment complete. Score: ${finalScore}/27 (${category})` });
        await session.save();

        await new Assessment({
          userId: req.userId,
          answers: storedAnswers,
          score: finalScore,
          category,
          recommendations: result.recommendations,
        }).save();

        return res.json({ type: 'result', result, sessionId });
      }

      const nextQuestion = parsed.question || fb.nextQuestion;
      session.conversation.push({ role: 'assistant', message: nextQuestion });
      await session.save();
      return res.json({ type: 'question', question: nextQuestion, sessionId });
    }

    return res.status(400).json({ error: 'Invalid phase or missing data' });
  } catch (error) {
    console.error('Respond error:', error.message);
    res.status(500).json({ error: 'Failed to process response' });
  }
};

// GET /api/ai-assessment/sessions
exports.getSessions = async (req, res) => {
  try {
    const sessions = await AssessmentSession.find({ userId: req.userId, completed: true })
      .sort({ createdAt: -1 })
      .select('result createdAt')
      .lean();
    res.json({ sessions });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
};
