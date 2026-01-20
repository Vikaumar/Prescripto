import { analyzePrescription, chatWithAI, getMedicineInfo } from "../services/aiService.js";
import { translateText, translatePrescriptionAnalysis, SUPPORTED_LANGUAGES } from "../services/translationService.js";
import { simplifyMedicalTerms, explainMedicalTerm } from "../utils/simplifyText.js";
import Prescription from "../models/Prescription.js";

/**
 * Analyze a prescription using AI
 * POST /api/medicine/analyze/:prescriptionId
 */
export const analyzeController = async (req, res, next) => {
  try {
    const { prescriptionId } = req.params;
    
    const prescription = await Prescription.findById(prescriptionId);
    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found",
      });
    }

    // Analyze with AI
    const analysis = await analyzePrescription(prescription.extractedText);

    // Update prescription with analysis
    prescription.medicines = analysis.medicines || [];
    prescription.simplifiedExplanation = analysis.simplifiedExplanation;
    prescription.diagnosis = analysis.diagnosis;
    prescription.doctorNotes = analysis.doctorNotes;
    prescription.isAnalyzed = true;
    await prescription.save();

    res.status(200).json({
      success: true,
      message: "Prescription analyzed successfully",
      data: {
        prescription,
        analysis,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Chat with AI about prescription
 * POST /api/medicine/chat
 */
export const chatController = async (req, res, next) => {
  try {
    const { message, prescriptionId } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    let prescriptionContext = null;
    let chatHistory = [];

    if (prescriptionId) {
      const prescription = await Prescription.findById(prescriptionId);
      if (prescription) {
        prescriptionContext = {
          medicines: prescription.medicines,
          simplifiedExplanation: prescription.simplifiedExplanation,
          diagnosis: prescription.diagnosis,
        };
        chatHistory = prescription.chatHistory || [];
      }
    }

    // Get AI response
    const aiResponse = await chatWithAI(message, prescriptionContext, chatHistory);

    // Save chat history if prescription exists
    if (prescriptionId) {
      await Prescription.findByIdAndUpdate(prescriptionId, {
        $push: {
          chatHistory: [
            { role: "user", message, timestamp: new Date() },
            { role: "assistant", message: aiResponse, timestamp: new Date() },
          ],
        },
      });
    }

    res.status(200).json({
      success: true,
      data: {
        response: aiResponse,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Translate prescription to target language
 * POST /api/medicine/translate/:prescriptionId
 */
export const translateController = async (req, res, next) => {
  try {
    const { prescriptionId } = req.params;
    const { language } = req.body;

    if (!language) {
      return res.status(400).json({
        success: false,
        message: "Language code is required",
        supportedLanguages: SUPPORTED_LANGUAGES,
      });
    }

    const prescription = await Prescription.findById(prescriptionId);
    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found",
      });
    }

    // Check if translation already cached
    const cachedTranslation = prescription.translations?.get(language);
    if (cachedTranslation) {
      return res.status(200).json({
        success: true,
        message: "Translation retrieved from cache",
        data: cachedTranslation,
      });
    }

    // Translate the simplified explanation
    const translatedExplanation = prescription.simplifiedExplanation
      ? await translateText(prescription.simplifiedExplanation, language)
      : null;

    // Translate medicine instructions
    const translatedMedicines = await Promise.all(
      (prescription.medicines || []).map(async (med) => ({
        name: med.name, // Keep medicine name in English
        dosage: med.dosage,
        frequency: med.frequency ? await translateText(med.frequency, language) : null,
        duration: med.duration ? await translateText(med.duration, language) : null,
        instructions: med.instructions ? await translateText(med.instructions, language) : null,
      }))
    );

    const translatedData = {
      language,
      languageName: SUPPORTED_LANGUAGES[language],
      simplifiedExplanation: translatedExplanation,
      medicines: translatedMedicines,
    };

    // Cache the translation
    if (!prescription.translations) {
      prescription.translations = new Map();
    }
    prescription.translations.set(language, translatedData);
    await prescription.save();

    res.status(200).json({
      success: true,
      message: "Prescription translated successfully",
      data: translatedData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get medicine information
 * GET /api/medicine/info/:medicineName
 */
export const medicineInfoController = async (req, res, next) => {
  try {
    const { medicineName } = req.params;

    if (!medicineName) {
      return res.status(400).json({
        success: false,
        message: "Medicine name is required",
      });
    }

    const info = await getMedicineInfo(medicineName);

    res.status(200).json({
      success: true,
      data: info,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Explain a medical term
 * GET /api/medicine/explain/:term
 */
export const explainTermController = async (req, res, next) => {
  try {
    const { term } = req.params;

    const explanation = await explainMedicalTerm(term);

    res.status(200).json({
      success: true,
      data: {
        term,
        explanation,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get supported languages
 * GET /api/medicine/languages
 */
export const getLanguagesController = (req, res) => {
  res.status(200).json({
    success: true,
    data: SUPPORTED_LANGUAGES,
  });
};
