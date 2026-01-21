import fs from "fs";
import path from "path";
import FormData from "form-data";

// OCR.space API - Free tier: 25,000 requests/month
// Get your free API key from: https://ocr.space/ocrapi/freekey
const OCR_SPACE_API_KEY = process.env.OCR_SPACE_API_KEY || "K85674328288957"; // Free demo key

/**
 * Extract text from prescription image using OCR.space API
 * Free tier: 25,000 requests/month - no billing required
 * @param {string} imagePath - Path to the prescription image
 * @returns {string} - Extracted text from the image
 */
const extractTextFromImage = async (imagePath) => {
  try {
    console.log("🔍 Reading prescription with OCR.space:", imagePath);
    
    const absolutePath = path.resolve(imagePath);
    
    if (!fs.existsSync(absolutePath)) {
      throw new Error("Image file not found");
    }
    
    // Read file and convert to base64
    const imageBuffer = fs.readFileSync(absolutePath);
    const base64Image = imageBuffer.toString('base64');
    const mimeType = getMimeType(imagePath);
    
    // Create form data for API request
    const formData = new URLSearchParams();
    formData.append('apikey', OCR_SPACE_API_KEY);
    formData.append('base64Image', `data:${mimeType};base64,${base64Image}`);
    formData.append('language', 'eng');
    formData.append('isOverlayRequired', 'false');
    formData.append('detectOrientation', 'true');
    formData.append('scale', 'true');
    formData.append('OCREngine', '2'); // Engine 2 is better for handwriting

    // Call OCR.space API
    const response = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const result = await response.json();
    
    if (result.IsErroredOnProcessing) {
      console.error("OCR.space error:", result.ErrorMessage);
      throw new Error(result.ErrorMessage || "OCR processing failed");
    }
    
    if (!result.ParsedResults || result.ParsedResults.length === 0) {
      throw new Error("No text detected in image");
    }
    
    const extractedText = result.ParsedResults[0].ParsedText;
    
    if (!extractedText || extractedText.trim().length < 5) {
      throw new Error("Could not read text from image. Please try a clearer photo.");
    }
    
    console.log("✅ OCR complete! Text extracted successfully");
    console.log("📝 Preview:", extractedText.substring(0, 100) + "...");
    
    return extractedText.trim();
  } catch (error) {
    console.error("OCR error:", error.message);
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
    '.tiff': 'image/tiff'
  };
  return mimeTypes[ext] || 'image/jpeg';
};

export default extractTextFromImage;
