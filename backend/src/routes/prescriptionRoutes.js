import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import { uploadPrescription } from "../controllers/ocrController.js";

const router = express.Router();

router.post("/upload", upload.single("image"), uploadPrescription);

export default router;
