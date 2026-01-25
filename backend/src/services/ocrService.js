import Groq from "groq-sdk";
import fs from "fs";
import path from "path";

let client = null;
let isConfigured = false;

// Initialize Groq client - FREE with vision support!
try {
  const apiKey = process.env.GROQ_API_KEY;
  if (apiKey && apiKey !== "your_groq_key_here") {
    client = new Groq({ apiKey });
    isConfigured = true;
    console.log("✅ Groq Vision OCR initialized (FREE - great for handwriting!)");
  } else {
    console.warn("⚠️ GROQ_API_KEY not set - OCR won't work");
  }
} catch (error) {
  console.warn("⚠️ Failed to initialize Groq:", error.message);
}

/**
 * Extract text from prescription image using Groq Vision
 * Uses Llama 3.2 Vision - excellent for handwritten text!
 * @param {string} imagePath - Path to the prescription image
 * @returns {string} - Extracted text from the image
 */
const extractTextFromImage = async (imagePath) => {
  if (!isConfigured || !client) {
    throw new Error("Groq API not configured. Please set GROQ_API_KEY in .env");
  }

  try {
    console.log("🔍 Reading prescription with Groq Vision:", imagePath);
    
    const absolutePath = path.resolve(imagePath);
    
    if (!fs.existsSync(absolutePath)) {
      throw new Error("Image file not found: " + absolutePath);
    }
    
    // Read and convert to base64
    const imageBuffer = fs.readFileSync(absolutePath);
    const base64Image = imageBuffer.toString('base64');
    const mimeType = getMimeType(imagePath);
    
    console.log("📤 Sending to Groq Vision API...");
    
    // Use Llama 3.2 Vision model - excellent for handwritten text
    const response = await client.chat.completions.create({
      model: "llama-3.2-11b-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `You are an expert OCR system specialized in reading medical prescriptions, especially HANDWRITTEN ones.

Extract ALL text from this prescription image. Include:
- Doctor name and details
- Patient name
- Date
- ALL medicines with dosages
- Instructions for each medicine
- Diagnosis if present
- Any other notes

IMPORTANT: 
- Read handwritten text carefully
- Include dosages like 500mg, 10ml, etc.
- Include frequencies like "twice daily", "after food", etc.
- If text is unclear, make your best interpretation

Output ONLY the extracted text, nothing else. Preserve the structure as much as possible.`
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`
              }
            }
          ]
        }
      ],
      temperature: 0.2,
      max_tokens: 2000
    });

    const extractedText = response.choices[0]?.message?.content?.trim();
    
    if (!extractedText || extractedText.length < 5) {
      throw new Error("Could not read text from image. Please try a clearer photo.");
    }
    
    console.log("✅ OCR complete!");
    console.log("📝 Characters extracted:", extractedText.length);
    console.log("📝 Preview:", extractedText.substring(0, 200).replace(/\n/g, ' '));
    
    return extractedText;
  } catch (error) {
    console.error("❌ OCR error:", error.message);
    
    if (error.message.includes('rate') || error.message.includes('429')) {
      throw new Error("Rate limited. Please wait a moment and try again.");
    }
    
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
    '.gif': 'image/gif'
  };
  return mimeTypes[ext] || 'image/jpeg';
};

export default extractTextFromImage;
