import { supabase } from './supabaseClient';

/**
 * Get all notifications for current user
 * @returns {Promise<Array>} Array of notifications
 */
export const getNotifications = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log('No user logged in');
      return [];
    }

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error getting notifications:', error);
    return [];
  }
};

/**
 * Get count of unread notifications
 * @returns {Promise<number>} Count of unread notifications
 */
export const getUnreadCount = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return 0;

    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    if (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
};

/**
 * Create a new notification for a specific user
 * @param {string} userId - User ID to create notification for
 * @param {Object} data - Notification data
 * @returns {Promise<Object>} Created notification or null
 */
export const createNotificationForUser = async (userId, data) => {
  try {
    const notificationData = {
      user_id: userId,
      type: data.type || 'price_update',
      title: data.title,
      message: data.message,
      location_id: data.location_id || null,
      item_id: data.item_id || null,
      location_name: data.location_name || null,
      item_name: data.item_name || null,
      old_price: data.old_price || null,
      new_price: data.new_price || null,
      is_read: false,
    };

    console.log('📝 Attempting to create notification with data:', notificationData);

    const { data: notification, error } = await supabase
      .from('notifications')
      .insert([notificationData])
      .select()
      .single();

    if (error) {
      console.error('❌ Failed to create notification:', error);
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw error;
    }

    console.log('✅ Notification created:', notification);
    return notification;
  } catch (error) {
    console.error('❌ Error creating notification:', error);
    console.error('Full error object:', JSON.stringify(error, null, 2));
    return null;
  }
};

/**
 * Mark a notification as read
 * @param {string} notificationId - Notification ID
 * @returns {Promise<boolean>} True if successful
 */
export const markAsRead = async (notificationId) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User must be logged in');
    }

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .eq('user_id', user.id);

    if (error) throw error;

    console.log('✅ Notification marked as read');
    return true;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }
};

/**
 * Mark all notifications as read
 * @returns {Promise<boolean>} True if successful
 */
export const markAllAsRead = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User must be logged in');
    }

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    if (error) throw error;

    console.log('✅ All notifications marked as read');
    return true;
  } catch (error) {
    console.error('Error marking all as read:', error);
    return false;
  }
};

/**
 * Delete a notification
 * @param {string} notificationId - Notification ID
 * @returns {Promise<boolean>} True if successful
 */
export const deleteNotification = async (notificationId) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User must be logged in');
    }

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)
      .eq('user_id', user.id);

    if (error) throw error;

    console.log('✅ Notification deleted');
    return true;
  } catch (error) {
    console.error('Error deleting notification:', error);
    return false;
  }
};

/**
 * Clear all notifications for current user
 */
export const clearAllNotifications = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User must be logged in');
    }

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', user.id);

    if (error) throw error;

    console.log('✅ All notifications cleared');
    return true;
  } catch (error) {
    console.error('Error clearing notifications:', error);
    return false;
  }
};

/**
 * Get time ago string
 * @param {string} dateString - ISO date string
 * @returns {string} Time ago string
 */
export const getTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
  return date.toLocaleDateString();
};

/**
 * Create price update notification for a specific user
 * @param {string} userId - User ID
 * @param {string} locationId - Location ID
 * @param {string} itemId - Item ID
 * @param {string} locationName - Location name
 * @param {string} itemName - Item name
 * @param {number} oldPrice - Old price
 * @param {number} newPrice - New price
 */
export const createPriceUpdateNotification = async (
  userId,
  locationId,
  itemId,
  locationName,
  itemName,
  oldPrice,
  newPrice
) => {
  const priceDiff = newPrice - oldPrice;
  const isPriceDrop = priceDiff < 0;
  
  const title = isPriceDrop ? '🔻 Price Drop!' : '📈 Price Update';
  const message = `${itemName} at ${locationName}\nRM ${oldPrice.toFixed(2)} → RM ${newPrice.toFixed(2)}`;
  
  return createNotificationForUser(userId, {
    type: isPriceDrop ? 'price_drop' : 'price_update',
    title,
    message,
    location_id: locationId,
    item_id: itemId,
    location_name: locationName,
    item_name: itemName,
    old_price: oldPrice,
    new_price: newPrice,
  });
};
