import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ["user", "assistant"],
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const medicineSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  dosage: {
    type: String,
  },
  frequency: {
    type: String,
  },
  duration: {
    type: String,
  },
  instructions: {
    type: String,
  },
});

const prescriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true
    },
    imagePath: {
      type: String,
      required: true,
    },
    extractedText: {
      type: String,
      required: true,
    },
    medicines: [medicineSchema],
    language: {
      type: String,
      default: "en",
    },
    // AI Analysis fields
    isAnalyzed: {
      type: Boolean,
      default: false,
    },
    simplifiedExplanation: {
      type: String,
    },
    diagnosis: {
      type: String,
    },
    doctorNotes: {
      type: String,
    },
    // Chat history for context
    chatHistory: [chatMessageSchema],
    // Cached translations
    translations: {
      type: Map,
      of: Object,
    },
  },
  {
    timestamps: true,
  }
);

const Prescription = mongoose.model("Prescription", prescriptionSchema);

export default Prescription;
