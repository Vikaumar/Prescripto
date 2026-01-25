import vision from "@google-cloud/vision";
import fs from "fs";
import path from "path";

// Initialize Google Cloud Vision client
// Uses the service account key file for authentication
const keyFilePath = path.resolve('google-vision-key.json');

let client = null;
let isConfigured = false;

try {
  if (fs.existsSync(keyFilePath)) {
    client = new vision.ImageAnnotatorClient({
      keyFilename: keyFilePath
    });
    isConfigured = true;
    console.log("✅ Google Cloud Vision OCR initialized (Best for handwriting!)");
  } else {
    console.warn("⚠️ google-vision-key.json not found");
  }
} catch (error) {
  console.warn("⚠️ Failed to initialize Google Vision:", error.message);
}

/**
 * Extract text from prescription image using Google Cloud Vision
 * Uses DOCUMENT_TEXT_DETECTION which is optimized for handwritten documents
 * @param {string} imagePath - Path to the prescription image
 * @returns {string} - Extracted text from the image
 */
const extractTextFromImage = async (imagePath) => {
  if (!isConfigured || !client) {
    throw new Error("Google Cloud Vision not configured. Please add google-vision-key.json");
  }

  try {
    console.log("🔍 Reading prescription with Google Cloud Vision:", imagePath);
    
    const absolutePath = path.resolve(imagePath);
    
    if (!fs.existsSync(absolutePath)) {
      throw new Error("Image file not found: " + absolutePath);
    }
    
    console.log("📤 Sending to Google Vision API (DOCUMENT_TEXT_DETECTION)...");
    
    // Use DOCUMENT_TEXT_DETECTION for better handwriting recognition
    const [result] = await client.documentTextDetection(absolutePath);
    
    // Get full text annotation (includes handwriting)
    const fullTextAnnotation = result.fullTextAnnotation;
    
    if (!fullTextAnnotation || !fullTextAnnotation.text) {
      // Fallback to basic text detection
      console.log("📤 Trying TEXT_DETECTION as fallback...");
      const [textResult] = await client.textDetection(absolutePath);
      const textAnnotations = textResult.textAnnotations;
      
      if (!textAnnotations || textAnnotations.length === 0) {
        throw new Error("No text detected in image. Please try a clearer photo.");
      }
      
      const extractedText = textAnnotations[0].description.trim();
      console.log("✅ OCR complete (TEXT_DETECTION)!");
      console.log("📝 Characters extracted:", extractedText.length);
      console.log("📝 Preview:", extractedText.substring(0, 200).replace(/\n/g, ' '));
      return extractedText;
    }
    
    const extractedText = fullTextAnnotation.text.trim();
    
    if (!extractedText || extractedText.length < 5) {
      throw new Error("Could not read text from image. Please try a clearer photo.");
    }
    
    console.log("✅ OCR complete (DOCUMENT_TEXT_DETECTION)!");
    console.log("📝 Characters extracted:", extractedText.length);
    console.log("📝 Preview:", extractedText.substring(0, 200).replace(/\n/g, ' '));
    
    // Log confidence if available
    if (fullTextAnnotation.pages && fullTextAnnotation.pages.length > 0) {
      const confidence = fullTextAnnotation.pages[0].confidence;
      if (confidence) {
        console.log("📊 Confidence:", (confidence * 100).toFixed(1) + "%");
      }
    }
    
    return extractedText;
  } catch (error) {
    console.error("❌ OCR error:", error.message);
    
    if (error.message.includes('PERMISSION_DENIED')) {
      throw new Error("Vision API permission denied. Please enable the Cloud Vision API in Google Cloud Console.");
    }
    
    if (error.message.includes('billing')) {
      throw new Error("Billing not enabled. Please enable billing in Google Cloud Console for Vision API.");
    }
    
    throw new Error("Failed to read prescription: " + error.message);
  }
};

export default extractTextFromImage;
