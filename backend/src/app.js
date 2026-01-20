import express from "express";
import cors from "cors";
import errorHandler from "./middleware/errorHandler.js";
import prescriptionRoutes from "./routes/prescriptionRoutes.js";
import medicineRoutes from "./routes/medicineRoutes.js";

const app = express();


/* -------------------- MIDDLEWARES -------------------- */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* -------------------- HEALTH CHECK -------------------- */
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Prescripto backend is running 🚀",
  });
});
/* -------------------- ROUTES -------------------- */
app.use("/api/prescription", prescriptionRoutes);
app.use("/api/medicine", medicineRoutes);

/* ❗ Error middleware ALWAYS LAST */
app.use(errorHandler);

export default app;