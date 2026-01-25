import fs from "fs";
import path from "path";

// OCR.space API - FREE tier: 25,000 requests/month
// No credit card or billing required
// Demo API key that works immediately
const OCR_SPACE_API_KEY = process.env.OCR_SPACE_API_KEY || "K85674328288957";

/**
 * Extract text from prescription image using OCR.space API
 * Completely FREE - 25,000 requests/month
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
    
    // Prepare form data
    const formBody = new URLSearchParams();
    formBody.append('apikey', OCR_SPACE_API_KEY);
    formBody.append('base64Image', `data:${mimeType};base64,${base64Image}`);
    formBody.append('language', 'eng');
    formBody.append('isOverlayRequired', 'false');
    formBody.append('detectOrientation', 'true');
    formBody.append('scale', 'true');
    formBody.append('OCREngine', '2'); // Engine 2 is better for photos and handwriting
    formBody.append('filetype', mimeType.split('/')[1].toUpperCase());

    console.log("📤 Sending to OCR.space API...");

    // Call OCR.space API
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
    
    console.log("📥 OCR.space response received");

    // Check for API errors
    if (result.IsErroredOnProcessing) {
      console.error("OCR.space processing error:", result.ErrorMessage);
      throw new Error(result.ErrorMessage?.[0] || "OCR processing failed");
    }

    if (result.OCRExitCode !== 1) {
      console.error("OCR.space exit code:", result.OCRExitCode, result.ErrorMessage);
      throw new Error("OCR failed with exit code: " + result.OCRExitCode);
    }
    
    if (!result.ParsedResults || result.ParsedResults.length === 0) {
      throw new Error("No text detected in image. Please try a clearer photo.");
    }
    
    // Combine text from all parsed results
    const extractedText = result.ParsedResults
      .map(r => r.ParsedText || '')
      .join('\n')
      .trim();
    
    if (!extractedText || extractedText.length < 3) {
      throw new Error("Could not read text from image. Please try a clearer photo.");
    }
    
    console.log("✅ OCR successful!");
    console.log("📝 Characters extracted:", extractedText.length);
    console.log("📝 Preview:", extractedText.substring(0, 150).replace(/\n/g, ' ') + "...");
    
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
