import fs from "fs";
import path from "path";

// Hugging Face Inference API - Free, no billing required
// Using Microsoft's TrOCR model for document text recognition
const HF_API_URL = "https://api-inference.huggingface.co/models/microsoft/trocr-large-printed";

/**
 * Extract text from prescription image using Hugging Face TrOCR
 * Free inference API - no billing or API key required for basic usage
 * @param {string} imagePath - Path to the prescription image
 * @returns {string} - Extracted text from the image
 */
const extractTextFromImage = async (imagePath) => {
  try {
    console.log("🔍 Reading prescription with Hugging Face OCR:", imagePath);
    
    const absolutePath = path.resolve(imagePath);
    
    if (!fs.existsSync(absolutePath)) {
      throw new Error("Image file not found");
    }
    
    // Read file
    const imageBuffer = fs.readFileSync(absolutePath);
    
    // Call Hugging Face API
    const response = await fetch(HF_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
      },
      body: imageBuffer
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // Model loading - wait and retry
      if (response.status === 503 && errorData.error?.includes('loading')) {
        console.log("⏳ Model is loading, waiting 20 seconds...");
        await new Promise(resolve => setTimeout(resolve, 20000));
        return extractTextFromImage(imagePath); // Retry
      }
      
      throw new Error(errorData.error || `API error: ${response.status}`);
    }

    const result = await response.json();
    
    // TrOCR returns array of text predictions
    let extractedText = '';
    if (Array.isArray(result)) {
      extractedText = result.map(r => r.generated_text || r.text || '').join('\n');
    } else if (result.generated_text) {
      extractedText = result.generated_text;
    } else if (typeof result === 'string') {
      extractedText = result;
    }
    
    if (!extractedText || extractedText.trim().length < 3) {
      // Fallback: Try a different approach - use the image bytes directly with OCR endpoint
      console.log("⚠️ TrOCR returned minimal text, trying document AI...");
      return await tryDocumentOCR(imageBuffer);
    }
    
    console.log("✅ OCR complete!");
    console.log("📝 Preview:", extractedText.substring(0, 100));
    
    return extractedText.trim();
  } catch (error) {
    console.error("OCR error:", error.message);
    
    // If HuggingFace fails, fall back to basic extraction
    if (error.message.includes('loading') || error.message.includes('503')) {
      throw new Error("AI model is warming up. Please try again in 30 seconds.");
    }
    
    throw new Error("Failed to read prescription: " + error.message);
  }
};

/**
 * Fallback OCR using Donut document model
 */
const tryDocumentOCR = async (imageBuffer) => {
  const DONUT_URL = "https://api-inference.huggingface.co/models/naver-clova-ix/donut-base-finetuned-cord-v2";
  
  try {
    const response = await fetch(DONUT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
      },
      body: imageBuffer
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 503) {
        throw new Error("Model loading, please wait 30 seconds and retry");
      }
      throw new Error(errorData.error || "Document OCR failed");
    }

    const result = await response.json();
    
    // Donut returns structured output
    if (result[0]?.generated_text) {
      // Parse JSON-like output from Donut
      let text = result[0].generated_text;
      // Clean up the structured output
      text = text.replace(/<[^>]+>/g, ' '); // Remove XML-like tags
      text = text.replace(/\s+/g, ' ').trim();
      return text;
    }
    
    throw new Error("Could not extract text from document");
  } catch (err) {
    console.error("Document OCR fallback failed:", err.message);
    throw err;
  }
};

export default extractTextFromImage;
