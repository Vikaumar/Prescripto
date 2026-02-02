import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import errorHandler from "./middleware/errorHandler.js";
import prescriptionRoutes from "./routes/prescriptionRoutes.js";
import medicineRoutes from "./routes/medicineRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";

const app = express();

/* -------------------- MIDDLEWARES -------------------- */
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow localhost variations
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    
    // Allow any 192.168.x.x or 172.x.x.x (local network IPs)
    if (origin.match(/^http:\/\/(192\.168\.|172\.\d+\.)/)) {
      return callback(null, true);
    }
    
    // Default: allow for development
    callback(null, true);
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* -------------------- HEALTH CHECK -------------------- */
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Prescripto backend is running 🚀",
  });
});

/* -------------------- ROUTES -------------------- */
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/prescription", prescriptionRoutes);
app.use("/api/medicine", medicineRoutes);

/* ❗ Error middleware ALWAYS LAST */
app.use(errorHandler);

export default app;