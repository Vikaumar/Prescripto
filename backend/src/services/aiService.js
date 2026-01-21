import { GoogleGenerativeAI } from "@google/generative-ai";

let model = null;
let isApiConfigured = false;

// Initialize Gemini API
try {
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "your_key_here") {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    isApiConfigured = true;
    console.log("✅ Gemini AI initialized");
  } else {
    console.warn("⚠️ GEMINI_API_KEY not set - AI will use basic parsing");
  }
} catch (error) {
  console.warn("⚠️ Failed to initialize Gemini AI - using basic parsing");
}

/**
 * Basic parsing fallback - extracts medicines from OCR text using regex patterns
 * Used when AI API is unavailable or rate limited
 */
const parseOCRTextBasic = (extractedText) => {
  console.log("📋 Using basic text parsing (AI unavailable)...");
  
  const medicines = [];
  const text = extractedText.toLowerCase();
  const lines = extractedText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  // Common medicine patterns to look for
  const medicinePatterns = [
    /(\w+(?:\s+\w+)?)\s*(\d+\s*(?:mg|ml|g|mcg|iu|units?))/gi,
    /(?:tab|tablet|cap|capsule|syrup|injection|inj|cream)\s*[.:]*\s*(\w+)/gi,
  ];
  
  // Dosage patterns
  const dosagePatterns = [
    /(\d+\s*(?:mg|ml|g|mcg|iu))/gi,
    /(\d+(?:\/\d+)?)\s*(?:times?|x)\s*(?:a\s*)?(?:day|daily)/gi,
  ];
  
  // Look for medicine-like entries
  lines.forEach(line => {
    const lowerLine = line.toLowerCase();
    
    // Skip header-like lines
    if (lowerLine.includes('dr.') || lowerLine.includes('doctor') || 
        lowerLine.includes('patient') || lowerLine.includes('date') ||
        lowerLine.includes('hospital') || lowerLine.includes('clinic')) {
      return;
    }
    
    // Check for medicine indicators
    if (lowerLine.includes('mg') || lowerLine.includes('ml') || 
        lowerLine.includes('tablet') || lowerLine.includes('capsule') ||
        lowerLine.includes('syrup') || lowerLine.includes('daily') ||
        lowerLine.includes('times') || lowerLine.includes('iu')) {
      
      // Try to extract medicine name (usually before the dosage)
      const match = line.match(/^([A-Za-z]+(?:\s+[A-Za-z]+)?)\s+(\d+\s*(?:mg|ml|mcg|iu|g))/i);
      if (match) {
        medicines.push({
          name: match[1].trim(),
          dosage: match[2].trim(),
          frequency: extractFrequency(line) || "As prescribed",
          duration: extractDuration(line) || "As advised",
          instructions: line
        });
      }
    }
  });
  
  // Look for diagnosis
  let diagnosis = null;
  const diagnosisMatch = extractedText.match(/(?:diagnosis|dx|condition)[:\s]*([^\n]+)/i);
  if (diagnosisMatch) {
    diagnosis = diagnosisMatch[1].trim();
  }
  
  return {
    medicines: medicines.length > 0 ? medicines : [{
      name: "Unable to parse medicines",
      dosage: "N/A",
      frequency: "Please consult your doctor",
      duration: "N/A",
      instructions: "The OCR text was captured but medicine names couldn't be automatically parsed."
    }],
    diagnosis: diagnosis || "Could not determine diagnosis from prescription",
    doctorNotes: null,
    simplifiedExplanation: `We found ${medicines.length} medicine(s) in your prescription. ${diagnosis ? `The diagnosis appears to be: ${diagnosis}.` : ''} Please review the extracted text below and consult your doctor for clarification.`
  };
};

// Helper functions for basic parsing
const extractFrequency = (text) => {
  const patterns = [
    /(\d+)\s*times?\s*(?:a\s*)?(?:day|daily)/i,
    /(once|twice|thrice)\s*(?:a\s*)?(?:day|daily)/i,
    /(morning|evening|night|bedtime)/i,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[0];
  }
  return null;
};

const extractDuration = (text) => {
  const match = text.match(/(?:for\s+)?(\d+)\s*(?:days?|weeks?|months?)/i);
  return match ? match[0] : null;
};

/**
 * Analyze prescription text and extract structured medicine information
 * @param {string} extractedText - OCR text from prescription
 * @returns {Object} - Structured prescription analysis
 */
export const analyzePrescription = async (extractedText) => {
  // If API not configured, use basic parsing
  if (!isApiConfigured || !model) {
    return parseOCRTextBasic(extractedText);
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
    
    // Check if it's a rate limit error
    if (error.message.includes('retry') || error.message.includes('quota') || error.message.includes('429')) {
      console.log("⚠️ Gemini rate limited - using basic parsing fallback");
    }
    
    // Fallback to basic parsing when API fails
    return parseOCRTextBasic(extractedText);
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
  // Use smart fallback if API not configured
  if (!isApiConfigured || !model) {
    return getSmartChatResponse(message, prescriptionContext);
  }

  const contextPrompt = prescriptionContext
    ? `The patient has a prescription with the following medicines: ${JSON.stringify(prescriptionContext.medicines || [])}. 
       The diagnosis is: ${prescriptionContext.diagnosis || "Not specified"}.
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
    return getSmartChatResponse(message, prescriptionContext);
  }
};

/**
 * Smart chat response that uses prescription context
 */
const getSmartChatResponse = (message, prescriptionContext) => {
  const lowerMessage = message.toLowerCase();
  const medicines = prescriptionContext?.medicines || [];
  const diagnosis = prescriptionContext?.diagnosis || "not specified";
  
  if (lowerMessage.includes("diagnosis") || lowerMessage.includes("condition") || lowerMessage.includes("what do i have")) {
    return `Based on your prescription, your diagnosis appears to be: ${diagnosis}. Please consult your doctor for more details about your condition.`;
  }
  
  if (lowerMessage.includes("medicine") || lowerMessage.includes("what") && lowerMessage.includes("take")) {
    if (medicines.length > 0) {
      const medList = medicines.map(m => `${m.name} (${m.dosage})`).join(", ");
      return `Your prescription includes: ${medList}. Please check the medicine cards above for detailed instructions on how to take each one.`;
    }
    return "I couldn't find specific medicine details in your prescription. Please check the extracted text or consult your doctor.";
  }
  
  if (lowerMessage.includes("side effect")) {
    return "Common side effects vary by medicine. For your specific medicines, please consult the package insert or ask your pharmacist. If you experience any severe reactions like difficulty breathing or swelling, seek medical help immediately.";
  }
  
  if (lowerMessage.includes("food") || lowerMessage.includes("eat")) {
    return "Generally, medicines should be taken as directed on your prescription - some after food, some before. Check the instructions for each medicine in your prescription.";
  }
  
  return `I'm here to help you understand your prescription! Based on what I can see, your diagnosis is "${diagnosis}" and you have ${medicines.length} medicine(s) prescribed. Feel free to ask specific questions about your medicines, dosages, or when to take them.`;
};

/**
 * Get medicine information
 * @param {string} medicineName - Name of the medicine
 * @returns {Object} - Medicine details
 */
export const getMedicineInfo = async (medicineName) => {
  if (!isApiConfigured || !model) {
    return getBasicMedicineInfo(medicineName);
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
    return getBasicMedicineInfo(medicineName);
  }
};

/**
 * Basic medicine info fallback
 */
const getBasicMedicineInfo = (medicineName) => ({
  name: medicineName,
  genericName: medicineName,
  uses: ["Please consult your doctor or pharmacist for specific uses"],
  sideEffects: ["Side effects vary - consult package insert"],
  precautions: ["Follow dosage as prescribed", "Inform your doctor of allergies", "Complete the full course"],
  simpleExplanation: `${medicineName} is a medicine prescribed by your doctor. Please consult your pharmacist for detailed information about what it does and how to take it.`
});

export default { analyzePrescription, chatWithAI, getMedicineInfo };
