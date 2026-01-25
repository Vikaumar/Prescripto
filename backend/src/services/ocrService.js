import fs from "fs";
import path from "path";

// OCR.space API - FREE tier with Engine 3 for Handwriting!
// Engine 3 = "Extremely good OCR, including Handwriting OCR"
const OCR_SPACE_API_KEY = process.env.OCR_SPACE_API_KEY || "K85674328288957";

/**
 * Try OCR with a specific engine
 */
const tryOCRWithEngine = async (base64Image, mimeType, engine) => {
  const formBody = new URLSearchParams();
  formBody.append('apikey', OCR_SPACE_API_KEY);
  formBody.append('base64Image', `data:${mimeType};base64,${base64Image}`);
  formBody.append('language', 'eng');
  formBody.append('isOverlayRequired', 'false');
  formBody.append('detectOrientation', 'true');
  formBody.append('scale', 'true');
  formBody.append('isTable', 'true');
  formBody.append('OCREngine', engine.toString());

  const response = await fetch('https://api.ocr.space/parse/image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formBody.toString()
  });

  if (!response.ok) {
    throw new Error(`OCR API returned status ${response.status}`);
  }

  const result = await response.json();
  
  if (result.IsErroredOnProcessing) {
    throw new Error(result.ErrorMessage?.[0] || "OCR processing failed");
  }

  if (result.OCRExitCode !== 1) {
    throw new Error("OCR failed with exit code: " + result.OCRExitCode);
  }
  
  if (!result.ParsedResults || result.ParsedResults.length === 0) {
    throw new Error("No text detected");
  }
  
  return result.ParsedResults
    .map(r => r.ParsedText || '')
    .join('\n')
    .trim();
};

/**
 * Extract text from prescription image using OCR.space
 * Uses Engine 3 (Handwriting OCR) as primary, with Engine 1/2 fallbacks
 * @param {string} imagePath - Path to the prescription image
 * @returns {string} - Extracted text from the image
 */
const extractTextFromImage = async (imagePath) => {
  try {
    console.log("🔍 Reading prescription with OCR.space:", imagePath);
    
    const absolutePath = path.resolve(imagePath);
    
    if (!fs.existsSync(absolutePath)) {
      throw new Error("Image file not found: " + absolutePath);
    }
    
    const imageBuffer = fs.readFileSync(absolutePath);
    const base64Image = imageBuffer.toString('base64');
    const mimeType = getMimeType(imagePath);
    
    let extractedText = '';
    let bestResult = { text: '', length: 0, engine: 0 };
    
    // Try Engine 3 first (BEST for handwriting)
    console.log("📤 Trying Engine 3 (Handwriting OCR)...");
    try {
      const text = await tryOCRWithEngine(base64Image, mimeType, 3);
      console.log(`✅ Engine 3: ${text.length} chars`);
      if (text.length > bestResult.length) {
        bestResult = { text, length: text.length, engine: 3 };
      }
    } catch (e) {
      console.log("⚠️ Engine 3 failed:", e.message);
    }
    
    // Try Engine 1 (printed text/tables)
    console.log("📤 Trying Engine 1 (Printed/Tables)...");
    try {
      const text = await tryOCRWithEngine(base64Image, mimeType, 1);
      console.log(`✅ Engine 1: ${text.length} chars`);
      if (text.length > bestResult.length) {
        bestResult = { text, length: text.length, engine: 1 };
      }
    } catch (e) {
      console.log("⚠️ Engine 1 failed:", e.message);
    }
    
    // Try Engine 2 if we still have poor results
    if (bestResult.length < 50) {
      console.log("📤 Trying Engine 2...");
      try {
        const text = await tryOCRWithEngine(base64Image, mimeType, 2);
        console.log(`✅ Engine 2: ${text.length} chars`);
        if (text.length > bestResult.length) {
          bestResult = { text, length: text.length, engine: 2 };
        }
      } catch (e) {
        console.log("⚠️ Engine 2 failed:", e.message);
      }
    }
    
    extractedText = bestResult.text;
    
    if (!extractedText || extractedText.length < 10) {
      throw new Error("Could not read text from image. Please try a clearer photo.");
    }
    
    console.log(`✅ OCR complete! Best: Engine ${bestResult.engine}`);
    console.log("📝 Total characters:", extractedText.length);
    console.log("📝 Preview:", extractedText.substring(0, 200).replace(/\n/g, ' '));
    
    return extractedText;
  } catch (error) {
    console.error("❌ OCR error:", error.message);
    throw new Error("Failed to read prescription: " + error.message);
  }
};

/**
 * Get MIME type from file extension
 */
const getMimeType = (imagePath) => {
  const ext = path.extname(imagePath).toLowerCase();
  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.bmp': 'image/bmp',
    '.tiff': 'image/tiff',
    '.tif': 'image/tiff'
  };
  return mimeTypes[ext] || 'image/jpeg';
};

export default extractTextFromImage;
