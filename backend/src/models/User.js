import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide your name"],
    trim: true,
    maxLength: [50, "Name cannot exceed 50 characters"]
  },
  email: {
    type: String,
    required: [true, "Please provide your email"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"]
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minLength: [6, "Password must be at least 6 characters"],
    select: false // Don't include password in queries by default
  },
  profilePicture: {
    type: String,
    default: null
  },
  prescriptions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Prescription"
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date
  }
});

// Hash password before saving
userSchema.pre("save", async function() {
  if (!this.isModified("password")) return;
  
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
