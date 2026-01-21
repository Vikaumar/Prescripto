import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";

let model = null;
let isApiConfigured = false;

// Initialize Gemini API
try {
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "your_key_here") {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    isApiConfigured = true;
    console.log("✅ Gemini OCR initialized");
  } else {
    console.warn("⚠️ GEMINI_API_KEY not set");
  }
} catch (error) {
  console.warn("⚠️ Failed to initialize Gemini:", error.message);
}

/**
 * Convert image file to base64
 */
const imageToBase64 = (imagePath) => {
  const absolutePath = path.resolve(imagePath);
  const imageBuffer = fs.readFileSync(absolutePath);
  return imageBuffer.toString('base64');
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
    '.gif': 'image/gif'
  };
  return mimeTypes[ext] || 'image/jpeg';
};

/**
 * Sleep helper
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Extract text from prescription image using Gemini Vision
 * With retry logic for rate limits
 * @param {string} imagePath - Path to the prescription image
 * @param {number} retryCount - Current retry attempt
 * @returns {string} - Extracted text from the image
 */
const extractTextFromImage = async (imagePath, retryCount = 0) => {
  if (!isApiConfigured || !model) {
    throw new Error("Gemini API not configured. Please set GEMINI_API_KEY in .env file.");
  }

  try {
    console.log("🔍 Reading prescription with Gemini Vision:", imagePath);
    
    // Check if file exists
    const absolutePath = path.resolve(imagePath);
    if (!fs.existsSync(absolutePath)) {
      throw new Error("Image file not found");
    }
    
    // Convert image to base64
    const base64Image = imageToBase64(imagePath);
    const mimeType = getMimeType(imagePath);
    
    // Create the prompt
    const prompt = `You are an OCR system. Read this prescription/medical document image and extract ALL text exactly as written.

Instructions:
- Extract every piece of text including doctor name, patient details, date, medicines, dosages, instructions
- Preserve structure and formatting
- For handwritten text, interpret what is written
- Output ONLY the raw extracted text, nothing else`;

    // Call Gemini Vision API
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: mimeType,
          data: base64Image
        }
      }
    ]);
    
    const extractedText = result.response.text().trim();
    
    if (!extractedText || extractedText.length < 5) {
      throw new Error("Could not read text from image. Please try a clearer photo.");
    }
    
    console.log("✅ OCR complete!");
    console.log("📝 Preview:", extractedText.substring(0, 100) + "...");
    
    return extractedText;
  } catch (error) {
    console.error("OCR error:", error.message);
    
    // Handle rate limiting with retry
    if (error.message.includes('retry') || error.message.includes('quota') || error.message.includes('429')) {
      // Extract retry delay if present
      const delayMatch = error.message.match(/(\d+)s/);
      const delay = delayMatch ? parseInt(delayMatch[1]) * 1000 : 30000;
      
      if (retryCount < 2) {
        console.log(`⏳ Rate limited. Waiting ${delay/1000}s before retry (attempt ${retryCount + 1}/2)...`);
        await sleep(Math.min(delay, 60000)); // Max 60s wait
        return extractTextFromImage(imagePath, retryCount + 1);
      } else {
        throw new Error("Service is busy. Please wait 1 minute and try again.");
      }
    }
    
    // Handle model not found
    if (error.message.includes('not found') || error.message.includes('404')) {
      throw new Error("OCR service temporarily unavailable. Please try again.");
    }
    
    throw new Error("Failed to read prescription: " + error.message);
  }
};

export default extractTextFromImage;
