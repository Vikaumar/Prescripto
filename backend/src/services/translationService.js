import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
    throw new Error("Failed to translate text");
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
    throw new Error("Failed to translate prescription analysis");
  }
};

export default { translateText, translatePrescriptionAnalysis, SUPPORTED_LANGUAGES };
