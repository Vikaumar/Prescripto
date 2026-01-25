import Groq from "groq-sdk";

let client = null;
let isApiConfigured = false;

// Initialize Groq API - FREE with generous limits (30 RPM, 6000 RPD)
// Get free API key from: https://console.groq.com/keys
try {
  const apiKey = process.env.GROQ_API_KEY;
  if (apiKey && apiKey !== "your_key_here") {
    client = new Groq({ apiKey });
    isApiConfigured = true;
    console.log("✅ Groq AI initialized (FREE - no rate limits!)");
  } else {
    console.warn("⚠️ GROQ_API_KEY not set - using local parsing only");
  }
} catch (error) {
  console.warn("⚠️ Failed to initialize Groq AI:", error.message);
}

/**
 * Check if OCR text is valid (has enough content)
 */
const isValidOCRText = (text) => {
  if (!text || typeof text !== 'string') return false;
  const cleanText = text.trim();
  // Accept text with at least 10 characters (lowered threshold for complex docs)
  return cleanText.length >= 10;
};

/**
 * Parse OCR text locally - extracts medicines using patterns
 * Returns EMPTY arrays if nothing is found (no fake data!)
 */
const parseOCRTextLocally = (extractedText) => {
  console.log("📋 Using local text parsing...");
  
  // If text is too short or invalid, return empty result
  if (!isValidOCRText(extractedText)) {
    console.log("⚠️ OCR text too short or invalid - returning empty result");
    return {
      medicines: [],
      diagnosis: null,
      doctorNotes: null,
      simplifiedExplanation: null,
      ocrFailed: true
    };
  }

  const medicines = [];
  const lines = extractedText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  // Medicine patterns
  lines.forEach(line => {
    const lowerLine = line.toLowerCase();
    
    // Skip headers
    if (lowerLine.includes('dr.') || lowerLine.includes('doctor') || 
        lowerLine.includes('patient') || lowerLine.includes('date') ||
        lowerLine.includes('hospital') || lowerLine.includes('clinic') ||
        lowerLine.includes('prescription')) {
      return;
    }
    
    // Look for medicine patterns
    const patterns = [
      /^(\d+[\.\)]\s*)?([A-Za-z]+(?:\s+[A-Za-z]+)?)\s+(\d+\s*(?:mg|ml|mcg|iu|g))/i,
      /medicine[:\s]+([A-Za-z]+(?:\s+[A-Za-z]+)?)\s+(\d+\s*(?:mg|ml|mcg|iu|g))/i,
      /([A-Za-z]+(?:cillin|mycin|prazole|olol|pril|sartan|statin|formin|mab|nib))\s*(\d+\s*(?:mg|ml)?)?/i
    ];
    
    for (const pattern of patterns) {
      const match = line.match(pattern);
      if (match) {
        const name = match[2] || match[1];
        const dosage = match[3] || match[2] || '';
        if (name && name.length > 2) {
          medicines.push({
            name: name.trim(),
            dosage: dosage.trim() || 'As prescribed',
            frequency: extractFrequency(line) || 'As directed',
            duration: extractDuration(line) || 'As advised',
            instructions: line.includes('-') ? line.split('-').slice(1).join('-').trim() : null
          });
        }
        break;
      }
    }
  });
  
  // Extract diagnosis
  let diagnosis = null;
  const diagMatch = extractedText.match(/(?:diagnosis|dx|condition)[:\s]+([^\n]+)/i);
  if (diagMatch) diagnosis = diagMatch[1].trim();
  
  return {
    medicines,
    diagnosis,
    doctorNotes: null,
    simplifiedExplanation: medicines.length > 0 
      ? `Found ${medicines.length} medicine(s) in your prescription.`
      : null,
    ocrFailed: false
  };
};

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
 * Analyze prescription using Groq AI (FREE!)
 * Falls back to local parsing if API unavailable
 */
export const analyzePrescription = async (extractedText) => {
  // First check if OCR text is valid
  if (!isValidOCRText(extractedText)) {
    console.log("⚠️ Invalid OCR text - returning empty result");
    return {
      medicines: [],
      diagnosis: null,
      doctorNotes: null,
      simplifiedExplanation: null,
      ocrFailed: true
    };
  }

  // If Groq not configured, use local parsing
  if (!isApiConfigured || !client) {
    return parseOCRTextLocally(extractedText);
  }

  const prompt = `You are a medical prescription analyzer. Extract information from this prescription text.

Prescription text:
"""
${extractedText}
"""

Return ONLY valid JSON (no markdown, no explanation):
{
  "medicines": [
    {
      "name": "medicine name",
      "dosage": "amount like 500mg",
      "frequency": "how often like twice daily",
      "duration": "how long like 7 days",
      "instructions": "special instructions or null"
    }
  ],
  "diagnosis": "condition if mentioned or null",
  "doctorNotes": "additional notes or null",
  "simplifiedExplanation": "Simple 1-2 sentence explanation for patient"
}

If you cannot find any medicines, return: {"medicines": [], "diagnosis": null, "doctorNotes": null, "simplifiedExplanation": null}`;

  try {
    const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 1024
    });

    const text = response.choices[0]?.message?.content?.trim();
    if (!text) throw new Error("Empty response");

    // Clean and parse JSON
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error("Groq AI error:", error.message);
    return parseOCRTextLocally(extractedText);
  }
};

/**
 * Chat with AI about prescription
 */
export const chatWithAI = async (message, prescriptionContext, chatHistory = []) => {
  if (!isApiConfigured || !client) {
    return getLocalChatResponse(message, prescriptionContext);
  }

  const contextStr = prescriptionContext
    ? `Patient's prescription: ${JSON.stringify(prescriptionContext.medicines || [])}. Diagnosis: ${prescriptionContext.diagnosis || 'Not specified'}.`
    : "No prescription uploaded yet.";

  try {
    const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are a friendly medical assistant helping patients understand prescriptions. Be helpful, use simple language, and always recommend consulting a doctor for medical advice. ${contextStr}`
        },
        ...chatHistory.map(h => ({ role: h.role === 'user' ? 'user' : 'assistant', content: h.message || h.content })),
        { role: "user", content: message }
      ],
      temperature: 0.7,
      max_tokens: 300
    });

    return response.choices[0]?.message?.content || getLocalChatResponse(message, prescriptionContext);
  } catch (error) {
    console.error("Groq chat error:", error.message);
    return getLocalChatResponse(message, prescriptionContext);
  }
};

const getLocalChatResponse = (message, context) => {
  const lower = message.toLowerCase();
  const medicines = context?.medicines || [];
  const diagnosis = context?.diagnosis || "not specified";

  if (lower.includes('diagnosis') || lower.includes('condition')) {
    return diagnosis !== "not specified" 
      ? `Your diagnosis is: ${diagnosis}. Please consult your doctor for more details.`
      : "I couldn't find a diagnosis in your prescription. Please ask your doctor.";
  }
  
  if (lower.includes('medicine') || lower.includes('take')) {
    if (medicines.length > 0) {
      return `Your prescription has ${medicines.length} medicine(s): ${medicines.map(m => m.name).join(', ')}. Check the cards above for details.`;
    }
    return "No medicines were found in your prescription. Please check the extracted text or consult your doctor.";
  }

  return "I'm here to help you understand your prescription. Ask me about your medicines, dosage, or diagnosis!";
};

/**
 * Get medicine information
 */
export const getMedicineInfo = async (medicineName) => {
  if (!isApiConfigured || !client) {
    return getBasicMedicineInfo(medicineName);
  }

  try {
    const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{
        role: "user",
        content: `Provide info about "${medicineName}" medicine in JSON:
{
  "name": "medicine name",
  "genericName": "generic name",
  "uses": ["uses"],
  "sideEffects": ["side effects"],
  "precautions": ["precautions"],
  "simpleExplanation": "what it does in simple words"
}
Return ONLY valid JSON.`
      }],
      temperature: 0.3,
      max_tokens: 500
    });

    const text = response.choices[0]?.message?.content?.trim();
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error("Medicine info error:", error.message);
    return getBasicMedicineInfo(medicineName);
  }
};

const getBasicMedicineInfo = (name) => ({
  name,
  genericName: name,
  uses: ["Consult your doctor for specific uses"],
  sideEffects: ["Side effects vary - check package insert"],
  precautions: ["Take as prescribed", "Complete the full course"],
  simpleExplanation: `${name} is a medicine prescribed by your doctor.`
});

export default { analyzePrescription, chatWithAI, getMedicineInfo };
