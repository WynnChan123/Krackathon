import { supabase } from './supabaseClient';

/**
 * Fetch locations with optional filters
 */
export const fetchLocations = async (filters = {}) => {
  try {
    let query = supabase
      .from('locations')
      .select(`
        *,
        prices (
          id,
          price,
          item_id,
          date,
          receipt_url,
          submitted_by,
          items (
            id,
            name,
            brand,
            unit
          )
        )
      `);

    // Filter by location type
    if (filters.locationType && filters.locationType.length > 0) {
      query = query.in('type', filters.locationType);
    }

    // Filter by city
    if (filters.city) {
      query = query.eq('city', filters.city);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Filter by items if specified
    if (filters.items && filters.items.length > 0) {
      return data.filter(location => {
        const itemNames = location.prices?.map(p => p.items?.name.toLowerCase()) || [];
        return filters.items.some(item => 
          itemNames.includes(item.toLowerCase())
        );
      });
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching locations:', error);
    return [];
  }
};

/**
 * Fetch all unique cities from locations
 */
export const fetchCities = async () => {
  try {
    const { data, error } = await supabase
      .from('locations')
      .select('city')
      .order('city');

    if (error) throw error;

    // Get unique cities
    const cities = [...new Set(data.map(loc => loc.city))];
    return cities;
  } catch (error) {
    console.error('Error fetching cities:', error);
    return [];
  }
};

/**
 * Fetch all items for filter dropdown
 */
export const fetchItems = async () => {
  try {
    const { data, error } = await supabase
      .from('items')
      .select('id, name, brand')
      .order('name');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching items:', error);
    return [];
  }
};

/**
 * Get price category for color coding
 * @param {number} price - Current price
 * @param {number} minPrice - Minimum price in dataset
 * @param {number} maxPrice - Maximum price in dataset
 * @returns {string} - 'low', 'medium', or 'high'
 */
export const getPriceCategory = (price, minPrice, maxPrice) => {
  if (!price || !minPrice || !maxPrice) return 'medium';
  
  const range = maxPrice - minPrice;
  const third = range / 3;
  
  if (price <= minPrice + third) return 'low';
  if (price <= minPrice + (2 * third)) return 'medium';
  return 'high';
};

/**
 * Calculate average price for a location
 */
export const getAveragePrice = (prices) => {
  if (!prices || prices.length === 0) return null;
  
  const total = prices.reduce((sum, p) => sum + parseFloat(p.price), 0);
  return total / prices.length;
};

/**
 * Get marker color based on price category
 */
export const getMarkerColor = (category) => {
  switch (category) {
    case 'low':
      return '#10b981'; // green
    case 'medium':
      return '#f59e0b'; // yellow/orange
    case 'high':
      return '#ef4444'; // red
    default:
      return '#6366f1'; // indigo (default)
  }
};

/**
 * Get icon emoji based on location type
 */
export const getLocationIcon = (type) => {
  switch (type) {
    case 'supermarket':
      return '🏪';
    case 'pasar_malam':
      return '🏮';
    case 'food_bank':
      return '🎁';
    case 'grocery_store':
      return '🛒';
    default:
      return '📍';
  }
};

/**
 * Format location type for display
 */
export const formatLocationType = (type) => {
  const typeMap = {
    'supermarket': 'Supermarket',
    'pasar_malam': 'Pasar Malam',
    'food_bank': 'Food Bank',
    'grocery_store': 'Grocery Store'
  };
  return typeMap[type] || type;
};
