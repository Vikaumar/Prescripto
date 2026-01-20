import express from "express";
import {
  analyzeController,
  chatController,
  translateController,
  medicineInfoController,
  explainTermController,
  getLanguagesController,
} from "../controllers/medicineController.js";

const router = express.Router();

// Analyze prescription with AI
router.post("/analyze/:prescriptionId", analyzeController);

// Chat with AI about prescription
router.post("/chat", chatController);

// Translate prescription
router.post("/translate/:prescriptionId", translateController);

// Get medicine information
router.get("/info/:medicineName", medicineInfoController);

// Explain medical term
router.get("/explain/:term", explainTermController);

// Get supported languages
router.get("/languages", getLanguagesController);

export default router;
