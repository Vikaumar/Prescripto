import express from "express";
import User from "../models/User.js";
import Prescription from "../models/Prescription.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// @route   GET /api/user/profile
// @desc    Get user profile with stats
// @access  Private
router.get("/profile", async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const prescriptionCount = await Prescription.countDocuments({ userId: req.user._id });
    const lastPrescription = await Prescription.findOne({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .select("createdAt");

    res.json({
      success: true,
      profile: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      },
      stats: {
        totalPrescriptions: prescriptionCount,
        lastUpload: lastPrescription?.createdAt || null
      }
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch profile"
    });
  }
});

// @route   PUT /api/user/profile
// @desc    Update user profile
// @access  Private
router.put("/profile", async (req, res) => {
  try {
    const { name, email, profilePicture } = req.body;

    // Validate input - at least one field required
    if (!name && !email && (profilePicture === undefined)) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least one field to update"
      });
    }

    // Check if email is already taken by another user
    if (email && email !== req.user.email) {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser && existingUser._id.toString() !== req.user._id.toString()) {
        return res.status(400).json({
          success: false,
          message: "Email is already in use"
        });
      }
    }

    // Update user
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email.toLowerCase();
    if (profilePicture !== undefined) updateData.profilePicture = profilePicture;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update profile"
    });
  }
});

// @route   GET /api/user/prescriptions
// @desc    Get user's prescription history
// @access  Private
router.get("/prescriptions", async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .select("_id extractedText medicines isAnalyzed diagnosis createdAt");

    res.json({
      success: true,
      prescriptions: prescriptions.map(p => ({
        id: p._id,
        extractedText: p.extractedText?.substring(0, 100) + (p.extractedText?.length > 100 ? "..." : ""),
        medicineCount: p.medicines?.length || 0,
        isAnalyzed: p.isAnalyzed,
        diagnosis: p.diagnosis,
        createdAt: p.createdAt
      }))
    });
  } catch (error) {
    console.error("Get prescriptions error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch prescriptions"
    });
  }
});

// @route   DELETE /api/user/prescriptions/:id
// @desc    Delete a prescription
// @access  Private
router.delete("/prescriptions/:id", async (req, res) => {
  try {
    const prescription = await Prescription.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found"
      });
    }

    await Prescription.deleteOne({ _id: req.params.id });

    res.json({
      success: true,
      message: "Prescription deleted successfully"
    });
  } catch (error) {
    console.error("Delete prescription error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete prescription"
    });
  }
});

export default router;
