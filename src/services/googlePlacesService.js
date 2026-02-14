/**
 * Google Places API Service - Using Places Library (Frontend-Compatible)
 * Fetches real supermarket locations across Malaysia
 */

const GOOGLE_API_KEY = process.env.REACT_APP_GOOGLE_PLACES_API_KEY;

/**
 * Predefined supermarket locations in major Malaysian cities
 * This is a fallback/starter dataset since Google Places API has CORS restrictions
 */
const MALAYSIAN_SUPERMARKET_LOCATIONS = [
  // Kuala Lumpur
  { name: 'Tesco Extra Ampang', lat: 3.1569, lng: 101.7622, city: 'Kuala Lumpur', address: 'Jalan Ampang, Kuala Lumpur' },
  { name: 'Aeon Big Mid Valley', lat: 3.1186, lng: 101.6770, city: 'Kuala Lumpur', address: 'Mid Valley City, Kuala Lumpur' },
  { name: 'Giant Hypermarket Batu Caves', lat: 3.2369, lng: 101.6840, city: 'Kuala Lumpur', address: 'Batu Caves, Selangor' },
  { name: 'Mydin Mall USJ', lat: 3.0458, lng: 101.5810, city: 'Subang Jaya', address: 'USJ, Subang Jaya' },
  { name: 'Jaya Grocer Bangsar Village', lat: 3.1278, lng: 101.6686, city: 'Kuala Lumpur', address: 'Bangsar Village, Kuala Lumpur' },
  
  // Petaling Jaya
  { name: 'Tesco Mutiara Damansara', lat: 3.1569, lng: 101.6266, city: 'Petaling Jaya', address: 'Mutiara Damansara, Petaling Jaya' },
  { name: 'Aeon Taman Maluri', lat: 3.1333, lng: 101.7333, city: 'Kuala Lumpur', address: 'Taman Maluri, Cheras' },
  { name: 'Giant Kelana Jaya', lat: 3.1067, lng: 101.5975, city: 'Petaling Jaya', address: 'Kelana Jaya, Petaling Jaya' },
  
  // Shah Alam
  { name: 'Aeon Shah Alam', lat: 3.0733, lng: 101.5185, city: 'Shah Alam', address: 'Shah Alam, Selangor' },
  { name: 'Giant Shah Alam', lat: 3.0667, lng: 101.5000, city: 'Shah Alam', address: 'Section 13, Shah Alam' },
  { name: 'Mydin Wholesale Hypermarket Shah Alam', lat: 3.0858, lng: 101.5281, city: 'Shah Alam', address: 'Shah Alam, Selangor' },
  
  // Penang
  { name: 'Tesco Tanjung Pinang', lat: 5.3833, lng: 100.3000, city: 'Penang', address: 'Tanjung Pinang, Penang' },
  { name: 'Aeon Queensbay Mall', lat: 5.3319, lng: 100.3064, city: 'Penang', address: 'Queensbay Mall, Penang' },
  { name: 'Giant Hypermarket Penang', lat: 5.4164, lng: 100.3327, city: 'Penang', address: 'Georgetown, Penang' },
  
  // Johor Bahru
  { name: 'Aeon Tebrau City', lat: 1.5500, lng: 103.8000, city: 'Johor Bahru', address: 'Tebrau City, Johor Bahru' },
  { name: 'Giant Hypermarket Taman Universiti', lat: 1.5333, lng: 103.6667, city: 'Johor Bahru', address: 'Taman Universiti, Johor Bahru' },
  { name: 'Tesco Bukit Indah', lat: 1.4667, lng: 103.6167, city: 'Johor Bahru', address: 'Bukit Indah, Johor Bahru' },
  
  // Ipoh
  { name: 'Aeon Station 18', lat: 4.6167, lng: 101.0833, city: 'Ipoh', address: 'Station 18, Ipoh' },
  { name: 'Tesco Ipoh', lat: 4.5975, lng: 101.0901, city: 'Ipoh', address: 'Ipoh, Perak' },
  
  // Melaka
  { name: 'Aeon Bandaraya Melaka', lat: 2.1896, lng: 102.2501, city: 'Melaka', address: 'Bandaraya Melaka' },
  { name: 'Giant Hypermarket Melaka', lat: 2.2000, lng: 102.2500, city: 'Melaka', address: 'Melaka' },
  
  // Seremban
  { name: 'Aeon Seremban 2', lat: 2.7186, lng: 101.9381, city: 'Seremban', address: 'Seremban 2, Negeri Sembilan' },
  { name: 'Giant Hypermarket Seremban', lat: 2.7250, lng: 101.9417, city: 'Seremban', address: 'Seremban, Negeri Sembilan' },
  
  // Kota Kinabalu
  { name: 'Aeon Kota Kinabalu', lat: 5.9804, lng: 116.0735, city: 'Kota Kinabalu', address: 'Kota Kinabalu, Sabah' },
  { name: 'Giant Hypermarket Kota Kinabalu', lat: 5.9788, lng: 116.0753, city: 'Kota Kinabalu', address: 'Kota Kinabalu, Sabah' },
  
  // Kuching
  { name: 'Aeon Kuching Central', lat: 1.5333, lng: 110.3500, city: 'Kuching', address: 'Kuching Central, Sarawak' },
  { name: 'Giant Hypermarket Kuching', lat: 1.5500, lng: 110.3333, city: 'Kuching', address: 'Kuching, Sarawak' },
];

/**
 * Pasar Malam (Night Markets) locations
 */
const PASAR_MALAM_LOCATIONS = [
  { name: 'Pasar Malam Taman Connaught', lat: 3.0833, lng: 101.7333, city: 'Kuala Lumpur', address: 'Taman Connaught, Cheras' },
  { name: 'Pasar Malam SS2', lat: 3.1167, lng: 101.6167, city: 'Petaling Jaya', address: 'SS2, Petaling Jaya' },
  { name: 'Pasar Malam Taman Megah', lat: 3.1333, lng: 101.6167, city: 'Petaling Jaya', address: 'Taman Megah, Petaling Jaya' },
  { name: 'Pasar Malam Bangsar', lat: 3.1278, lng: 101.6686, city: 'Kuala Lumpur', address: 'Bangsar, Kuala Lumpur' },
  { name: 'Pasar Malam Taman Tun Dr Ismail', lat: 3.1333, lng: 101.6333, city: 'Kuala Lumpur', address: 'TTDI, Kuala Lumpur' },
];

/**
 * Grocery Stores locations
 */
const GROCERY_STORE_LOCATIONS = [
  { name: '99 Speedmart Ampang', lat: 3.1569, lng: 101.7622, city: 'Kuala Lumpur', address: 'Ampang, Kuala Lumpur' },
  { name: 'KK Mart Subang Jaya', lat: 3.0458, lng: 101.5810, city: 'Subang Jaya', address: 'Subang Jaya, Selangor' },
  { name: 'Family Mart Bangsar', lat: 3.1278, lng: 101.6686, city: 'Kuala Lumpur', address: 'Bangsar, Kuala Lumpur' },
  { name: '7-Eleven KLCC', lat: 3.1569, lng: 101.7122, city: 'Kuala Lumpur', address: 'KLCC, Kuala Lumpur' },
  { name: 'Village Grocer Mont Kiara', lat: 3.1667, lng: 101.6500, city: 'Kuala Lumpur', address: 'Mont Kiara, Kuala Lumpur' },
];

/**
 * Food Banks locations
 */
const FOOD_BANK_LOCATIONS = [
  { name: 'Kechara Soup Kitchen', lat: 3.1569, lng: 101.7122, city: 'Kuala Lumpur', address: 'Jalan Maharajalela, Kuala Lumpur' },
  { name: 'The Lost Food Project', lat: 3.1333, lng: 101.6833, city: 'Kuala Lumpur', address: 'Petaling Jaya, Selangor' },
  { name: 'Pit Stop Community Cafe', lat: 3.1167, lng: 101.6500, city: 'Kuala Lumpur', address: 'Bangsar, Kuala Lumpur' },
];

/**
 * Get all Malaysian locations (supermarkets, pasar malam, grocery stores, food banks)
 * @param {Array<string>} types - Optional array of types to filter
 * @returns {Promise<Array>} Array of location objects
 */
export const getMalaysianSupermarkets = async (types = null) => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const allLocations = [
      ...MALAYSIAN_SUPERMARKET_LOCATIONS.map(loc => ({ ...loc, type: 'supermarket' })),
      ...PASAR_MALAM_LOCATIONS.map(loc => ({ ...loc, type: 'pasar_malam' })),
      ...GROCERY_STORE_LOCATIONS.map(loc => ({ ...loc, type: 'grocery_store' })),
      ...FOOD_BANK_LOCATIONS.map(loc => ({ ...loc, type: 'food_bank' })),
    ];
    
    // Filter by types if specified
    const filteredLocations = types && types.length > 0
      ? allLocations.filter(loc => types.includes(loc.type))
      : allLocations;
    
    return filteredLocations.map(loc => ({
      ...loc,
      state: getStateFromCity(loc.city),
      chain: extractChainName(loc.name),
      google_place_id: `generated_${loc.name.toLowerCase().replace(/\s/g, '_')}`,
      prices: [], // Will be populated from Supabase
    }));
  } catch (error) {
    console.error('Error loading Malaysian locations:', error);
    return [];
  }
};

/**
 * Search for supermarkets near a location using Google Places API
 * Note: This requires a backend proxy due to CORS restrictions
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {number} radius - Search radius in meters (default 5000m = 5km)
 * @returns {Promise<Array>} Array of place objects
 */
export const searchNearbyPlaces = async (lat, lng, radius = 5000) => {
  try {
    // This would need a backend proxy to work properly
    // For now, return empty array
    console.warn('Google Places API requires backend proxy. Using predefined locations instead.');
    return [];
  } catch (error) {
    console.error('Error fetching nearby places:', error);
    return [];
  }
};

/**
 * Convert location to our database format
 * @param {Object} location - Location object
 * @returns {Object} Location object for our database
 */
export const convertGooglePlaceToLocation = (location) => {
  return {
    name: location.name,
    type: location.type,
    address: location.address || location.vicinity || '',
    lat: location.lat,
    lng: location.lng,
    city: location.city || 'Unknown',
    state: location.state || getStateFromCity(location.city),
    phone: location.phone || null,
    chain: extractChainName(location.name),
    operating_hours: location.operating_hours || null,
    prices: location.prices || [],
  };
};

/**
 * Get state from city name
 * @param {string} city - City name
 * @returns {string} State name
 */
const getStateFromCity = (city) => {
  const cityStateMap = {
    'Kuala Lumpur': 'Wilayah Persekutuan',
    'Petaling Jaya': 'Selangor',
    'Shah Alam': 'Selangor',
    'Subang Jaya': 'Selangor',
    'Klang': 'Selangor',
    'Penang': 'Pulau Pinang',
    'George Town': 'Pulau Pinang',
    'Johor Bahru': 'Johor',
    'Ipoh': 'Perak',
    'Melaka': 'Melaka',
    'Seremban': 'Negeri Sembilan',
    'Kota Kinabalu': 'Sabah',
    'Kuching': 'Sarawak',
    'Putrajaya': 'Wilayah Persekutuan',
    'Cyberjaya': 'Selangor',
  };
  
  return cityStateMap[city] || 'Unknown';
};

/**
 * Extract supermarket chain name from place name
 * @param {string} name - Place name
 * @returns {string} Chain name or 'Independent'
 */
const extractChainName = (name) => {
  const chains = ['Tesco', 'Aeon', 'Giant', 'Jaya Grocer', 'Mydin', 'Econsave', 'NSK'];
  
  for (const chain of chains) {
    if (name.toLowerCase().includes(chain.toLowerCase())) {
      return chain;
    }
  }

  return 'Independent';
};

/**
 * Major Malaysian cities to search
 */
export const MALAYSIAN_CITIES = [
  'Kuala Lumpur',
  'Petaling Jaya',
  'Shah Alam',
  'Subang Jaya',
  'Klang',
  'Penang',
  'George Town',
  'Johor Bahru',
  'Ipoh',
  'Melaka',
  'Seremban',
  'Kota Kinabalu',
  'Kuching',
  'Putrajaya',
  'Cyberjaya',
];
