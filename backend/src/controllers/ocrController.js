import fs from 'fs';
import extractTextFromImage from "../services/ocrService.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../services/cloudinaryService.js";
import Prescription from "../models/Prescription.js";

export const uploadPrescription = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image uploaded",
      });
    }

    const localPath = req.file.path;
    
    // Step 1: Extract text from the local image (OCR needs file path)
    const extractedText = await extractTextFromImage(localPath);

    // Step 2: Upload image to Cloudinary
    let cloudinaryResult;
    try {
      cloudinaryResult = await uploadToCloudinary(localPath, 'prescriptions');
    } catch (cloudError) {
      console.error('Cloudinary upload failed:', cloudError);
      // Continue with local path if Cloudinary fails
      cloudinaryResult = null;
    }

    // Step 3: Build prescription data
    const prescriptionData = {
      imagePath: cloudinaryResult ? cloudinaryResult.url : localPath,
      imagePublicId: cloudinaryResult ? cloudinaryResult.publicId : null,
      extractedText,
    };
    
    if (req.user) {
      prescriptionData.userId = req.user._id;
    }

    // Step 4: Save to database
    const prescription = await Prescription.create(prescriptionData);

    // Step 5: Clean up local file after successful Cloudinary upload
    if (cloudinaryResult && fs.existsSync(localPath)) {
      fs.unlink(localPath, (err) => {
        if (err) console.error('Failed to delete local file:', err);
      });
    }

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

/**
 * Delete prescription by ID
 * DELETE /api/prescription/:id
 */
export const deletePrescription = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const prescription = await Prescription.findById(id);
    
    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found",
      });
    }

    // Delete image from Cloudinary if it exists
    if (prescription.imagePublicId) {
      try {
        await deleteFromCloudinary(prescription.imagePublicId);
      } catch (cloudError) {
        console.error('Failed to delete from Cloudinary:', cloudError);
      }
    }

    // Delete prescription from database
    await Prescription.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Prescription deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
