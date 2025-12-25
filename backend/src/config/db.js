import mongoose from "mongoose";
import "./env.js";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`🟢 MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("🔴 MongoDB connection error:", error.message);
    process.exit(1);
  }
};

export default connectDB;