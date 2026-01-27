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
  console.log("🔬 Analyzing prescription text...");
  console.log("📝 Text length:", extractedText?.length || 0);
  
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
    console.log("⚠️ Groq not configured, using local parsing");
    return parseOCRTextLocally(extractedText);
  }

  const prompt = `You are a medical prescription analyzer. Extract ALL information from the prescription including medicines, advice, and lifestyle recommendations.

PRESCRIPTION TEXT:
"""
${extractedText}
"""

YOUR TASKS:
1. Extract medicines that are mentioned in the text (if any)
2. Extract ALL doctor's advice, recommendations, and lifestyle suggestions
3. Extract patient, doctor, hospital, and date information
4. Some prescriptions may have lifestyle advice instead of medicines - capture those too!

RESPOND WITH ONLY JSON (no markdown):
{
  "patientInfo": {
    "name": "patient name if found or null",
    "age": "patient age if found or null",
    "gender": "patient gender if found or null",
    "address": "patient address if found or null"
  },
  "doctorInfo": {
    "name": "doctor name if found or null",
    "qualification": "MBBS, MD, etc. if found or null",
    "specialization": "specialization if found or null",
    "hospital": "hospital or clinic name if found or null",
    "contact": "phone/email if found or null"
  },
  "prescriptionDate": "date of prescription if found or null",
  "medicines": [
    {
      "name": "medicine name from text",
      "dosage": "dosage if found",
      "frequency": "frequency if found",
      "duration": "duration if found",
      "instructions": "instructions if found",
      "whatItDoes": "Simple 1-2 sentence explanation of what this medicine does",
      "whyPrescribed": "Why doctor likely prescribed this",
      "category": "Medicine category (e.g., Antibiotic, Pain reliever)",
      "keyWarnings": ["2-3 important warnings"],
      "foodInteractions": "What to take/avoid with this medicine",
      "commonSideEffects": ["2-3 most common side effects"]
    }
  ],
  "lifestyleAdvice": [
    {
      "advice": "The specific advice or recommendation",
      "category": "Category like 'Mental Health', 'Diet', 'Exercise', 'Behavior', 'Life Principle'",
      "frequency": "How often to follow (e.g., 'Daily', 'Morning & Evening', 'As needed')"
    }
  ],
  "dosAndDonts": {
    "dos": ["Things patient should do"],
    "donts": ["Things patient should avoid"]
  },
  "diagnosis": "diagnosis if mentioned or null",
  "doctorNotes": "any additional notes from doctor or null",
  "followUp": "follow-up instructions if any or null",
  "simplifiedExplanation": "A helpful 2-3 sentence summary explaining the overall prescription",
  "overallAdvice": "1-2 sentences of general advice for following this prescription"
}

IMPORTANT: 
- Capture EVERYTHING the doctor has written - medicines, advice, lifestyle tips, do's and don'ts
- Some prescriptions may be about mental health, lifestyle, or general wellness - treat these as valid
- Keep explanations simple and patient-friendly`;

  try {
    console.log("📤 Sending to Groq AI for analysis...");
    
    const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      max_tokens: 2000
    });

    const text = response.choices[0]?.message?.content?.trim();
    console.log("📥 AI Response received, length:", text?.length);
    
    if (!text) {
      console.log("⚠️ Empty AI response, falling back to local parsing");
      return parseOCRTextLocally(extractedText);
    }

    // Clean and parse JSON - handle various formats
    let cleaned = text;
    cleaned = cleaned.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    cleaned = cleaned.replace(/^[^{]*/, ''); // Remove anything before first {
    cleaned = cleaned.replace(/[^}]*$/, ''); // Remove anything after last }
    cleaned = cleaned.trim();
    
    console.log("📋 Attempting to parse JSON...");
    
    const result = JSON.parse(cleaned);
    
    console.log("✅ AI Analysis complete!");
    console.log("💊 Medicines found:", result.medicines?.length || 0);
    
    if (result.medicines && result.medicines.length > 0) {
      result.medicines.forEach((m, i) => {
        console.log(`   ${i + 1}. ${m.name} - ${m.dosage}`);
      });
    }
    
    return result;
  } catch (error) {
    console.error("❌ AI Analysis error:", error.message);
    console.log("📋 Falling back to local parsing...");
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
