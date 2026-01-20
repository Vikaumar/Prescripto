import vision from "@google-cloud/vision";
import path from "path";

const client = new vision.ImageAnnotatorClient({
  keyFilename: path.join(process.cwd(), "google-vision-key.json"),
});

const extractTextFromImage = async (imagePath) => {
  try {
    const [result] = await client.textDetection(imagePath);
    const detections = result.textAnnotations;

    if (!detections || detections.length === 0) {
      throw new Error("No text detected in image");
    }

    return detections[0].description; // full extracted text
  } catch (error) {
    console.error("Google Vision OCR error:", error.message);
    throw new Error("OCR processing failed");
  }
};

export default extractTextFromImage;
