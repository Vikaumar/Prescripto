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

/**
 * Get single prescription by ID
 * GET /api/prescription/:id
 */
export const getPrescription = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const prescription = await Prescription.findById(id);
    
    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found",
      });
    }

    res.status(200).json({
      success: true,
      data: prescription,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all prescriptions
 * GET /api/prescription
 */
export const getAllPrescriptions = async (req, res, next) => {
  try {
    const prescriptions = await Prescription.find()
      .sort({ createdAt: -1 })
      .select("-chatHistory -translations"); // Exclude large fields for list view

    res.status(200).json({
      success: true,
      count: prescriptions.length,
      data: prescriptions,
    });
  } catch (error) {
    next(error);
  }
};

