import dotenv from "dotenv";
import connectDB from "./config/db.js";
dotenv.config();

import app from "./app.js";

const PORT = process.env.PORT || 5000;

/* -------------------- START SERVER -------------------- */
const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Server failed to start:", error.message);
    process.exit(1);
  }
};

startServer();