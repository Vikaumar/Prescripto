import Groq from "groq-sdk";
import fs from "fs";
import path from "path";

// Initialize Groq for text enhancement
let groqClient = null;
try {
  const apiKey = process.env.GROQ_API_KEY;
  if (apiKey && apiKey !== "your_key_here") {
    groqClient = new Groq({ apiKey });
    console.log("✅ Groq AI initialized for OCR enhancement");
  }
} catch (e) {}

/**
 * OCR.space Engine 3 - BEST for handwriting recognition
 * Engine 3 is specifically designed for handwritten text
 */
const extractWithEngine3 = async (imagePath) => {
  const absolutePath = path.resolve(imagePath);
  const imageBuffer = fs.readFileSync(absolutePath);
  const base64Image = imageBuffer.toString('base64');
  const mimeType = getMimeType(imagePath);

  console.log("📤 Using OCR.space Engine 3 (Handwriting optimized)...");

  const formBody = new URLSearchParams();
  formBody.append('apikey', 'K85674328288957');
  formBody.append('base64Image', `data:${mimeType};base64,${base64Image}`);
  formBody.append('language', 'eng');
  formBody.append('detectOrientation', 'true');
  formBody.append('scale', 'true');
  formBody.append('isTable', 'false');
  formBody.append('OCREngine', '3'); // Engine 3 for handwriting!

  const response = await fetch('https://api.ocr.space/parse/image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formBody.toString()
  });

  const result = await response.json();
  
  if (result.IsErroredOnProcessing) {
    throw new Error(result.ErrorMessage?.join(', ') || 'Engine 3 failed');
  }
  
  if (result.ParsedResults?.length) {
    const text = result.ParsedResults.map(r => r.ParsedText || '').join('\n').trim();
    console.log("✅ Engine 3 extracted:", text.length, "chars");
    return text;
  }
  
  throw new Error("Engine 3 returned no results");
};

/**
 * OCR.space Engine 2 - Better accuracy for printed text
 * Use as fallback if Engine 3 doesn't work well
 */
const extractWithEngine2 = async (imagePath) => {
  const absolutePath = path.resolve(imagePath);
  const imageBuffer = fs.readFileSync(absolutePath);
  const base64Image = imageBuffer.toString('base64');
  const mimeType = getMimeType(imagePath);

  console.log("📤 Using OCR.space Engine 2 (Fallback)...");

  const formBody = new URLSearchParams();
  formBody.append('apikey', 'K85674328288957');
  formBody.append('base64Image', `data:${mimeType};base64,${base64Image}`);
  formBody.append('language', 'eng');
  formBody.append('detectOrientation', 'true');
  formBody.append('scale', 'true');
  formBody.append('isTable', 'true');
  formBody.append('OCREngine', '2');

  const response = await fetch('https://api.ocr.space/parse/image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formBody.toString()
  });

  const result = await response.json();
  
  if (result.ParsedResults?.length) {
    const text = result.ParsedResults.map(r => r.ParsedText || '').join('\n').trim();
    console.log("✅ Engine 2 extracted:", text.length, "chars");
    return text;
  }
  
  throw new Error("Engine 2 returned no results");
};

/**
 * Use Groq to smartly extract and correct prescription info from raw OCR text
 */
const enhanceAndExtractWithGroq = async (rawText, imagePath) => {
  if (!groqClient) {
    return rawText;
  }

  console.log("🧠 Using AI to understand and correct prescription text...");

  try {
    const response = await groqClient.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{
        role: "user", 
        content: `You are analyzing a medical prescription. The OCR extracted this text which may have errors:

"""
${rawText}
"""

This is a HANDWRITTEN prescription, so there may be OCR errors. Please:
1. Identify ALL medicine names (correct obvious misspellings - use your medical knowledge)
2. Find dosages (mg, ml, tablets, etc.)
3. Find frequencies (once a day, twice daily, after meals, SOS, etc.)
4. Find duration if mentioned
5. Extract doctor name, patient name, date if visible
6. Include any diagnosis or condition mentioned

IMPORTANT COMMON MEDICINES IN INDIAN PRESCRIPTIONS:
- HYDROXYCHLOROQUINE (sometimes misread as Chloroquine)
- VITAMIN C / ASCORBIC ACID
- ZINC supplements
- CROCIN / CALPOL (Paracetamol/Acetaminophen)
- CETIRIZINE (antihistamine)
- ALEX / BENADRYL (cough syrup)
- AZITHROMYCIN, AMOXICILLIN (antibiotics)
- OMEPRAZOLE, PANTOPRAZOLE (antacids)

Return a CLEAN, CORRECTED version of the prescription with each medicine on a new line.
Format each medicine as: Medicine Name - Dosage - Frequency - Duration (if any)
Also include Doctor name, Patient name, Date, and Diagnosis if found.`
      }],
      temperature: 0.2,
      max_tokens: 2000
    });

    const enhanced = response.choices[0]?.message?.content?.trim();
    if (enhanced && enhanced.length > 20) {
      console.log("✅ AI corrected and enhanced text!");
      return enhanced;
    }
    return rawText;
  } catch (e) {
    console.log("⚠️ AI enhancement skipped:", e.message);
    return rawText;
  }
};

/**
 * Main extraction function - tries multiple engines for best results
 */
const extractTextFromImage = async (imagePath) => {
  try {
    console.log("🔍 Reading prescription:", imagePath);
    
    const absolutePath = path.resolve(imagePath);
    if (!fs.existsSync(absolutePath)) {
      throw new Error("Image not found");
    }

    let extractedText = '';
    let engine3Text = '';
    let engine2Text = '';

    // Try Engine 3 first (best for handwriting)
    try {
      engine3Text = await extractWithEngine3(imagePath);
    } catch (e) {
      console.log("⚠️ Engine 3 failed:", e.message);
    }

    // Also try Engine 2 as backup
    try {
      engine2Text = await extractWithEngine2(imagePath);
    } catch (e) {
      console.log("⚠️ Engine 2 failed:", e.message);
    }

    // Use whichever got more text, or combine them
    if (engine3Text.length > engine2Text.length) {
      extractedText = engine3Text;
      console.log("📝 Using Engine 3 result (more text)");
    } else if (engine2Text.length > engine3Text.length) {
      extractedText = engine2Text;
      console.log("📝 Using Engine 2 result (more text)");
    } else if (engine3Text.length > 0) {
      // If similar length, prefer Engine 3 for handwriting
      extractedText = engine3Text;
      console.log("📝 Using Engine 3 result (handwriting optimized)");
    }

    // If both engines got text, combine for better coverage
    if (engine3Text.length > 50 && engine2Text.length > 50 && 
        engine3Text !== engine2Text) {
      extractedText = `--- OCR Engine 3 (Handwriting) ---\n${engine3Text}\n\n--- OCR Engine 2 (Accuracy) ---\n${engine2Text}`;
      console.log("📝 Combined both engine results for better accuracy");
    }

    if (!extractedText || extractedText.length < 10) {
      throw new Error("Could not extract text. Please try a clearer image.");
    }

    // Enhance with Groq AI to correct OCR errors
    const enhanced = await enhanceAndExtractWithGroq(extractedText, imagePath);
    
    console.log("📝 Final text length:", enhanced.length);
    
    return enhanced;
  } catch (error) {
    console.error("❌ OCR error:", error.message);
    throw new Error("Failed to read prescription: " + error.message);
  }
};

const getMimeType = (imagePath) => {
  const ext = path.extname(imagePath).toLowerCase();
  return { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' }[ext] || 'image/jpeg';
};

export default extractTextFromImage;
