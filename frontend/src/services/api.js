const API_BASE_URL = "http://localhost:5000/api";

/**
 * Upload prescription image
 * @param {File} imageFile - The image file to upload
 * @returns {Promise<Object>} - Prescription data with extracted text
 */
export const uploadPrescription = async (imageFile) => {
  const formData = new FormData();
  formData.append("image", imageFile);

  // Get auth token to link prescription to user
  const token = localStorage.getItem("token");
  const headers = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/prescription/upload`, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to upload prescription");
  }

  return response.json();
};

/**
 * Get prescription by ID
 * @param {string} id - Prescription ID
 * @returns {Promise<Object>} - Prescription data
 */
export const getPrescription = async (id) => {
  const response = await fetch(`${API_BASE_URL}/prescription/${id}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch prescription");
  }

  return response.json();
};

/**
 * Analyze prescription with AI
 * @param {string} prescriptionId - Prescription ID to analyze
 * @returns {Promise<Object>} - Analysis results
 */
export const analyzePrescription = async (prescriptionId) => {
  const response = await fetch(
    `${API_BASE_URL}/medicine/analyze/${prescriptionId}`,
    { method: "POST" }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to analyze prescription");
  }

  return response.json();
};

/**
 * Chat with AI about prescription
 * @param {string} message - User message
 * @param {string} prescriptionId - Optional prescription ID for context
 * @returns {Promise<Object>} - AI response
 */
export const chat = async (message, prescriptionId = null) => {
  const response = await fetch(`${API_BASE_URL}/medicine/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message, prescriptionId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to get response");
  }

  return response.json();
};

/**
 * Translate prescription to target language
 * @param {string} prescriptionId - Prescription ID
 * @param {string} language - Target language code
 * @returns {Promise<Object>} - Translated prescription
 */
export const translatePrescription = async (prescriptionId, language) => {
  const response = await fetch(
    `${API_BASE_URL}/medicine/translate/${prescriptionId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ language }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to translate prescription");
  }

  return response.json();
};

/**
 * Get medicine information
 * @param {string} medicineName - Name of the medicine
 * @returns {Promise<Object>} - Medicine info
 */
export const getMedicineInfo = async (medicineName) => {
  const response = await fetch(
    `${API_BASE_URL}/medicine/info/${encodeURIComponent(medicineName)}`
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to get medicine info");
  }

  return response.json();
};

/**
 * Explain a medical term
 * @param {string} term - Medical term to explain
 * @returns {Promise<Object>} - Explanation
 */
export const explainTerm = async (term) => {
  const response = await fetch(
    `${API_BASE_URL}/medicine/explain/${encodeURIComponent(term)}`
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to explain term");
  }

  return response.json();
};

/**
 * Get supported languages
 * @returns {Promise<Object>} - List of supported languages
 */
export const getLanguages = async () => {
  const response = await fetch(`${API_BASE_URL}/medicine/languages`);

  if (!response.ok) {
    throw new Error("Failed to fetch languages");
  }

  return response.json();
};

export default {
  uploadPrescription,
  getPrescription,
  analyzePrescription,
  chat,
  translatePrescription,
  getMedicineInfo,
  explainTerm,
  getLanguages,
};
