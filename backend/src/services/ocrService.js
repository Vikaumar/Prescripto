import vision from "@google-cloud/vision";
import path from "path";
import fs from "fs";

// Check if Google Vision key exists and is valid
let client = null;
const keyPath = path.join(process.cwd(), "google-vision-key.json");

try {
  if (fs.existsSync(keyPath)) {
    const keyContent = fs.readFileSync(keyPath, "utf8");
    JSON.parse(keyContent); // Validate JSON
    client = new vision.ImageAnnotatorClient({
      keyFilename: keyPath,
    });
    console.log("✅ Google Vision API initialized");
  } else {
    console.warn("⚠️ google-vision-key.json not found - OCR will use mock data");
  }
} catch (error) {
  console.warn("⚠️ Invalid google-vision-key.json - OCR will use mock data");
  console.warn("   Get a valid key from: https://console.cloud.google.com/apis/credentials");
}

/**
 * Extract text from image using Google Vision OCR
 * Falls back to mock data if API is not configured
 */
const extractTextFromImage = async (imagePath) => {
  // If no valid client, return mock data for testing
  if (!client) {
    console.log("📋 Using mock OCR data for testing...");
    return `MOCK PRESCRIPTION DATA
    
Dr. Ravi Kumar
General Physician
Reg No: 12345

Patient: Test Patient
Date: ${new Date().toLocaleDateString()}

Rx:
1. Paracetamol 500mg - Take 1 tablet twice daily after food for 5 days
2. Cetirizine 10mg - Take 1 tablet at night for 7 days  
3. Vitamin D3 60000 IU - Take 1 sachet weekly for 8 weeks

Diagnosis: Viral fever with allergic rhinitis

Notes: Drink plenty of fluids. Rest well. Follow up in 1 week if symptoms persist.

Signature: Dr. R. Kumar`;
  }

  try {
    const [result] = await client.textDetection(imagePath);
    const detections = result.textAnnotations;

    if (!detections || detections.length === 0) {
      throw new Error("No text detected in image");
    }

    return detections[0].description; // full extracted text
  } catch (error) {
    console.error("Google Vision OCR error:", error.message);
    
    // Provide more helpful error messages
    if (error.code === 2) {
      throw new Error("Google Vision API authentication failed. Please check your credentials.");
    } else if (error.code === 7) {
      throw new Error("Google Vision API quota exceeded or billing not enabled.");
    } else if (error.code === 3) {
      throw new Error("Invalid image file. Please upload a valid JPG or PNG image.");
    }
    
    throw new Error("OCR processing failed: " + error.message);
  }
};

export default extractTextFromImage;
