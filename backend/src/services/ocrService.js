import Together from "together-ai";
import fs from "fs";
import path from "path";

let client = null;
let isConfigured = false;

// Initialize Together AI client
// FREE: $25 credits for new users (thousands of OCR requests)
// Get free API key from: https://api.together.xyz/
try {
  const apiKey = process.env.TOGETHER_API_KEY;
  if (apiKey && apiKey !== "your_key_here") {
    client = new Together({ apiKey });
    isConfigured = true;
    console.log("✅ Together AI Vision OCR initialized (FREE $25 credits!)");
  } else {
    console.warn("⚠️ TOGETHER_API_KEY not set - OCR won't work");
    console.warn("   Get free key at: https://api.together.xyz/");
  }
} catch (error) {
  console.warn("⚠️ Failed to initialize Together AI:", error.message);
}

/**
 * Extract text from prescription image using Together AI Vision
 * Uses Llama 4 Scout - excellent for document and handwriting OCR
 * FREE: $25 credits = thousands of requests
 * @param {string} imagePath - Path to the prescription image
 * @returns {string} - Extracted text from the image
 */
const extractTextFromImage = async (imagePath) => {
  if (!isConfigured || !client) {
    throw new Error("Together AI not configured. Please set TOGETHER_API_KEY in .env (Get free key at: https://api.together.xyz/)");
  }

  try {
    console.log("🔍 Reading prescription with Together AI Vision:", imagePath);
    
    const absolutePath = path.resolve(imagePath);
    
    if (!fs.existsSync(absolutePath)) {
      throw new Error("Image file not found: " + absolutePath);
    }
    
    // Read and convert to base64
    const imageBuffer = fs.readFileSync(absolutePath);
    const base64Image = imageBuffer.toString('base64');
    const mimeType = getMimeType(imagePath);
    
    console.log("📤 Sending to Together AI (Llama 4 Scout Vision)...");
    
    // Use Llama 4 Scout - excellent for document OCR
    const response = await client.chat.completions.create({
      model: "meta-llama/Llama-4-Scout-17B-16E-Instruct",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `You are an expert OCR system for medical prescriptions. Extract ALL text from this prescription image.

IMPORTANT INSTRUCTIONS:
1. Read EVERYTHING including handwritten text
2. Include doctor name, patient name, date
3. Extract ALL medicine names with dosages (mg, ml, etc.)
4. Include frequencies (twice daily, after food, etc.)
5. Include any diagnosis or notes
6. If text is unclear, make your best guess based on medical context

Output ONLY the extracted text, preserving the original structure. No explanations.`
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
      temperature: 0.1,
      max_tokens: 2000
    });

    const extractedText = response.choices[0]?.message?.content?.trim();
    
    if (!extractedText || extractedText.length < 10) {
      throw new Error("Could not read text from image. Please try a clearer photo.");
    }
    
    console.log("✅ OCR complete!");
    console.log("📝 Characters extracted:", extractedText.length);
    console.log("📝 Preview:", extractedText.substring(0, 200).replace(/\n/g, ' '));
    
    return extractedText;
  } catch (error) {
    console.error("❌ OCR error:", error.message);
    
    // Try fallback model if main model fails
    if (error.message.includes('model') || error.message.includes('not found')) {
      console.log("📤 Trying fallback model (Llama 3.2 Vision)...");
      return await tryFallbackOCR(imagePath);
    }
    
    throw new Error("Failed to read prescription: " + error.message);
  }
};

/**
 * Fallback OCR using Llama 3.2 Vision
 */
const tryFallbackOCR = async (imagePath) => {
  const absolutePath = path.resolve(imagePath);
  const imageBuffer = fs.readFileSync(absolutePath);
  const base64Image = imageBuffer.toString('base64');
  const mimeType = getMimeType(imagePath);

  try {
    const response = await client.chat.completions.create({
      model: "meta-llama/Llama-3.2-11B-Vision-Instruct-Turbo",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extract ALL text from this prescription image. Include medicine names, dosages, frequencies, doctor name, patient name. Output only the text, no explanations."
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
      temperature: 0.1,
      max_tokens: 2000
    });

    const text = response.choices[0]?.message?.content?.trim();
    
    if (text && text.length >= 10) {
      console.log("✅ Fallback OCR complete!");
      console.log("📝 Characters:", text.length);
      return text;
    }
    
    throw new Error("Fallback OCR also failed");
  } catch (e) {
    throw new Error("Could not read prescription. Please try a clearer image.");
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
