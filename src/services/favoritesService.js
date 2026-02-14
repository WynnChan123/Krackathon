import { supabase } from './supabaseClient';

/**
 * Get user's favorite location+item combinations
 * @returns {Promise<Array>} Array of favorites
 */
export const getUserFavorites = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log('No user logged in');
      return [];
    }

    const { data, error } = await supabase
      .from('user_favorites')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching favorites:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error getting favorites:', error);
    return [];
  }
};

/**
 * Check if a location+item combination is favorited
 * @param {string} locationId - Location ID
 * @param {string} itemId - Item ID
 * @returns {Promise<boolean>} True if favorited
 */
export const isFavorite = async (locationId, itemId) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return false;

    const { data, error } = await supabase
      .from('user_favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('location_id', locationId)
      .eq('item_id', itemId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
      console.error('Error checking favorite:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Error checking favorite:', error);
    return false;
  }
};

/**
 * Add a favorite
 * @param {string} locationId - Location ID
 * @param {string} itemId - Item ID
 * @param {string} locationName - Location name
 * @param {string} itemName - Item name
 * @returns {Promise<Object>} Created favorite or null
 */
export const addFavorite = async (locationId, itemId, locationName, itemName) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User must be logged in');
    }

    // Check if already exists
    const exists = await isFavorite(locationId, itemId);
    if (exists) {
      console.log('Favorite already exists');
      return null;
    }

    const { data, error } = await supabase
      .from('user_favorites')
      .insert([{
        user_id: user.id,
        location_id: locationId,
        item_id: itemId,
        location_name: locationName,
        item_name: itemName,
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding favorite:', error);
    return null;
  }
};

/**
 * Remove a favorite
 * @param {string} locationId - Location ID
 * @param {string} itemId - Item ID
 * @returns {Promise<boolean>} True if successful
 */
export const removeFavorite = async (locationId, itemId) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User must be logged in');
    }

    const { error } = await supabase
      .from('user_favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('location_id', locationId)
      .eq('item_id', itemId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error removing favorite:', error);
    return false;
  }
};

/**
 * Toggle favorite status
 * @param {string} locationId - Location ID
 * @param {string} itemId - Item ID
 * @param {string} locationName - Location name
 * @param {string} itemName - Item name
 * @returns {Promise<Object>} Result with new status
 */
export const toggleFavorite = async (locationId, itemId, locationName, itemName) => {
  try {
    const isCurrentlyFavorited = await isFavorite(locationId, itemId);
    
    if (isCurrentlyFavorited) {
      await removeFavorite(locationId, itemId);
      return { isFavorited: false };
    } else {
      await addFavorite(locationId, itemId, locationName, itemName);
      return { isFavorited: true };
    }
  } catch (error) {
    console.error('Error toggling favorite:', error);
    return { isFavorited: false, error };
  }
};

/**
 * Get favorites for a specific location
 * @param {string} locationId - Location ID
 * @returns {Promise<Array>} Favorites at this location
 */
export const getFavoritesByLocation = async (locationId) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return [];

    const { data, error } = await supabase
      .from('user_favorites')
      .select('*')
      .eq('user_id', user.id)
      .eq('location_id', locationId);

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error getting favorites by location:', error);
    return [];
  }
};

/**
 * Get favorites for a specific item
 * @param {string} itemId - Item ID
 * @returns {Promise<Array>} Favorites for this item
 */
export const getFavoritesByItem = async (itemId) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return [];

    const { data, error } = await supabase
      .from('user_favorites')
      .select('*')
      .eq('user_id', user.id)
      .eq('item_id', itemId);

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error getting favorites by item:', error);
    return [];
  }
};

/**
 * Clear all favorites for current user
 */
export const clearAllFavorites = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User must be logged in');
    }

    const { error } = await supabase
      .from('user_favorites')
      .delete()
      .eq('user_id', user.id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error clearing favorites:', error);
    return false;
  }
};
