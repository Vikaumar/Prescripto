import { HfInference } from "@huggingface/inference";
import Groq from "groq-sdk";
import fs from "fs";
import path from "path";

// Initialize Hugging Face client - FREE
let hfClient = null;
const HF_API_KEY = process.env.HF_API_KEY || process.env.HUGGINGFACE_API_KEY;
if (HF_API_KEY && HF_API_KEY !== "your_key_here" && HF_API_KEY !== "your_huggingface_key_here") {
  hfClient = new HfInference(HF_API_KEY);
  console.log("✅ Hugging Face ML initialized (FREE tier)");
} else {
  console.warn("⚠️ HF_API_KEY not set");
}

// Initialize Groq for text enhancement
let groqClient = null;
try {
  const apiKey = process.env.GROQ_API_KEY;
  if (apiKey && apiKey !== "your_key_here") {
    groqClient = new Groq({ apiKey });
    console.log("✅ Groq AI initialized (FREE - no rate limits!)");
  }
} catch (e) {}

/**
 * Extract text using Hugging Face Document Question Answering
 * This model is available on FREE tier
 */
const extractWithHuggingFace = async (imagePath) => {
  if (!hfClient) {
    throw new Error("HF not configured");
  }

  const absolutePath = path.resolve(imagePath);
  const imageBuffer = fs.readFileSync(absolutePath);

  console.log("🤖 Using ML Document Understanding...");

  try {
    // Use Document Question Answering - works on FREE tier
    const result = await hfClient.documentQuestionAnswering({
      model: "impira/layoutlm-document-qa",
      inputs: {
        image: imageBuffer,
        question: "What are all the medicine names, dosages and instructions in this prescription?"
      }
    });

    console.log("📄 Document QA result:", result);
    
    if (result && result.answer) {
      return result.answer;
    }

    // Try a second question for more info
    const result2 = await hfClient.documentQuestionAnswering({
      model: "impira/layoutlm-document-qa",
      inputs: {
        image: imageBuffer,
        question: "What text is written in this document?"
      }
    });

    if (result2 && result2.answer) {
      return result2.answer;
    }

    throw new Error("No answer from document QA");
  } catch (error) {
    console.log("⚠️ Document QA failed:", error.message);
    
    // Try image-to-text as fallback
    try {
      console.log("📤 Trying image captioning...");
      const caption = await hfClient.imageToText({
        data: imageBuffer,
        model: "Salesforce/blip-image-captioning-large"
      });
      
      if (caption && caption.generated_text) {
        return caption.generated_text;
      }
    } catch (e) {
      console.log("⚠️ Image captioning failed:", e.message);
    }
    
    throw error;
  }
};

/**
 * OCR.space - reliable fallback
 */
const extractWithOCRSpace = async (imagePath) => {
  const absolutePath = path.resolve(imagePath);
  const imageBuffer = fs.readFileSync(absolutePath);
  const base64Image = imageBuffer.toString('base64');
  const mimeType = getMimeType(imagePath);

  console.log("📤 Using OCR.space Engine 1...");

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
    const text = result.ParsedResults.map(r => r.ParsedText || '').join('\n').trim();
    console.log("✅ OCR.space extracted:", text.length, "chars");
    return text;
  }
  
  throw new Error("OCR.space returned no results");
};

/**
 * Use Groq to smartly extract prescription info from raw text
 */
const enhanceAndExtractWithGroq = async (rawText, imagePath) => {
  if (!groqClient) {
    return rawText;
  }

  console.log("🧠 Using AI to understand prescription...");

  // Read image for vision if available
  const absolutePath = path.resolve(imagePath);
  const imageBuffer = fs.readFileSync(absolutePath);
  const base64Image = imageBuffer.toString('base64');
  const mimeType = getMimeType(imagePath);

  try {
    // Try vision understanding with mixtral
    const response = await groqClient.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{
        role: "user", 
        content: `You are analyzing a medical prescription image. The OCR extracted this text:

"""
${rawText}
"""

This text may have OCR errors. Please:
1. Identify all medicine names (correct any misspellings)
2. Find dosages (mg, ml, tablets, etc.)
3. Find frequencies (daily, twice daily, after meals, etc.)
4. Extract doctor name, patient name, date if visible
5. Include any diagnosis

Return a clean version of the prescription with corrected text. Format it clearly with each medicine on a new line.`
      }],
      temperature: 0.2,
      max_tokens: 1500
    });

    const enhanced = response.choices[0]?.message?.content?.trim();
    if (enhanced && enhanced.length > 20) {
      console.log("✅ AI enhanced text successfully!");
      return enhanced;
    }
    return rawText;
  } catch (e) {
    console.log("⚠️ AI enhancement skipped:", e.message);
    return rawText;
  }
};

/**
 * Main extraction function
 */
const extractTextFromImage = async (imagePath) => {
  try {
    console.log("🔍 Reading prescription:", imagePath);
    
    const absolutePath = path.resolve(imagePath);
    if (!fs.existsSync(absolutePath)) {
      throw new Error("Image not found");
    }

    let extractedText = '';

    // Try HF Document QA first
    if (hfClient) {
      try {
        const hfText = await extractWithHuggingFace(imagePath);
        if (hfText && hfText.length > 10) {
          extractedText = hfText;
          console.log("✅ HF extracted:", extractedText.length, "chars");
        }
      } catch (e) {
        console.log("⚠️ HF failed:", e.message);
      }
    }

    // Always try OCR.space and combine results
    try {
      const ocrText = await extractWithOCRSpace(imagePath);
      if (ocrText.length > extractedText.length) {
        extractedText = ocrText;
      } else if (ocrText.length > 20 && extractedText.length > 20) {
        // Combine both results
        extractedText = `${extractedText}\n\n${ocrText}`;
      }
    } catch (e) {
      console.log("⚠️ OCR.space failed:", e.message);
    }

    if (!extractedText || extractedText.length < 10) {
      throw new Error("Could not extract text. Please try a clearer image.");
    }

    // Enhance with Groq AI
    const enhanced = await enhanceAndExtractWithGroq(extractedText, imagePath);
    
    console.log("📝 Final text length:", enhanced.length);
    
    return enhanced;
  } catch (error) {
    console.error("❌ OCR error:", error.message);
    throw new Error("Failed to read prescription: " + error.message);
  }
};

const getMimeType = (imagePath) => {
  const ext = path.extname(imagePath).toLowerCase();
  return { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' }[ext] || 'image/jpeg';
};

export default extractTextFromImage;
