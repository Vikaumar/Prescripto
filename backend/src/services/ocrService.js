import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";

let model = null;
let isApiConfigured = false;

// Initialize Gemini API with vision capability
try {
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "your_key_here") {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    isApiConfigured = true;
    console.log("✅ Gemini Vision OCR initialized");
  } else {
    console.warn("⚠️ GEMINI_API_KEY not set - OCR unavailable");
  }
} catch (error) {
  console.warn("⚠️ Failed to initialize Gemini Vision:", error.message);
}

/**
 * Convert image file to base64 for Gemini API
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
 * Extract text from prescription image using Gemini Vision
 * This is much more accurate than traditional OCR for handwritten prescriptions
 * @param {string} imagePath - Path to the prescription image
 * @returns {string} - Extracted text from the image
 */
const extractTextFromImage = async (imagePath) => {
  if (!isApiConfigured || !model) {
    throw new Error("Gemini API not configured. Please set GEMINI_API_KEY in .env file.");
  }

  try {
    console.log("🔍 Reading prescription with Gemini Vision:", imagePath);
    
    // Convert image to base64
    const base64Image = imageToBase64(imagePath);
    const mimeType = getMimeType(imagePath);
    
    // Create the prompt for extraction
    const prompt = `You are a prescription OCR system. Please carefully read this prescription/medical document image and extract ALL text exactly as written.

Instructions:
- Extract every piece of text you can see including doctor name, patient details, date, medicines, dosages, instructions
- Preserve the original structure and formatting as much as possible
- For handwritten text, do your best to interpret what is written
- If something is unclear, make your best guess and include it
- DO NOT add any extra commentary or explanation
- Just output the raw extracted text

Extracted text:`;

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
      throw new Error("Could not read text from image. Please ensure the prescription is clear and readable.");
    }
    
    console.log("✅ Text extracted successfully");
    console.log("📝 Preview:", extractedText.substring(0, 100) + "...");
    
    return extractedText;
  } catch (error) {
    console.error("Gemini Vision OCR error:", error.message);
    
    // Provide helpful error messages
    if (error.message.includes('retry') || error.message.includes('quota')) {
      throw new Error("Service is busy. Please wait 30 seconds and try again.");
    } else if (error.message.includes('ENOENT')) {
      throw new Error("Image file not found. Please try uploading again.");
    } else if (error.message.includes('safety')) {
      throw new Error("Could not process this image. Please try a clearer photo.");
    }
    
    throw new Error("Failed to read prescription: " + error.message);
  }
};

export default extractTextFromImage;
