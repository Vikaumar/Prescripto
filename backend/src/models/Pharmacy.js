import mongoose from "mongoose";

const refillRequestSchema = new mongoose.Schema({
  medicineName: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
  },
  prescriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Prescription",
  },
  pharmacyName: {
    type: String,
  },
  notes: {
    type: String,
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "ready", "completed", "cancelled"],
    default: "pending",
  },
  requestedAt: {
    type: Date,
    default: Date.now,
  },
});

const pharmacySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    placeId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    address: {
      type: String,
    },
    phone: {
      type: String,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
    },
    location: {
      lat: Number,
      lng: Number,
    },
    isBookmarked: {
      type: Boolean,
      default: false,
    },
    refillRequests: [refillRequestSchema],
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate bookmarks
pharmacySchema.index({ userId: 1, placeId: 1 }, { unique: true });

const Pharmacy = mongoose.model("Pharmacy", pharmacySchema);

export default Pharmacy;
