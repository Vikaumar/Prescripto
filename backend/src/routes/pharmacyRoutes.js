import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  searchPharmacies,
  pharmacyDetails,
  comparePrices,
  submitRefillRequest,
  getRefillHistory,
} from "../controllers/pharmacyController.js";

const router = express.Router();

// Public routes (no auth needed for search/browse)
router.get("/search", searchPharmacies);
router.get("/details/:placeId", pharmacyDetails);
router.get("/prices/:medicineName", comparePrices);

// Protected routes (auth required)
router.post("/refill", protect, submitRefillRequest);
router.get("/refills", protect, getRefillHistory);

export default router;
