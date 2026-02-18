import FamilyMember from "../models/FamilyMember.js";
import User from "../models/User.js";

// @desc    Add a new family member
// @route   POST /api/family
export const addFamilyMember = async (req, res) => {
  try {
    const {
      name, relationship, email, role,
      dateOfBirth, bloodGroup,
      emergencyContact, allergies, conditions, notes
    } = req.body;

    const member = await FamilyMember.create({
      owner: req.user._id,
      name,
      relationship,
      email: email || undefined,
      role: role || "member",
      dateOfBirth: dateOfBirth || null,
      bloodGroup: bloodGroup || "",
      emergencyContact: emergencyContact || { phone: "", isEmergency: false },
      allergies: allergies || [],
      conditions: conditions || [],
      notes: notes || ""
    });

    // Add reference to user's familyMembers array
    await User.findByIdAndUpdate(req.user._id, {
      $push: { familyMembers: member._id }
    });

    res.status(201).json({
      success: true,
      message: "Family member added successfully",
      data: member
    });
  } catch (error) {
    console.error("Add family member error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to add family member"
    });
  }
};

// @desc    Get all family members for current user
// @route   GET /api/family
export const getFamilyMembers = async (req, res) => {
  try {
    const { status } = req.query;

    const filter = { owner: req.user._id };
    if (status && status !== "all") {
      filter.status = status;
    } else {
      // By default, exclude removed members
      filter.status = { $ne: "removed" };
    }

    const members = await FamilyMember.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: members,
      count: members.length
    });
  } catch (error) {
    console.error("Get family members error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch family members"
    });
  }
};

// @desc    Get single family member
// @route   GET /api/family/:id
export const getFamilyMember = async (req, res) => {
  try {
    const member = await FamilyMember.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Family member not found"
      });
    }

    res.json({ success: true, data: member });
  } catch (error) {
    console.error("Get family member error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch family member"
    });
  }
};

// @desc    Update a family member
// @route   PUT /api/family/:id
export const updateFamilyMember = async (req, res) => {
  try {
    const allowedUpdates = [
      "name", "relationship", "email", "role",
      "dateOfBirth", "bloodGroup", "profilePicture",
      "emergencyContact", "allergies", "conditions", "notes"
    ];

    const updates = {};
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    const member = await FamilyMember.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      updates,
      { new: true, runValidators: true }
    );

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Family member not found"
      });
    }

    res.json({
      success: true,
      message: "Family member updated successfully",
      data: member
    });
  } catch (error) {
    console.error("Update family member error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update family member"
    });
  }
};

// @desc    Remove a family member (soft delete)
// @route   DELETE /api/family/:id
export const removeFamilyMember = async (req, res) => {
  try {
    const member = await FamilyMember.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { status: "removed" },
      { new: true }
    );

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Family member not found"
      });
    }

    // Remove reference from user's familyMembers array
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { familyMembers: member._id }
    });

    res.json({
      success: true,
      message: "Family member removed successfully"
    });
  } catch (error) {
    console.error("Remove family member error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove family member"
    });
  }
};

// @desc    Invite an existing user as caretaker
// @route   POST /api/family/invite
export const inviteCaretaker = async (req, res) => {
  try {
    const { email, name, relationship } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required for invitation"
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });

    // Check for duplicate invitation
    const existingMember = await FamilyMember.findOne({
      owner: req.user._id,
      email: email.toLowerCase(),
      status: { $ne: "removed" }
    });

    if (existingMember) {
      return res.status(400).json({
        success: false,
        message: "This person is already in your family list"
      });
    }

    const member = await FamilyMember.create({
      owner: req.user._id,
      name: name || (existingUser ? existingUser.name : "Invited User"),
      relationship: relationship || "Other",
      email: email.toLowerCase(),
      linkedUser: existingUser ? existingUser._id : null,
      role: "caretaker",
      status: existingUser ? "active" : "pending"
    });

    await User.findByIdAndUpdate(req.user._id, {
      $push: { familyMembers: member._id }
    });

    res.status(201).json({
      success: true,
      message: existingUser
        ? "Caretaker added successfully"
        : "Invitation sent (user will be linked when they sign up)",
      data: member
    });
  } catch (error) {
    console.error("Invite caretaker error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to invite caretaker"
    });
  }
};

// @desc    Get emergency info for all family members
// @route   GET /api/family/emergency
export const getEmergencyInfo = async (req, res) => {
  try {
    const members = await FamilyMember.find({
      owner: req.user._id,
      status: "active"
    })
      .select("name relationship bloodGroup allergies conditions emergencyContact profilePicture")
      .lean();

    // Filter to only members with emergency-relevant data
    const emergencyData = members.filter(m =>
      m.emergencyContact?.phone ||
      m.emergencyContact?.isEmergency ||
      m.allergies?.length > 0 ||
      m.conditions?.length > 0 ||
      m.bloodGroup
    );

    res.json({
      success: true,
      data: emergencyData,
      count: emergencyData.length
    });
  } catch (error) {
    console.error("Get emergency info error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch emergency info"
    });
  }
};
