/**
 * Pharmacy Service
 * Provides nearby pharmacy search (mock data), medicine price comparison,
 * and refill request handling — no paid APIs required.
 */

// ─── Mock Pharmacy Data ───────────────────────────────────────────
// Realistic Indian pharmacy chains and local stores
const MOCK_PHARMACIES = [
  {
    placeId: "ph_apollo_001",
    name: "Apollo Pharmacy",
    address: "Shop 12, MG Road, Near City Mall",
    phone: "+91 98765 43210",
    rating: 4.5,
    totalRatings: 328,
    isOpen: true,
    openHours: "24 hours",
    type: "Chain Pharmacy",
    distance: 0.8,
    location: { lat: 0, lng: 0 },
  },
  {
    placeId: "ph_medplus_002",
    name: "MedPlus",
    address: "45, Station Road, Opposite Railway Station",
    phone: "+91 98765 43211",
    rating: 4.2,
    totalRatings: 215,
    isOpen: true,
    openHours: "8:00 AM – 11:00 PM",
    type: "Chain Pharmacy",
    distance: 1.2,
    location: { lat: 0, lng: 0 },
  },
  {
    placeId: "ph_netmeds_003",
    name: "Netmeds Store",
    address: "Plot 8, Sector 15, Market Area",
    phone: "+91 98765 43212",
    rating: 4.0,
    totalRatings: 142,
    isOpen: true,
    openHours: "9:00 AM – 10:00 PM",
    type: "Online + Store",
    distance: 1.5,
    location: { lat: 0, lng: 0 },
  },
  {
    placeId: "ph_wellness_004",
    name: "Wellness Forever",
    address: "Ground Floor, Sunshine Complex, Main Street",
    phone: "+91 98765 43213",
    rating: 4.3,
    totalRatings: 189,
    isOpen: false,
    openHours: "8:00 AM – 10:30 PM",
    type: "Chain Pharmacy",
    distance: 2.1,
    location: { lat: 0, lng: 0 },
  },
  {
    placeId: "ph_frank_005",
    name: "Frank Ross Pharmacy",
    address: "18, Park Lane, Near Hospital Junction",
    phone: "+91 98765 43214",
    rating: 4.1,
    totalRatings: 97,
    isOpen: true,
    openHours: "7:30 AM – 11:00 PM",
    type: "Chain Pharmacy",
    distance: 2.8,
    location: { lat: 0, lng: 0 },
  },
  {
    placeId: "ph_jan_006",
    name: "Jan Aushadhi Kendra",
    address: "Government Hospital Complex, Ward 3",
    phone: "+91 98765 43215",
    rating: 3.9,
    totalRatings: 64,
    isOpen: true,
    openHours: "9:00 AM – 6:00 PM",
    type: "Generic Medicine Store",
    distance: 3.2,
    location: { lat: 0, lng: 0 },
  },
  {
    placeId: "ph_local_007",
    name: "Sharma Medical Store",
    address: "Near Bus Stand, Gandhi Nagar",
    phone: "+91 98765 43216",
    rating: 4.4,
    totalRatings: 256,
    isOpen: true,
    openHours: "8:00 AM – 10:00 PM",
    type: "Local Pharmacy",
    distance: 0.5,
    location: { lat: 0, lng: 0 },
  },
  {
    placeId: "ph_1mg_008",
    name: "1mg Store",
    address: "A-22, Tech Park Road, Sector 7",
    phone: "+91 98765 43217",
    rating: 4.0,
    totalRatings: 178,
    isOpen: true,
    openHours: "9:00 AM – 9:00 PM",
    type: "Online + Store",
    distance: 3.9,
    location: { lat: 0, lng: 0 },
  },
];

// ─── Common Medicine Price Data ───────────────────────────────────
const MEDICINE_PRICES = {
  paracetamol: {
    genericName: "Paracetamol (Acetaminophen)",
    category: "Pain Relief / Fever",
    prices: [
      { brand: "Crocin 500mg", pack: "15 tablets", mrp: 30, discount: 12, pharmacy: "Apollo Pharmacy" },
      { brand: "Dolo 650mg", pack: "15 tablets", mrp: 32, discount: 15, pharmacy: "MedPlus" },
      { brand: "Calpol 500mg", pack: "15 tablets", mrp: 28, discount: 10, pharmacy: "Netmeds Store" },
      { brand: "Generic Paracetamol 500mg", pack: "10 tablets", mrp: 10, discount: 0, pharmacy: "Jan Aushadhi Kendra" },
    ],
  },
  amoxicillin: {
    genericName: "Amoxicillin",
    category: "Antibiotic",
    prices: [
      { brand: "Mox 500mg", pack: "10 capsules", mrp: 95, discount: 18, pharmacy: "Apollo Pharmacy" },
      { brand: "Amoxil 500mg", pack: "10 capsules", mrp: 110, discount: 20, pharmacy: "MedPlus" },
      { brand: "Novamox 500mg", pack: "10 capsules", mrp: 88, discount: 12, pharmacy: "Wellness Forever" },
      { brand: "Generic Amoxicillin 500mg", pack: "10 capsules", mrp: 35, discount: 0, pharmacy: "Jan Aushadhi Kendra" },
    ],
  },
  omeprazole: {
    genericName: "Omeprazole",
    category: "Antacid / Gastric",
    prices: [
      { brand: "Omez 20mg", pack: "15 capsules", mrp: 95, discount: 15, pharmacy: "Apollo Pharmacy" },
      { brand: "Pan 20mg", pack: "15 capsules", mrp: 85, discount: 12, pharmacy: "MedPlus" },
      { brand: "Ocid 20mg", pack: "15 capsules", mrp: 78, discount: 10, pharmacy: "Frank Ross Pharmacy" },
      { brand: "Generic Omeprazole 20mg", pack: "10 capsules", mrp: 18, discount: 0, pharmacy: "Jan Aushadhi Kendra" },
    ],
  },
  metformin: {
    genericName: "Metformin",
    category: "Diabetes",
    prices: [
      { brand: "Glycomet 500mg", pack: "20 tablets", mrp: 42, discount: 10, pharmacy: "Apollo Pharmacy" },
      { brand: "Glucophage 500mg", pack: "20 tablets", mrp: 68, discount: 18, pharmacy: "MedPlus" },
      { brand: "Obimet 500mg", pack: "20 tablets", mrp: 38, discount: 8, pharmacy: "Sharma Medical Store" },
      { brand: "Generic Metformin 500mg", pack: "10 tablets", mrp: 12, discount: 0, pharmacy: "Jan Aushadhi Kendra" },
    ],
  },
  azithromycin: {
    genericName: "Azithromycin",
    category: "Antibiotic",
    prices: [
      { brand: "Azithral 500mg", pack: "5 tablets", mrp: 98, discount: 15, pharmacy: "Apollo Pharmacy" },
      { brand: "Zithromax 500mg", pack: "5 tablets", mrp: 120, discount: 20, pharmacy: "MedPlus" },
      { brand: "Azee 500mg", pack: "5 tablets", mrp: 90, discount: 12, pharmacy: "Netmeds Store" },
      { brand: "Generic Azithromycin 500mg", pack: "3 tablets", mrp: 25, discount: 0, pharmacy: "Jan Aushadhi Kendra" },
    ],
  },
  cetirizine: {
    genericName: "Cetirizine",
    category: "Allergy / Antihistamine",
    prices: [
      { brand: "Cetzine 10mg", pack: "10 tablets", mrp: 35, discount: 10, pharmacy: "Apollo Pharmacy" },
      { brand: "Alerid 10mg", pack: "10 tablets", mrp: 32, discount: 12, pharmacy: "MedPlus" },
      { brand: "Okacet 10mg", pack: "10 tablets", mrp: 30, discount: 8, pharmacy: "Wellness Forever" },
      { brand: "Generic Cetirizine 10mg", pack: "10 tablets", mrp: 8, discount: 0, pharmacy: "Jan Aushadhi Kendra" },
    ],
  },
  ibuprofen: {
    genericName: "Ibuprofen",
    category: "Pain Relief / Anti-inflammatory",
    prices: [
      { brand: "Brufen 400mg", pack: "15 tablets", mrp: 32, discount: 10, pharmacy: "Apollo Pharmacy" },
      { brand: "Ibugesic 400mg", pack: "15 tablets", mrp: 28, discount: 8, pharmacy: "Sharma Medical Store" },
      { brand: "Combiflam (Ibu+Para)", pack: "20 tablets", mrp: 52, discount: 15, pharmacy: "MedPlus" },
      { brand: "Generic Ibuprofen 400mg", pack: "10 tablets", mrp: 10, discount: 0, pharmacy: "Jan Aushadhi Kendra" },
    ],
  },
  atorvastatin: {
    genericName: "Atorvastatin",
    category: "Cholesterol",
    prices: [
      { brand: "Atorva 10mg", pack: "15 tablets", mrp: 135, discount: 18, pharmacy: "Apollo Pharmacy" },
      { brand: "Lipitor 10mg", pack: "15 tablets", mrp: 165, discount: 22, pharmacy: "MedPlus" },
      { brand: "Tonact 10mg", pack: "15 tablets", mrp: 120, discount: 12, pharmacy: "Frank Ross Pharmacy" },
      { brand: "Generic Atorvastatin 10mg", pack: "10 tablets", mrp: 30, discount: 0, pharmacy: "Jan Aushadhi Kendra" },
    ],
  },
};

/**
 * Search nearby pharmacies (mock data with dynamic distance)
 */
export const searchNearbyPharmacies = async (lat, lng, radius = 5000) => {
  // Simulate dynamic distances based on input coordinates
  const pharmacies = MOCK_PHARMACIES.map((ph) => ({
    ...ph,
    // Randomize distance slightly for each request to feel dynamic
    distance: +(ph.distance + (Math.random() * 0.3 - 0.15)).toFixed(1),
    location: {
      lat: lat + (Math.random() * 0.01 - 0.005),
      lng: lng + (Math.random() * 0.01 - 0.005),
    },
  }));

  // Filter by radius (convert to km)
  const radiusKm = radius / 1000;
  const filtered = pharmacies.filter((ph) => ph.distance <= radiusKm);

  // Sort by distance
  filtered.sort((a, b) => a.distance - b.distance);

  return filtered;
};

/**
 * Get pharmacy details by placeId
 */
export const getPharmacyDetails = async (placeId) => {
  const pharmacy = MOCK_PHARMACIES.find((ph) => ph.placeId === placeId);
  if (!pharmacy) return null;

  // Add extra detail fields
  return {
    ...pharmacy,
    website: "https://www.example.com",
    facilities: ["Home Delivery", "Online Ordering", "Insurance Accepted"],
    paymentMethods: ["Cash", "UPI", "Card", "Wallet"],
    reviews: [
      { author: "Rahul S.", rating: 5, text: "Great stock and fast service!", time: "2 weeks ago" },
      { author: "Priya M.", rating: 4, text: "Good pharmacy, medicines always available.", time: "1 month ago" },
      { author: "Amit K.", rating: 4, text: "Reasonable prices and helpful staff.", time: "2 months ago" },
    ],
  };
};

/**
 * Compare medicine prices across pharmacies
 */
export const compareMedicinePrices = async (medicineName) => {
  const key = medicineName.toLowerCase().trim();

  // Check exact match first, then partial match
  let priceData = MEDICINE_PRICES[key];

  if (!priceData) {
    // Try partial match
    const matchedKey = Object.keys(MEDICINE_PRICES).find(
      (k) => key.includes(k) || k.includes(key)
    );
    priceData = matchedKey ? MEDICINE_PRICES[matchedKey] : null;
  }

  if (!priceData) {
    // Generate generic price data for unknown medicines
    priceData = {
      genericName: medicineName,
      category: "General Medicine",
      prices: [
        { brand: `${medicineName} (Brand A)`, pack: "10 tablets", mrp: 85, discount: 12, pharmacy: "Apollo Pharmacy" },
        { brand: `${medicineName} (Brand B)`, pack: "10 tablets", mrp: 72, discount: 10, pharmacy: "MedPlus" },
        { brand: `${medicineName} (Brand C)`, pack: "10 tablets", mrp: 68, discount: 8, pharmacy: "Wellness Forever" },
        { brand: `${medicineName} (Generic)`, pack: "10 tablets", mrp: 20, discount: 0, pharmacy: "Jan Aushadhi Kendra" },
      ],
    };
  }

  // Calculate final prices
  const withFinalPrices = {
    ...priceData,
    prices: priceData.prices.map((p) => ({
      ...p,
      finalPrice: +(p.mrp - (p.mrp * p.discount) / 100).toFixed(2),
      savings: +((p.mrp * p.discount) / 100).toFixed(2),
    })),
  };

  // Sort by final price ascending
  withFinalPrices.prices.sort((a, b) => a.finalPrice - b.finalPrice);

  return withFinalPrices;
};

/**
 * Process a refill request
 */
export const processRefillRequest = async (requestData) => {
  // In a real app, this could send an email/SMS to the pharmacy
  // For now, return a confirmation with an estimated time
  const estimatedTime = Math.floor(Math.random() * 3) + 1; // 1-3 hours

  return {
    success: true,
    message: "Refill request submitted successfully",
    estimatedReadyTime: `${estimatedTime} hour${estimatedTime > 1 ? "s" : ""}`,
    requestId: `RFR-${Date.now().toString(36).toUpperCase()}`,
    details: requestData,
  };
};
