import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createReminder,
  getReminders,
  getReminder,
  updateReminder,
  deleteReminder,
  toggleReminder,
  logDose,
  getTodaysDoses,
  getAdherenceStats,
  savePushSubscription
} from "../controllers/reminderController.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// Reminder CRUD routes
router.post("/", createReminder);                    // Create reminder
router.get("/", getReminders);                       // Get all reminders
router.get("/today", getTodaysDoses);               // Get today's doses
router.get("/stats", getAdherenceStats);            // Get adherence statistics
router.get("/:id", getReminder);                    // Get single reminder
router.put("/:id", updateReminder);                 // Update reminder
router.delete("/:id", deleteReminder);              // Delete reminder
router.patch("/:id/toggle", toggleReminder);        // Toggle active/paused

// Dose logging
router.post("/:id/log", logDose);                   // Log dose (taken/skipped/snoozed)

// Push notifications
router.post("/subscribe", savePushSubscription);    // Save push subscription

export default router;
