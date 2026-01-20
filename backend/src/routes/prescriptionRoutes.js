import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import { uploadPrescription, getPrescription, getAllPrescriptions } from "../controllers/ocrController.js";

const router = express.Router();

// Upload prescription image
router.post("/upload", upload.single("image"), uploadPrescription);

// Get single prescription by ID
router.get("/:id", getPrescription);

// Get all prescriptions
router.get("/", getAllPrescriptions);

export default router;
