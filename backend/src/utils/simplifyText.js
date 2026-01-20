import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

/**
 * Simplify medical terms to everyday language
 * @param {string} text - Text with medical jargon
 * @returns {string} - Simplified text
 */
export const simplifyMedicalTerms = async (text) => {
  const prompt = `Rewrite the following medical text in simple, everyday language that anyone can understand.
- Replace medical jargon with simple words
- Keep medicine names as-is
- Explain what things mean in parentheses if needed
- Keep it concise

Medical text:
"""
${text}
"""

Simplified version:`;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error("Simplify text error:", error.message);
    throw new Error("Failed to simplify text");
  }
};

/**
 * Explain a medical term simply
 * @param {string} term - Medical term to explain
 * @returns {string} - Simple explanation
 */
export const explainMedicalTerm = async (term) => {
  const prompt = `Explain the medical term "${term}" in one simple sentence that a 10-year-old could understand. No jargon.`;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error("Explain term error:", error.message);
    throw new Error("Failed to explain term");
  }
};

export default { simplifyMedicalTerms, explainMedicalTerm };
