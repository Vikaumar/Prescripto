import { GoogleGenerativeAI } from "@google/generative-ai";

let model = null;
let isApiConfigured = false;

// Initialize Gemini API
try {
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "your_key_here") {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    isApiConfigured = true;
  }
} catch (error) {
  console.warn("⚠️ Translation service: Gemini not available");
}

// Supported languages with their codes
export const SUPPORTED_LANGUAGES = {
  en: "English",
  hi: "Hindi",
  ta: "Tamil",
  te: "Telugu",
  bn: "Bengali",
  mr: "Marathi",
  gu: "Gujarati",
  kn: "Kannada",
  ml: "Malayalam",
  pa: "Punjabi",
  or: "Odia",
  as: "Assamese",
  ur: "Urdu",
};

// Mock translations for demo
const MOCK_TRANSLATIONS = {
  hi: {
    simplifiedExplanation: "आपके डॉक्टर ने आपके बुखार और एलर्जी के लिए दवाइयाँ दी हैं। पेरासिटामोल बुखार और दर्द कम करेगा। सेटिरिज़िन नाक बहने और छींकने में मदद करेगा। विटामिन डी3 आपकी प्रतिरक्षा बढ़ाएगा।",
    frequency: "दिन में दो बार खाने के बाद",
    duration: "5 दिन",
    instructions: "गर्म पानी के साथ खाने के बाद लें"
  },
  ta: {
    simplifiedExplanation: "உங்கள் மருத்துவர் காய்ச்சல் மற்றும் ஒவ்வாமைக்கு மருந்துகளை பரிந்துரைத்துள்ளார். பாராசிட்டமால் காய்ச்சல் மற்றும் வலியை குறைக்கும். செட்டிரிசின் மூக்கு ஒழுகுதல் மற்றும் தும்மலுக்கு உதவும்.",
    frequency: "தினமும் இரண்டு முறை உணவுக்குப் பிறகு",
    duration: "5 நாட்கள்",
    instructions: "சாப்பிட்ட பிறகு வெதுவெதுப்பான நீரில் எடுத்துக் கொள்ளுங்கள்"
  },
  te: {
    simplifiedExplanation: "మీ డాక్టర్ మీ జ్వరం మరియు అలర్జీలకు మందులు ఇచ్చారు. పారాసెటమాల్ జ్వరం మరియు నొప్పిని తగ్గిస్తుంది. సెటిరిజిన్ ముక్కు కారడం మరియు తుమ్ములకు సహాయపడుతుంది.",
    frequency: "రోజుకు రెండుసార్లు భోజనం తర్వాత",
    duration: "5 రోజులు",
    instructions: "భోజనం తర్వాత వెచ్చని నీటితో తీసుకోండి"
  },
  bn: {
    simplifiedExplanation: "আপনার ডাক্তার আপনার জ্বর এবং অ্যালার্জির জন্য ওষুধ দিয়েছেন। প্যারাসিটামল জ্বর এবং ব্যথা কমাবে। সেটিরিজিন সর্দি এবং হাঁচিতে সাহায্য করবে।",
    frequency: "দিনে দুবার খাবারের পরে",
    duration: "৫ দিন",
    instructions: "খাবারের পরে গরম জলের সাথে নিন"
  }
};

/**
 * Get mock translation for a language
 */
const getMockTranslation = (text, targetLanguage) => {
  const mock = MOCK_TRANSLATIONS[targetLanguage];
  if (mock && mock.simplifiedExplanation) {
    return mock.simplifiedExplanation;
  }
  // Return original with language indicator
  return `[${SUPPORTED_LANGUAGES[targetLanguage]}] ${text}`;
};

/**
 * Translate text to target language
 * @param {string} text - Text to translate
 * @param {string} targetLanguage - Language code (e.g., 'hi' for Hindi)
 * @returns {string} - Translated text
 */
export const translateText = async (text, targetLanguage) => {
  const languageName = SUPPORTED_LANGUAGES[targetLanguage];
  
  if (!languageName) {
    throw new Error(`Unsupported language: ${targetLanguage}. Supported: ${Object.keys(SUPPORTED_LANGUAGES).join(", ")}`);
  }

  if (targetLanguage === "en") {
    return text; // No translation needed
  }

  // Use mock if API not configured
  if (!isApiConfigured || !model) {
    console.log(`📋 Using mock translation for ${languageName}...`);
    return getMockTranslation(text, targetLanguage);
  }

  const prompt = `Translate the following medical/prescription text to ${languageName}. 
Keep medical terms simple and understandable. 
Maintain the same meaning and structure.
If there are medicine names, keep them in English but translate the instructions.

Text to translate:
"""
${text}
"""

Provide ONLY the translated text, nothing else.`;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error("Translation error:", error.message);
    // Fallback to mock
    return getMockTranslation(text, targetLanguage);
  }
};

/**
 * Translate prescription analysis to target language
 * @param {Object} analysis - Prescription analysis object
 * @param {string} targetLanguage - Language code
 * @returns {Object} - Translated analysis
 */
export const translatePrescriptionAnalysis = async (analysis, targetLanguage) => {
  if (targetLanguage === "en") {
    return analysis;
  }

  const languageName = SUPPORTED_LANGUAGES[targetLanguage];
  
  if (!languageName) {
    throw new Error(`Unsupported language: ${targetLanguage}`);
  }

  // Use mock if API not configured
  if (!isApiConfigured || !model) {
    console.log(`📋 Using mock translation for ${languageName}...`);
    return getMockPrescriptionTranslation(analysis, targetLanguage);
  }

  const prompt = `Translate the following prescription analysis to ${languageName}.
Keep medicine names in English, but translate all instructions, explanations, and other text.
Maintain the exact same JSON structure.

JSON to translate:
${JSON.stringify(analysis, null, 2)}

Return ONLY valid JSON with the same structure, no markdown.`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    const cleanedResponse = response
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();
    
    return JSON.parse(cleanedResponse);
  } catch (error) {
    console.error("Translation error:", error.message);
    // Fallback to mock
    return getMockPrescriptionTranslation(analysis, targetLanguage);
  }
};

/**
 * Mock prescription translation
 */
const getMockPrescriptionTranslation = (analysis, targetLanguage) => {
  const mock = MOCK_TRANSLATIONS[targetLanguage] || {};
  const langName = SUPPORTED_LANGUAGES[targetLanguage];
  
  return {
    ...analysis,
    simplifiedExplanation: mock.simplifiedExplanation || `[${langName}] ${analysis?.simplifiedExplanation || ""}`,
    medicines: (analysis?.medicines || []).map(med => ({
      ...med,
      frequency: mock.frequency || `[${langName}] ${med.frequency || ""}`,
      duration: mock.duration || `[${langName}] ${med.duration || ""}`,
      instructions: mock.instructions || `[${langName}] ${med.instructions || ""}`,
    }))
  };
};

export default { translateText, translatePrescriptionAnalysis, SUPPORTED_LANGUAGES };
