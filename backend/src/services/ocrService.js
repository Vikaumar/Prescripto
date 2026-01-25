import fs from "fs";
import path from "path";

// OCR.space API - FREE tier: 25,000 requests/month
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
  formBody.append('isTable', 'true'); // Better for prescriptions with tables
  formBody.append('OCREngine', engine.toString());

  const response = await fetch('https://api.ocr.space/parse/image', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formBody.toString()
  });

  if (!response.ok) {
    throw new Error(`OCR API returned status ${response.status}`);
  }

  const result = await response.json();
  
  if (result.IsErroredOnProcessing || result.OCRExitCode !== 1) {
    throw new Error(result.ErrorMessage?.[0] || "OCR processing failed");
  }
  
  if (!result.ParsedResults || result.ParsedResults.length === 0) {
    throw new Error("No text detected");
  }
  
  const text = result.ParsedResults
    .map(r => r.ParsedText || '')
    .join('\n')
    .trim();
    
  return text;
};

/**
 * Extract text from prescription image using OCR.space API
 * Tries Engine 1 (printed text) first, then Engine 2 (handwriting)
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
    
    // Read file and convert to base64
    const imageBuffer = fs.readFileSync(absolutePath);
    const base64Image = imageBuffer.toString('base64');
    const mimeType = getMimeType(imagePath);
    
    console.log("📤 Trying OCR Engine 1 (better for printed documents)...");
    
    let extractedText = '';
    
    // Try Engine 1 first (best for printed documents, tables)
    try {
      extractedText = await tryOCRWithEngine(base64Image, mimeType, 1);
      console.log("✅ Engine 1 extracted", extractedText.length, "characters");
    } catch (e1) {
      console.log("⚠️ Engine 1 failed, trying Engine 2...");
      
      // Fallback to Engine 2 (better for handwriting)
      try {
        extractedText = await tryOCRWithEngine(base64Image, mimeType, 2);
        console.log("✅ Engine 2 extracted", extractedText.length, "characters");
      } catch (e2) {
        console.error("❌ Both engines failed");
        throw new Error("Could not read text from image");
      }
    }
    
    // If Engine 1 got very little, try Engine 2 as well and use the better result
    if (extractedText.length < 50) {
      console.log("⚠️ Low text count, trying Engine 2 for comparison...");
      try {
        const engine2Text = await tryOCRWithEngine(base64Image, mimeType, 2);
        if (engine2Text.length > extractedText.length) {
          console.log("✅ Engine 2 got more text:", engine2Text.length, "vs", extractedText.length);
          extractedText = engine2Text;
        }
      } catch (e) {
        // Keep Engine 1 result
      }
    }
    
    if (!extractedText || extractedText.length < 10) {
      throw new Error("Could not read text from image. Please try a clearer photo.");
    }
    
    console.log("✅ OCR complete!");
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
