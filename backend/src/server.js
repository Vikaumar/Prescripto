import dotenv from "dotenv";
import connectDB from "./config/db.js";
dotenv.config();

import app from "./app.js";

const PORT = process.env.PORT || 5000;

/* -------------------- START SERVER -------------------- */
const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
      console.log(`📱 Access from network: http://172.22.31.69:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Server failed to start:", error.message);
    process.exit(1);
  }
};

startServer();