import Groq from "groq-sdk";
import fs from "fs";
import path from "path";

// OCR.space free API key
const OCR_SPACE_API_KEY = process.env.OCR_SPACE_API_KEY || "K85674328288957";

// Initialize Groq for intelligent text extraction
let groqClient = null;
try {
  const apiKey = process.env.GROQ_API_KEY;
  if (apiKey && apiKey !== "your_key_here") {
    groqClient = new Groq({ apiKey });
    console.log("✅ Hybrid OCR initialized (OCR.space + Groq AI)");
  } else {
    console.log("✅ OCR.space initialized (basic mode)");
  }
} catch (e) {
  console.log("✅ OCR.space initialized (basic mode)");
}

/**
 * Try OCR with specific engine and enhanced settings
 */
const tryOCR = async (base64Image, mimeType, engine) => {
  const formBody = new URLSearchParams();
  formBody.append('apikey', OCR_SPACE_API_KEY);
  formBody.append('base64Image', `data:${mimeType};base64,${base64Image}`);
  formBody.append('language', 'eng');
  formBody.append('isOverlayRequired', 'false');
  formBody.append('detectOrientation', 'true');
  formBody.append('scale', 'true');
  formBody.append('isTable', 'true');
  formBody.append('OCREngine', engine.toString());
  
  // Enhanced settings for better accuracy
  if (engine === 1 || engine === 2) {
    formBody.append('isCreateSearchablePdf', 'false');
    formBody.append('detectCheckbox', 'false');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000); // 30s timeout

  try {
    const response = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formBody.toString(),
      signal: controller.signal
    });
    
    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const result = await response.json();
    
    if (result.IsErroredOnProcessing || result.OCRExitCode !== 1) {
      throw new Error(result.ErrorMessage?.[0] || "Processing failed");
    }
    
    if (!result.ParsedResults?.length) {
      throw new Error("No results");
    }
    
    return result.ParsedResults.map(r => r.ParsedText || '').join('\n').trim();
  } catch (e) {
    clearTimeout(timeout);
    throw e;
  }
};

/**
 * Use Groq AI to extract prescription info from raw OCR text
 * Even if OCR is messy, AI can understand context
 */
const enhanceWithAI = async (rawText, imagePath) => {
  if (!groqClient || rawText.length < 20) {
    return rawText;
  }

  try {
    console.log("🧠 Enhancing OCR with Groq AI...");
    
    const response = await groqClient.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{
        role: "user",
        content: `You are an expert at reading medical prescriptions. Below is raw OCR text from a prescription image that may have errors, misspellings, or be incomplete.

RAW OCR TEXT:
"""
${rawText}
"""

Your task:
1. Clean up and correct obvious OCR errors
2. Identify medicine names (fix misspellings like "Parac3tam0l" -> "Paracetamol")
3. Extract dosages (mg, ml, etc.)
4. Find frequencies (daily, twice daily, etc.)
5. Identify doctor name, patient name, date if present
6. Include any diagnosis

Return ONLY the cleaned, corrected prescription text. Keep the structure but fix errors. If you can't determine something, leave it as-is.`
      }],
      temperature: 0.2,
      max_tokens: 1500
    });

    const enhanced = response.choices[0]?.message?.content?.trim();
    if (enhanced && enhanced.length > rawText.length * 0.3) {
      console.log("✅ AI enhancement complete!");
      return enhanced;
    }
    return rawText;
  } catch (e) {
    console.log("⚠️ AI enhancement skipped:", e.message);
    return rawText;
  }
};

/**
 * Extract text from prescription using multi-engine OCR + AI enhancement
 */
const extractTextFromImage = async (imagePath) => {
  try {
    console.log("🔍 Reading prescription:", imagePath);
    
    const absolutePath = path.resolve(imagePath);
    if (!fs.existsSync(absolutePath)) {
      throw new Error("Image not found: " + absolutePath);
    }
    
    const imageBuffer = fs.readFileSync(absolutePath);
    const base64Image = imageBuffer.toString('base64');
    const mimeType = getMimeType(imagePath);
    
    let bestResult = { text: '', length: 0, engine: 0 };
    
    // Try Engine 1 first (best for printed/tables)
    console.log("📤 Trying Engine 1 (Printed Text)...");
    try {
      const text = await tryOCR(base64Image, mimeType, 1);
      console.log(`   Engine 1: ${text.length} chars`);
      if (text.length > bestResult.length) {
        bestResult = { text, length: text.length, engine: 1 };
      }
    } catch (e) {
      console.log(`   Engine 1: failed - ${e.message}`);
    }
    
    // Try Engine 2 (good for photos)
    console.log("📤 Trying Engine 2 (Photo Text)...");
    try {
      const text = await tryOCR(base64Image, mimeType, 2);
      console.log(`   Engine 2: ${text.length} chars`);
      if (text.length > bestResult.length) {
        bestResult = { text, length: text.length, engine: 2 };
      }
    } catch (e) {
      console.log(`   Engine 2: failed - ${e.message}`);
    }
    
    // Only try Engine 3 if we have poor results (it often hangs)
    if (bestResult.length < 100) {
      console.log("📤 Trying Engine 3 (Handwriting - may be slow)...");
      try {
        const text = await tryOCR(base64Image, mimeType, 3);
        console.log(`   Engine 3: ${text.length} chars`);
        if (text.length > bestResult.length) {
          bestResult = { text, length: text.length, engine: 3 };
        }
      } catch (e) {
        console.log(`   Engine 3: failed/timeout - ${e.message}`);
      }
    }
    
    if (bestResult.length < 10) {
      throw new Error("Could not read text. Please try a clearer image.");
    }
    
    console.log(`✅ Best result: Engine ${bestResult.engine} (${bestResult.length} chars)`);
    console.log("📝 Raw preview:", bestResult.text.substring(0, 150).replace(/\n/g, ' '));
    
    // Enhance with AI if available
    const enhancedText = await enhanceWithAI(bestResult.text, imagePath);
    
    console.log("📝 Final chars:", enhancedText.length);
    
    return enhancedText;
  } catch (error) {
    console.error("❌ OCR error:", error.message);
    throw new Error("Failed to read prescription: " + error.message);
  }
};

const getMimeType = (imagePath) => {
  const ext = path.extname(imagePath).toLowerCase();
  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg', 
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif'
  };
  return mimeTypes[ext] || 'image/jpeg';
};

export default extractTextFromImage;
