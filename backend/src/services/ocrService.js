import Tesseract from "tesseract.js";
import path from "path";

/**
 * Extract text from image using Tesseract.js (free, local OCR)
 * Works without any cloud billing - runs completely locally
 * @param {string} imagePath - Path to the image file
 * @returns {string} - Extracted text from the image
 */
const extractTextFromImage = async (imagePath) => {
  try {
    console.log("🔍 Starting OCR with Tesseract.js for:", imagePath);
    
    const { data: { text, confidence } } = await Tesseract.recognize(
      imagePath,
      'eng', // English language
      {
        logger: m => {
          if (m.status === 'recognizing text') {
            console.log(`   OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        }
      }
    );

    console.log(`✅ OCR Complete! Confidence: ${confidence.toFixed(1)}%`);
    
    if (!text || text.trim().length === 0) {
      throw new Error("No text detected in image. Please ensure the prescription is clearly visible.");
    }

    // Clean up the extracted text
    const cleanedText = text
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/\n\s*\n/g, '\n') // Remove extra blank lines
      .trim();

    return cleanedText;
  } catch (error) {
    console.error("OCR error:", error.message);
    throw new Error("Failed to read text from image. Please try with a clearer image.");
  }
};

export default extractTextFromImage;
