import multer from "multer";
import path from "path";

/* ---------- STORAGE ---------- */
// Use memory storage for Cloudinary upload (we upload the buffer directly)
const storage = multer.memoryStorage();

// Alternative: Keep disk storage for OCR processing, then upload to Cloudinary
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

/* ---------- FILE FILTER ---------- */
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/;
  const isValid =
    allowedTypes.test(path.extname(file.originalname).toLowerCase()) &&
    allowedTypes.test(file.mimetype);

  if (isValid) cb(null, true);
  else cb(new Error("Only images are allowed (JPEG, JPG, PNG)"), false);
};

/* ---------- MULTER INSTANCES ---------- */
// For direct cloud upload (memory storage)
export const uploadMemory = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// For OCR processing that needs disk file (disk storage)
export const uploadDisk = multer({
  storage: diskStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// Default export for backward compatibility
export default uploadDisk;
