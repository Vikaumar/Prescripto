import mongoose from "mongoose";

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
});

const prescriptionSchema = new mongoose.Schema(
  {
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
  },
  {
    timestamps: true,
  }
);

const Prescription = mongoose.model("Prescription", prescriptionSchema);

export default Prescription;
