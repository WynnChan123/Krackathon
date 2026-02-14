import { supabase } from './supabaseClient';
import { createPriceUpdateNotification } from './notificationsService';

/**
 * Submit a new price for an item at a location
 * Auto-approved - goes directly to prices table
 * @param {Object} priceData - Price submission data
 * @returns {Promise<Object>} Submission result
 */
export const submitPrice = async (priceData) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User must be logged in to submit prices');
    }

    // Insert directly into prices table (auto-approved)
    const priceRecord = {
      item_id: priceData.item_id,
      location_id: priceData.location_id,
      price: parseFloat(priceData.price),
      date: priceData.date || new Date().toISOString().split('T')[0],
      receipt_url: priceData.receipt_image_url || null,
      submitted_by: user.id,
    };

    const { data, error } = await supabase
      .from('prices')
      .insert([priceRecord])
      .select()
      .single();

    if (error) throw error;

    console.log('💰 Price submitted successfully:', data);
    console.log('🔍 Checking for favorited items...', {
      location_id: priceData.location_id,
      item_id: priceData.item_id,
      location_name: priceData.location_name,
      item_name: priceData.item_name,
    });

    // Check if anyone has favorited this item at this location
    await checkAndCreateNotifications(
      priceData.location_id,
      priceData.item_id,
      parseFloat(priceData.price),
      priceData.location_name,
      priceData.item_name
    );

    // Also log in user_submissions for record-keeping (optional)
    await supabase
      .from('user_submissions')
      .insert([{
        user_id: user.id,
        submission_type: 'price',
        status: 'approved', // Mark as auto-approved
        data: {
          item_id: priceData.item_id,
          location_id: priceData.location_id,
          price: parseFloat(priceData.price),
          date: priceData.date || new Date().toISOString().split('T')[0],
        },
        receipt_image_url: priceData.receipt_image_url || null,
      }]);

    return { success: true, data };
  } catch (error) {
    console.error('Error submitting price:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Check if item is favorited and create notifications
 * @param {string} locationId - Location ID
 * @param {string} itemId - Item ID
 * @param {number} newPrice - New price
 * @param {string} locationName - Location name
 * @param {string} itemName - Item name
 */
const checkAndCreateNotifications = async (locationId, itemId, newPrice, locationName, itemName) => {
  try {
    // Get all users who favorited this item at this location
    const { data: favorites, error: favError } = await supabase
      .from('user_favorites')
      .select('user_id, location_name, item_name')
      .eq('location_id', locationId)
      .eq('item_id', itemId);

    console.log('🔍 Favorites query result:', { favorites, favError });
    console.log('📊 Query parameters:', { locationId, itemId });

    if (favError) {
      console.error('❌ Error checking favorites:', favError);
      return;
    }

    if (!favorites || favorites.length === 0) {
      console.log('⚠️ No users have favorited this item');
      console.log('💡 This could mean:');
      console.log('   1. No one favorited this item');
      console.log('   2. RLS policy is blocking the query');
      console.log('   3. Location/Item IDs don\'t match');
      return;
    }

    console.log(`📬 Found ${favorites.length} users who favorited this item`);

    // Get the previous price for this item at this location
    const { data: previousPrices, error: priceError } = await supabase
      .from('prices')
      .select('price')
      .eq('location_id', locationId)
      .eq('item_id', itemId)
      .order('created_at', { ascending: false })
      .limit(2); // Get last 2 prices (new one and previous one)

    if (priceError) {
      console.error('Error getting previous prices:', priceError);
    }

    // Determine old price (if exists)
    const oldPrice = previousPrices && previousPrices.length > 1 
      ? parseFloat(previousPrices[1].price) 
      : newPrice; // If no previous price, use new price

    // Create notifications for each user who favorited this item
    for (const favorite of favorites) {
      const notificationData = {
        user_id: favorite.user_id,
        location_id: locationId,
        item_id: itemId,
        location_name: locationName || favorite.location_name,
        item_name: itemName || favorite.item_name,
        old_price: oldPrice,
        new_price: newPrice,
      };

      // Use the notification service to create notification
      await createPriceUpdateNotification(
        notificationData.user_id,
        locationId,
        itemId,
        locationName || favorite.location_name,
        itemName || favorite.item_name,
        oldPrice,
        newPrice
      );
    }

    console.log(`✅ Created ${favorites.length} notifications`);
  } catch (error) {
    console.error('Error creating notifications:', error);
  }
};


/**
 * Upload receipt image to Supabase Storage
 * @param {File} file - Receipt image file
 * @returns {Promise<string>} Public URL of uploaded image
 */
export const uploadReceipt = async (file) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User must be logged in to upload receipts');
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('receipts')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('receipts')
      .getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading receipt:', error);
    throw error;
  }
};

/**
 * Get user's submission history
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of submissions
 */
export const getUserSubmissions = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('user_submissions')
      .select('*')
      .eq('user_id', userId)
      .eq('submission_type', 'price')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching user submissions:', error);
    return [];
  }
};

/**
 * Get price freshness category
 * @param {string} dateString - Date string (YYYY-MM-DD)
 * @returns {string} 'fresh', 'moderate', 'old', or 'none'
 */
export const getPriceFreshness = (dateString) => {
  if (!dateString) return 'none';
  
  const priceDate = new Date(dateString);
  const today = new Date();
  const daysDiff = Math.floor((today - priceDate) / (1000 * 60 * 60 * 24));

  if (daysDiff <= 7) return 'fresh';
  if (daysDiff <= 30) return 'moderate';
  return 'old';
};

/**
 * Get freshness color
 * @param {string} freshness - Freshness category
 * @returns {string} Tailwind color class
 */
export const getFreshnessColor = (freshness) => {
  switch (freshness) {
    case 'fresh':
      return 'text-green-600';
    case 'moderate':
      return 'text-yellow-600';
    case 'old':
      return 'text-red-600';
    default:
      return 'text-gray-400';
  }
};

/**
 * Format days ago text
 * @param {string} dateString - Date string
 * @returns {string} Human-readable text
 */
export const formatDaysAgo = (dateString) => {
  if (!dateString) return 'No data';
  
  const priceDate = new Date(dateString);
  const today = new Date();
  const daysDiff = Math.floor((today - priceDate) / (1000 * 60 * 60 * 24));

  if (daysDiff === 0) return 'Today';
  if (daysDiff === 1) return 'Yesterday';
  if (daysDiff < 7) return `${daysDiff} days ago`;
  if (daysDiff < 30) return `${Math.floor(daysDiff / 7)} weeks ago`;
  return `${Math.floor(daysDiff / 30)} months ago`;
};
