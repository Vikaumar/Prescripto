import {
  searchNearbyPharmacies,
  getPharmacyDetails,
  compareMedicinePrices,
  processRefillRequest,
} from "../services/pharmacyService.js";
import Pharmacy from "../models/Pharmacy.js";

/**
 * Search nearby pharmacies
 * GET /api/pharmacy/search?lat=X&lng=Y&radius=Z
 */
export const searchPharmacies = async (req, res, next) => {
  try {
    const { lat, lng, radius } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude are required",
      });
    }

    const pharmacies = await searchNearbyPharmacies(
      parseFloat(lat),
      parseFloat(lng),
      parseInt(radius) || 5000
    );

    res.status(200).json({
      success: true,
      count: pharmacies.length,
      data: pharmacies,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get pharmacy details
 * GET /api/pharmacy/details/:placeId
 */
export const pharmacyDetails = async (req, res, next) => {
  try {
    const { placeId } = req.params;

    const details = await getPharmacyDetails(placeId);

    if (!details) {
      return res.status(404).json({
        success: false,
        message: "Pharmacy not found",
      });
    }

    res.status(200).json({
      success: true,
      data: details,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Compare medicine prices
 * GET /api/pharmacy/prices/:medicineName
 */
export const comparePrices = async (req, res, next) => {
  try {
    const { medicineName } = req.params;

    if (!medicineName) {
      return res.status(400).json({
        success: false,
        message: "Medicine name is required",
      });
    }

    const priceData = await compareMedicinePrices(
      decodeURIComponent(medicineName)
    );

    res.status(200).json({
      success: true,
      data: priceData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Submit a refill request
 * POST /api/pharmacy/refill
 */
export const submitRefillRequest = async (req, res, next) => {
  try {
    const { medicineName, quantity, pharmacyName, prescriptionId, notes } =
      req.body;

    if (!medicineName) {
      return res.status(400).json({
        success: false,
        message: "Medicine name is required",
      });
    }

    // Save to database if user is authenticated
    if (req.user) {
      let pharmacyDoc = await Pharmacy.findOne({
        userId: req.user._id,
        name: pharmacyName || "Default Pharmacy",
      });

      if (!pharmacyDoc) {
        pharmacyDoc = await Pharmacy.create({
          userId: req.user._id,
          placeId: `custom_${Date.now()}`,
          name: pharmacyName || "Default Pharmacy",
          refillRequests: [],
        });
      }

      pharmacyDoc.refillRequests.push({
        medicineName,
        quantity: quantity || 1,
        prescriptionId,
        pharmacyName,
        notes,
      });

      await pharmacyDoc.save();
    }

    // Process the request
    const result = await processRefillRequest({
      medicineName,
      quantity: quantity || 1,
      pharmacyName,
      prescriptionId,
      notes,
      userId: req.user?._id,
    });

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get refill request history
 * GET /api/pharmacy/refills
 */
export const getRefillHistory = async (req, res, next) => {
  try {
    const pharmacies = await Pharmacy.find({ userId: req.user._id })
      .select("name refillRequests")
      .sort({ updatedAt: -1 });

    // Flatten all refill requests with pharmacy info
    const refills = pharmacies.flatMap((ph) =>
      ph.refillRequests.map((req) => ({
        ...req.toObject(),
        pharmacyName: ph.name,
      }))
    );

    // Sort by most recent
    refills.sort((a, b) => new Date(b.requestedAt) - new Date(a.requestedAt));

    res.status(200).json({
      success: true,
      count: refills.length,
      data: refills,
    });
  } catch (error) {
    next(error);
  }
};
