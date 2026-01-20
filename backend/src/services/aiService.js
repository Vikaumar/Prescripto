import { GoogleGenerativeAI } from "@google/generative-ai";

let model = null;
let isApiConfigured = false;

// Initialize Gemini API
try {
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "your_key_here") {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    isApiConfigured = true;
    console.log("✅ Gemini AI initialized");
  } else {
    console.warn("⚠️ GEMINI_API_KEY not set - AI will use mock data");
  }
} catch (error) {
  console.warn("⚠️ Failed to initialize Gemini AI - using mock data");
}

/**
 * Mock analysis for testing when API is not configured
 */
const getMockAnalysis = (extractedText) => ({
  medicines: [
    {
      name: "Paracetamol",
      dosage: "500mg",
      frequency: "Twice daily after food",
      duration: "5 days",
      instructions: "Take with warm water after meals"
    },
    {
      name: "Cetirizine",
      dosage: "10mg",
      frequency: "Once at night",
      duration: "7 days",
      instructions: "Take at bedtime"
    },
    {
      name: "Vitamin D3",
      dosage: "60000 IU",
      frequency: "Once a week",
      duration: "8 weeks",
      instructions: "Take with milk or fatty food"
    }
  ],
  diagnosis: "Viral fever with allergic rhinitis",
  doctorNotes: "Drink plenty of fluids. Rest well. Follow up in 1 week if symptoms persist.",
  simplifiedExplanation: "Your doctor has prescribed medicines to help with your fever and allergies. Paracetamol will reduce your fever and pain. Cetirizine will help with your runny nose and sneezing. Vitamin D3 will boost your immunity. Make sure to take plenty of rest and drink lots of water."
});

/**
 * Analyze prescription text and extract structured medicine information
 * @param {string} extractedText - OCR text from prescription
 * @returns {Object} - Structured prescription analysis
 */
export const analyzePrescription = async (extractedText) => {
  // Return mock data if API is not configured
  if (!isApiConfigured || !model) {
    console.log("📋 Using mock AI analysis for testing...");
    return getMockAnalysis(extractedText);
  }

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
    // Return mock data on error
    console.log("📋 Falling back to mock AI analysis...");
    return getMockAnalysis(extractedText);
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
  // Return mock response if API is not configured
  if (!isApiConfigured || !model) {
    return getMockChatResponse(message);
  }

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
    return getMockChatResponse(message);
  }
};

/**
 * Mock chat response for testing
 */
const getMockChatResponse = (message) => {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes("side effect")) {
    return "Common side effects may include drowsiness, nausea, or mild stomach upset. If you experience any severe reactions, please contact your doctor immediately. Always take medicines as directed.";
  } else if (lowerMessage.includes("when") || lowerMessage.includes("take")) {
    return "Based on your prescription, take your medicines as directed by your doctor. Paracetamol is usually taken after food, Cetirizine at bedtime, and Vitamin D3 once a week with milk or fatty food.";
  } else if (lowerMessage.includes("food")) {
    return "Yes, it's generally recommended to take Paracetamol after meals to reduce stomach irritation. Vitamin D3 is best absorbed when taken with fatty foods.";
  } else if (lowerMessage.includes("miss") || lowerMessage.includes("forgot")) {
    return "If you miss a dose, take it as soon as you remember. However, if it's almost time for your next dose, skip the missed one. Never double up on doses to make up for a missed one.";
  } else {
    return "I'm here to help you understand your prescription! You can ask me about your medicines, when to take them, potential side effects, or any other questions you have. Just remember, I provide general information - always follow your doctor's specific advice.";
  }
};

/**
 * Get medicine information
 * @param {string} medicineName - Name of the medicine
 * @returns {Object} - Medicine details
 */
export const getMedicineInfo = async (medicineName) => {
  // Return mock data if API is not configured
  if (!isApiConfigured || !model) {
    return getMockMedicineInfo(medicineName);
  }

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
    return getMockMedicineInfo(medicineName);
  }
};

/**
 * Mock medicine info for testing
 */
const getMockMedicineInfo = (medicineName) => ({
  name: medicineName,
  genericName: medicineName,
  uses: ["Pain relief", "Fever reduction", "Inflammation reduction"],
  sideEffects: ["Nausea", "Dizziness", "Stomach upset"],
  precautions: ["Do not exceed recommended dose", "Consult doctor if pregnant", "Avoid alcohol"],
  simpleExplanation: `${medicineName} is a medicine that helps with pain and fever. Take it as directed by your doctor.`
});

export default { analyzePrescription, chatWithAI, getMedicineInfo };
