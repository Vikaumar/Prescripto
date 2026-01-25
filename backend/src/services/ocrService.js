import { HfInference } from "@huggingface/inference";
import Groq from "groq-sdk";
import fs from "fs";
import path from "path";

// Initialize Hugging Face client - FREE (no billing required!)
// Get free API key from: https://huggingface.co/settings/tokens
let hfClient = null;
const HF_API_KEY = process.env.HF_API_KEY || process.env.HUGGINGFACE_API_KEY;
if (HF_API_KEY && HF_API_KEY !== "your_key_here") {
  hfClient = new HfInference(HF_API_KEY);
  console.log("✅ Hugging Face ML OCR initialized (FREE!)");
} else {
  console.warn("⚠️ HF_API_KEY not set - Get free key at: https://huggingface.co/settings/tokens");
}

// Initialize Groq for text enhancement
let groqClient = null;
try {
  const apiKey = process.env.GROQ_API_KEY;
  if (apiKey && apiKey !== "your_key_here") {
    groqClient = new Groq({ apiKey });
  }
} catch (e) {}

/**
 * Extract text using Hugging Face Vision Model
 * Uses Qwen2-VL - excellent for document OCR
 */
const extractWithHuggingFace = async (imagePath) => {
  if (!hfClient) {
    throw new Error("Hugging Face not configured. Set HF_API_KEY in .env");
  }

  const absolutePath = path.resolve(imagePath);
  const imageBuffer = fs.readFileSync(absolutePath);
  const base64Image = imageBuffer.toString('base64');
  const mimeType = getMimeType(imagePath);

  console.log("🤖 Using ML Vision Model (Qwen2-VL)...");

  try {
    // Use Qwen2-VL for vision-to-text
    const response = await hfClient.chatCompletion({
      model: "Qwen/Qwen2-VL-7B-Instruct",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `You are an expert OCR system for reading medical prescriptions. Extract ALL text from this prescription image.

IMPORTANT:
1. Read both printed AND handwritten text
2. Extract medicine names, dosages (mg, ml), frequencies
3. Include doctor name, patient name, date
4. Include diagnosis and doctor notes
5. For unclear text, make your best medical interpretation

Output ONLY the extracted text exactly as it appears, preserving structure. No explanations.`
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
      max_tokens: 2000
    });

    const text = response.choices?.[0]?.message?.content?.trim();
    if (text && text.length > 10) {
      return text;
    }
    throw new Error("ML model returned insufficient text");
  } catch (error) {
    console.log("⚠️ Qwen2-VL failed, trying BLIP...");
    
    // Fallback to image-to-text model
    try {
      const result = await hfClient.imageToText({
        data: imageBuffer,
        model: "Salesforce/blip-image-captioning-large"
      });
      
      if (result.generated_text) {
        return result.generated_text;
      }
    } catch (e) {
      console.log("⚠️ BLIP also failed");
    }
    
    throw error;
  }
};

/**
 * Enhance extracted text with Groq AI
 */
const enhanceWithGroq = async (rawText) => {
  if (!groqClient || rawText.length < 20) {
    return rawText;
  }

  try {
    console.log("🧠 Enhancing text with AI...");
    
    const response = await groqClient.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{
        role: "user",
        content: `Clean up this OCR text from a prescription. Fix obvious errors, identify medicine names correctly.

RAW TEXT:
"""
${rawText}
"""

Return only the cleaned prescription text, keeping structure.`
      }],
      temperature: 0.2,
      max_tokens: 1500
    });

    const enhanced = response.choices[0]?.message?.content?.trim();
    if (enhanced && enhanced.length > 10) {
      console.log("✅ Text enhanced!");
      return enhanced;
    }
    return rawText;
  } catch (e) {
    return rawText;
  }
};

/**
 * Main function: Extract text from prescription
 */
const extractTextFromImage = async (imagePath) => {
  try {
    console.log("🔍 Reading prescription:", imagePath);
    
    const absolutePath = path.resolve(imagePath);
    if (!fs.existsSync(absolutePath)) {
      throw new Error("Image not found");
    }

    let extractedText = '';

    // Try Hugging Face ML first
    if (hfClient) {
      try {
        extractedText = await extractWithHuggingFace(imagePath);
        console.log("✅ ML OCR complete! Chars:", extractedText.length);
      } catch (e) {
        console.log("⚠️ ML OCR failed:", e.message);
      }
    }

    // Fallback to OCR.space if ML fails
    if (!extractedText || extractedText.length < 20) {
      console.log("📤 Falling back to OCR.space...");
      extractedText = await fallbackOCRSpace(imagePath);
    }

    if (!extractedText || extractedText.length < 10) {
      throw new Error("Could not read prescription. Please try a clearer image.");
    }

    // Enhance with Groq
    const enhanced = await enhanceWithGroq(extractedText);
    
    console.log("📝 Final text length:", enhanced.length);
    console.log("📝 Preview:", enhanced.substring(0, 150).replace(/\n/g, ' '));
    
    return enhanced;
  } catch (error) {
    console.error("❌ OCR error:", error.message);
    throw new Error("Failed to read prescription: " + error.message);
  }
};

/**
 * Fallback OCR using OCR.space
 */
const fallbackOCRSpace = async (imagePath) => {
  const absolutePath = path.resolve(imagePath);
  const imageBuffer = fs.readFileSync(absolutePath);
  const base64Image = imageBuffer.toString('base64');
  const mimeType = getMimeType(imagePath);

  const formBody = new URLSearchParams();
  formBody.append('apikey', 'K85674328288957');
  formBody.append('base64Image', `data:${mimeType};base64,${base64Image}`);
  formBody.append('language', 'eng');
  formBody.append('detectOrientation', 'true');
  formBody.append('scale', 'true');
  formBody.append('isTable', 'true');
  formBody.append('OCREngine', '1');

  const response = await fetch('https://api.ocr.space/parse/image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formBody.toString()
  });

  const result = await response.json();
  
  if (result.ParsedResults?.length) {
    return result.ParsedResults.map(r => r.ParsedText || '').join('\n').trim();
  }
  
  throw new Error("OCR.space also failed");
};

const getMimeType = (imagePath) => {
  const ext = path.extname(imagePath).toLowerCase();
  const types = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp'
  };
  return types[ext] || 'image/jpeg';
};

export default extractTextFromImage;
