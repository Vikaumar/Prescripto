import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

/**
 * Analyze prescription text and extract structured medicine information
 * @param {string} extractedText - OCR text from prescription
 * @returns {Object} - Structured prescription analysis
 */
export const analyzePrescription = async (extractedText) => {
  const prompt = `You are a medical assistant helping patients understand their prescriptions. 
Analyze the following prescription text and extract information in JSON format.

Prescription text:
"""
${extractedText}
"""

Return a JSON object with:
{
  "medicines": [
    {
      "name": "medicine name",
      "dosage": "dosage amount (e.g., 500mg)",
      "frequency": "how often to take (e.g., twice daily)",
      "duration": "for how long (e.g., 7 days)",
      "instructions": "special instructions (e.g., take after food)"
    }
  ],
  "diagnosis": "diagnosed condition if mentioned",
  "doctorNotes": "any additional notes from doctor",
  "simplifiedExplanation": "A simple, easy-to-understand explanation of this prescription in 2-3 sentences for a patient with no medical background. Use simple words."
}

If any field is not found, use null. Return ONLY valid JSON, no markdown.`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    // Clean response - remove markdown code blocks if present
    const cleanedResponse = response
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();
    
    return JSON.parse(cleanedResponse);
  } catch (error) {
    console.error("AI Analysis error:", error.message);
    throw new Error("Failed to analyze prescription with AI");
  }
};

/**
 * Chat with AI about prescription - helps patients ask questions
 * @param {string} message - User's question
 * @param {Object} prescriptionContext - Prescription data for context
 * @param {Array} chatHistory - Previous chat messages for context
 * @returns {string} - AI response
 */
export const chatWithAI = async (message, prescriptionContext, chatHistory = []) => {
  const contextPrompt = prescriptionContext
    ? `The patient has a prescription with the following medicines: ${JSON.stringify(prescriptionContext.medicines || [])}. 
       The simplified explanation is: ${prescriptionContext.simplifiedExplanation || "Not available"}.`
    : "No prescription context available.";

  const historyContext = chatHistory.length > 0
    ? `Previous conversation:\n${chatHistory.map(h => `${h.role}: ${h.message}`).join("\n")}\n\n`
    : "";

  const prompt = `You are a friendly, helpful medical assistant chatbot for Prescripto app. 
Your job is to help patients understand their prescriptions in simple language.

${contextPrompt}

${historyContext}

Patient's question: "${message}"

Guidelines:
- Use simple, easy-to-understand language (imagine explaining to your grandmother)
- Be warm, friendly, and reassuring
- If asked about side effects or interactions, provide general info but always recommend consulting a doctor
- Never diagnose or prescribe - only explain what's in the prescription
- Keep responses concise (2-4 sentences unless details are needed)
- If you don't know something, say so honestly

Respond naturally as a helpful assistant:`;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Chat AI error:", error.message);
    throw new Error("Failed to get AI response");
  }
};

/**
 * Get medicine information
 * @param {string} medicineName - Name of the medicine
 * @returns {Object} - Medicine details
 */
export const getMedicineInfo = async (medicineName) => {
  const prompt = `Provide information about the medicine "${medicineName}" in JSON format:

{
  "name": "medicine name",
  "genericName": "generic/scientific name",
  "uses": ["common uses"],
  "sideEffects": ["common side effects"],
  "precautions": ["important precautions"],
  "simpleExplanation": "A simple 1-2 sentence explanation of what this medicine does, for someone with no medical knowledge"
}

Return ONLY valid JSON, no markdown.`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    const cleanedResponse = response
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();
    
    return JSON.parse(cleanedResponse);
  } catch (error) {
    console.error("Medicine info error:", error.message);
    throw new Error("Failed to get medicine information");
  }
};

export default { analyzePrescription, chatWithAI, getMedicineInfo };
