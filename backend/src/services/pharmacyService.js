/**
 * Pharmacy Service
 * Provides nearby pharmacy search (Kota, Rajasthan), medicine price comparison,
 * and refill request handling — no paid APIs required.
 */

// ─── Kota Pharmacy Data (13 pharmacies — 8 shown per request) ─────
const KOTA_PHARMACIES = [
  {
    placeId: "ph_apollo_kota_001",
    name: "Apollo Pharmacy",
    address: "Near Talwandi Circle, Talwandi, Kota",
    phone: "+91 74424 01234",
    rating: 4.5,
    totalRatings: 312,
    isOpen: true,
    openHours: "24 hours",
    type: "Chain Pharmacy",
    distance: 0.6,
    location: { lat: 25.1800, lng: 75.8648 },
  },
  {
    placeId: "ph_medplus_kota_002",
    name: "MedPlus Pharmacy",
    address: "Shopping Centre, Gumanpura, Kota",
    phone: "+91 74424 05678",
    rating: 4.2,
    totalRatings: 198,
    isOpen: true,
    openHours: "8:00 AM – 11:00 PM",
    type: "Chain Pharmacy",
    distance: 1.1,
    location: { lat: 25.1760, lng: 75.8560 },
  },
  {
    placeId: "ph_janaushadhi_kota_003",
    name: "Jan Aushadhi Kendra",
    address: "MBS Hospital Campus, Nayapura, Kota",
    phone: "+91 74424 09012",
    rating: 4.0,
    totalRatings: 87,
    isOpen: true,
    openHours: "9:00 AM – 6:00 PM",
    type: "Generic Medicine Store",
    distance: 1.8,
    location: { lat: 25.1720, lng: 75.8500 },
  },
  {
    placeId: "ph_shree_kota_004",
    name: "Shree Balaji Medical Store",
    address: "Dadabari Main Road, Near Dadabari Circle, Kota",
    phone: "+91 94141 23456",
    rating: 4.4,
    totalRatings: 276,
    isOpen: true,
    openHours: "7:30 AM – 10:30 PM",
    type: "Local Pharmacy",
    distance: 0.4,
    location: { lat: 25.1845, lng: 75.8590 },
  },
  {
    placeId: "ph_raj_kota_005",
    name: "Raj Medical & General Store",
    address: "Kunhari Bus Stand Road, Kunhari, Kota",
    phone: "+91 94141 78901",
    rating: 4.1,
    totalRatings: 145,
    isOpen: true,
    openHours: "8:00 AM – 10:00 PM",
    type: "Local Pharmacy",
    distance: 3.2,
    location: { lat: 25.1530, lng: 75.8420 },
  },
  {
    placeId: "ph_mahaveer_kota_006",
    name: "Mahaveer Medicos",
    address: "Vigyan Nagar, Near Allen Career Institute, Kota",
    phone: "+91 94141 34567",
    rating: 4.3,
    totalRatings: 203,
    isOpen: true,
    openHours: "8:00 AM – 11:00 PM",
    type: "Local Pharmacy",
    distance: 2.5,
    location: { lat: 25.1640, lng: 75.8380 },
  },
  {
    placeId: "ph_netmeds_kota_007",
    name: "Netmeds Store",
    address: "Rajeev Gandhi Nagar, Near Coaching Hub, Kota",
    phone: "+91 74424 56789",
    rating: 4.0,
    totalRatings: 112,
    isOpen: true,
    openHours: "9:00 AM – 10:00 PM",
    type: "Online + Store",
    distance: 1.5,
    location: { lat: 25.1700, lng: 75.8530 },
  },
  {
    placeId: "ph_gupta_kota_008",
    name: "Gupta Medical Hall",
    address: "Chambal Garden Road, Nayapura, Kota",
    phone: "+91 94141 45678",
    rating: 4.6,
    totalRatings: 342,
    isOpen: true,
    openHours: "7:00 AM – 11:00 PM",
    type: "Local Pharmacy",
    distance: 0.9,
    location: { lat: 25.1780, lng: 75.8610 },
  },
  // ─── Extra 5 (shuffled in randomly) ─────────────────────────────
  {
    placeId: "ph_wellness_kota_009",
    name: "Wellness Forever",
    address: "DCM Chowk, Borkhera, Kota",
    phone: "+91 74424 11223",
    rating: 4.2,
    totalRatings: 167,
    isOpen: false,
    openHours: "8:00 AM – 10:30 PM",
    type: "Chain Pharmacy",
    distance: 2.9,
    location: { lat: 25.1580, lng: 75.8490 },
  },
  {
    placeId: "ph_sanjivani_kota_010",
    name: "Sanjivani Medical Store",
    address: "Rangbari Road, Near Rangbari Nala, Kota",
    phone: "+91 94141 99887",
    rating: 3.9,
    totalRatings: 73,
    isOpen: true,
    openHours: "8:30 AM – 9:30 PM",
    type: "Local Pharmacy",
    distance: 3.8,
    location: { lat: 25.1490, lng: 75.8350 },
  },
  {
    placeId: "ph_agrawal_kota_011",
    name: "Agrawal Pharma",
    address: "Keshavpura Circle, Near Kota Junction Railway Station",
    phone: "+91 94141 66554",
    rating: 4.3,
    totalRatings: 189,
    isOpen: true,
    openHours: "7:00 AM – 10:00 PM",
    type: "Local Pharmacy",
    distance: 1.3,
    location: { lat: 25.1750, lng: 75.8570 },
  },
  {
    placeId: "ph_1mg_kota_012",
    name: "1mg Store",
    address: "Indraprastha Industrial Area, Kota",
    phone: "+91 74424 44332",
    rating: 4.0,
    totalRatings: 95,
    isOpen: true,
    openHours: "9:00 AM – 9:00 PM",
    type: "Online + Store",
    distance: 4.1,
    location: { lat: 25.1450, lng: 75.8280 },
  },
  {
    placeId: "ph_lifecare_kota_013",
    name: "Lifecare Pharmacy",
    address: "Rawatbhata Road, Near Agrasen Circle, Kota",
    phone: "+91 94141 22334",
    rating: 4.1,
    totalRatings: 131,
    isOpen: false,
    openHours: "8:00 AM – 10:00 PM",
    type: "Local Pharmacy",
    distance: 3.5,
    location: { lat: 25.1510, lng: 75.8400 },
  },
];

// ─── Shuffle helper (Fisher-Yates) ────────────────────────────────
function shuffleArray(arr) {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// ─── Common Medicine Price Data ───────────────────────────────────
const MEDICINE_PRICES = {
  paracetamol: {
    genericName: "Paracetamol (Acetaminophen)",
    category: "Pain Relief / Fever",
    prices: [
      { brand: "Crocin 500mg", pack: "15 tablets", mrp: 30, discount: 12, pharmacy: "Apollo Pharmacy" },
      { brand: "Dolo 650mg", pack: "15 tablets", mrp: 32, discount: 15, pharmacy: "MedPlus Pharmacy" },
      { brand: "Calpol 500mg", pack: "15 tablets", mrp: 28, discount: 10, pharmacy: "Netmeds Store" },
      { brand: "Generic Paracetamol 500mg", pack: "10 tablets", mrp: 10, discount: 0, pharmacy: "Jan Aushadhi Kendra" },
    ],
  },
  amoxicillin: {
    genericName: "Amoxicillin",
    category: "Antibiotic",
    prices: [
      { brand: "Mox 500mg", pack: "10 capsules", mrp: 95, discount: 18, pharmacy: "Apollo Pharmacy" },
      { brand: "Amoxil 500mg", pack: "10 capsules", mrp: 110, discount: 20, pharmacy: "MedPlus Pharmacy" },
      { brand: "Novamox 500mg", pack: "10 capsules", mrp: 88, discount: 12, pharmacy: "Gupta Medical Hall" },
      { brand: "Generic Amoxicillin 500mg", pack: "10 capsules", mrp: 35, discount: 0, pharmacy: "Jan Aushadhi Kendra" },
    ],
  },
  omeprazole: {
    genericName: "Omeprazole",
    category: "Antacid / Gastric",
    prices: [
      { brand: "Omez 20mg", pack: "15 capsules", mrp: 95, discount: 15, pharmacy: "Apollo Pharmacy" },
      { brand: "Pan 20mg", pack: "15 capsules", mrp: 85, discount: 12, pharmacy: "MedPlus Pharmacy" },
      { brand: "Ocid 20mg", pack: "15 capsules", mrp: 78, discount: 10, pharmacy: "Shree Balaji Medical Store" },
      { brand: "Generic Omeprazole 20mg", pack: "10 capsules", mrp: 18, discount: 0, pharmacy: "Jan Aushadhi Kendra" },
    ],
  },
  metformin: {
    genericName: "Metformin",
    category: "Diabetes",
    prices: [
      { brand: "Glycomet 500mg", pack: "20 tablets", mrp: 42, discount: 10, pharmacy: "Apollo Pharmacy" },
      { brand: "Glucophage 500mg", pack: "20 tablets", mrp: 68, discount: 18, pharmacy: "MedPlus Pharmacy" },
      { brand: "Obimet 500mg", pack: "20 tablets", mrp: 38, discount: 8, pharmacy: "Mahaveer Medicos" },
      { brand: "Generic Metformin 500mg", pack: "10 tablets", mrp: 12, discount: 0, pharmacy: "Jan Aushadhi Kendra" },
    ],
  },
  azithromycin: {
    genericName: "Azithromycin",
    category: "Antibiotic",
    prices: [
      { brand: "Azithral 500mg", pack: "5 tablets", mrp: 98, discount: 15, pharmacy: "Apollo Pharmacy" },
      { brand: "Zithromax 500mg", pack: "5 tablets", mrp: 120, discount: 20, pharmacy: "MedPlus Pharmacy" },
      { brand: "Azee 500mg", pack: "5 tablets", mrp: 90, discount: 12, pharmacy: "Netmeds Store" },
      { brand: "Generic Azithromycin 500mg", pack: "3 tablets", mrp: 25, discount: 0, pharmacy: "Jan Aushadhi Kendra" },
    ],
  },
  cetirizine: {
    genericName: "Cetirizine",
    category: "Allergy / Antihistamine",
    prices: [
      { brand: "Cetzine 10mg", pack: "10 tablets", mrp: 35, discount: 10, pharmacy: "Apollo Pharmacy" },
      { brand: "Alerid 10mg", pack: "10 tablets", mrp: 32, discount: 12, pharmacy: "MedPlus Pharmacy" },
      { brand: "Okacet 10mg", pack: "10 tablets", mrp: 30, discount: 8, pharmacy: "Wellness Forever" },
      { brand: "Generic Cetirizine 10mg", pack: "10 tablets", mrp: 8, discount: 0, pharmacy: "Jan Aushadhi Kendra" },
    ],
  },
  ibuprofen: {
    genericName: "Ibuprofen",
    category: "Pain Relief / Anti-inflammatory",
    prices: [
      { brand: "Brufen 400mg", pack: "15 tablets", mrp: 32, discount: 10, pharmacy: "Apollo Pharmacy" },
      { brand: "Ibugesic 400mg", pack: "15 tablets", mrp: 28, discount: 8, pharmacy: "Gupta Medical Hall" },
      { brand: "Combiflam (Ibu+Para)", pack: "20 tablets", mrp: 52, discount: 15, pharmacy: "MedPlus Pharmacy" },
      { brand: "Generic Ibuprofen 400mg", pack: "10 tablets", mrp: 10, discount: 0, pharmacy: "Jan Aushadhi Kendra" },
    ],
  },
  atorvastatin: {
    genericName: "Atorvastatin",
    category: "Cholesterol",
    prices: [
      { brand: "Atorva 10mg", pack: "15 tablets", mrp: 135, discount: 18, pharmacy: "Apollo Pharmacy" },
      { brand: "Lipitor 10mg", pack: "15 tablets", mrp: 165, discount: 22, pharmacy: "MedPlus Pharmacy" },
      { brand: "Tonact 10mg", pack: "15 tablets", mrp: 120, discount: 12, pharmacy: "Shree Balaji Medical Store" },
      { brand: "Generic Atorvastatin 10mg", pack: "10 tablets", mrp: 30, discount: 0, pharmacy: "Jan Aushadhi Kendra" },
    ],
  },
};

/**
 * Search nearby pharmacies — shuffles 13 Kota stores, returns 8 random
 */
export const searchNearbyPharmacies = async (lat, lng, radius = 5000) => {
  // Shuffle all 13 pharmacies and pick 8
  const picked = shuffleArray(KOTA_PHARMACIES).slice(0, 8);

  // Add slight distance variation for a fresh feel each request
  const pharmacies = picked.map((ph) => ({
    ...ph,
    distance: +(ph.distance + (Math.random() * 0.4 - 0.2)).toFixed(1),
    location: {
      lat: ph.location.lat + (Math.random() * 0.002 - 0.001),
      lng: ph.location.lng + (Math.random() * 0.002 - 0.001),
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
  const pharmacy = KOTA_PHARMACIES.find((ph) => ph.placeId === placeId);
  if (!pharmacy) return null;

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
        { brand: `${medicineName} (Brand B)`, pack: "10 tablets", mrp: 72, discount: 10, pharmacy: "MedPlus Pharmacy" },
        { brand: `${medicineName} (Brand C)`, pack: "10 tablets", mrp: 68, discount: 8, pharmacy: "Gupta Medical Hall" },
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
  const estimatedTime = Math.floor(Math.random() * 3) + 1;

  return {
    success: true,
    message: "Refill request submitted successfully",
    estimatedReadyTime: `${estimatedTime} hour${estimatedTime > 1 ? "s" : ""}`,
    requestId: `RFR-${Date.now().toString(36).toUpperCase()}`,
    details: requestData,
  };
};
