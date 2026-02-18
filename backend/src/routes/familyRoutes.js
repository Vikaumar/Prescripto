import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  addFamilyMember,
  getFamilyMembers,
  getFamilyMember,
  updateFamilyMember,
  removeFamilyMember,
  inviteCaretaker,
  getEmergencyInfo
} from "../controllers/familyController.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// Family member CRUD
router.post("/", addFamilyMember);               // Add family member
router.get("/", getFamilyMembers);                // List all members
router.get("/emergency", getEmergencyInfo);       // Get emergency info (before :id)
router.get("/:id", getFamilyMember);              // Get single member
router.put("/:id", updateFamilyMember);           // Update member
router.delete("/:id", removeFamilyMember);        // Remove member

// Caretaker invitation
router.post("/invite", inviteCaretaker);          // Invite caretaker by email

export default router;
