import mongoose from "mongoose";

const familyMemberSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Owner is required"],
    index: true
  },
  name: {
    type: String,
    required: [true, "Please provide member name"],
    trim: true,
    maxLength: [50, "Name cannot exceed 50 characters"]
  },
  relationship: {
    type: String,
    required: [true, "Please specify the relationship"],
    trim: true,
    enum: {
      values: ["Mother", "Father", "Spouse", "Son", "Daughter", "Brother", "Sister", "Grandparent", "Grandchild", "Uncle", "Aunt", "Cousin", "Friend", "Other"],
      message: "{VALUE} is not a valid relationship"
    }
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    sparse: true
  },
  linkedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  role: {
    type: String,
    enum: ["member", "caretaker"],
    default: "member"
  },
  status: {
    type: String,
    enum: ["active", "pending", "removed"],
    default: "active"
  },
  profilePicture: {
    type: String,
    default: null
  },
  dateOfBirth: {
    type: Date,
    default: null
  },
  bloodGroup: {
    type: String,
    enum: ["", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    default: ""
  },

  // Emergency Info
  emergencyContact: {
    phone: { type: String, default: "" },
    isEmergency: { type: Boolean, default: false }
  },
  allergies: [{
    type: String,
    trim: true
  }],
  conditions: [{
    type: String,
    trim: true
  }],
  notes: {
    type: String,
    maxLength: [500, "Notes cannot exceed 500 characters"],
    default: ""
  }
}, {
  timestamps: true
});

// Index for fast lookup
familyMemberSchema.index({ owner: 1, status: 1 });

const FamilyMember = mongoose.model("FamilyMember", familyMemberSchema);

export default FamilyMember;
