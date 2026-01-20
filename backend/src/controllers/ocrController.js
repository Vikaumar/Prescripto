import extractTextFromImage from "../services/ocrService.js";
import Prescription from "../models/Prescription.js";

export const uploadPrescription = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image uploaded",
      });
    }

    const imagePath = req.file.path;
    const extractedText = await extractTextFromImage(imagePath);

    const prescription = await Prescription.create({
      imagePath,
      extractedText,
    });

    res.status(201).json({
      success: true,
      message: "Prescription processed successfully",
      data: prescription,
    });
  } catch (error) {
    next(error);
  }
};
