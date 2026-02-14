import { supabase } from './supabaseClient';

/**
 * Add a new purchase
 * @param {Object} purchaseData - Purchase data
 * @returns {Promise<Object>} Result with success status
 */
export const addPurchase = async (purchaseData) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User must be logged in to add purchases');
    }

    const purchase = {
      user_id: user.id,
      item_id: purchaseData.item_id,
      location_id: purchaseData.location_id,
      price_paid: parseFloat(purchaseData.price_paid),
      quantity: parseInt(purchaseData.quantity) || 1,
      purchase_date: purchaseData.purchase_date || new Date().toISOString().split('T')[0],
      notes: purchaseData.notes || null,
    };

    const { data, error } = await supabase
      .from('user_purchases')
      .insert([purchase])
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('Error adding purchase:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get user's purchases with item and location details
 * @param {string} userId - User ID (optional, defaults to current user)
 * @returns {Promise<Array>} Array of purchases
 */
export const getUserPurchases = async (userId = null) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User must be logged in');
    }

    const targetUserId = userId || user.id;

    const { data, error } = await supabase
      .from('user_purchases')
      .select(`
        *,
        items (
          id,
          name,
          brand,
          unit
        ),
        locations (
          id,
          name,
          address,
          city,
          type
        )
      `)
      .eq('user_id', targetUserId)
      .order('purchase_date', { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    if (error) throw error;
    return [];
  }
};

/**
 * Delete a purchase
 * @param {string} purchaseId - Purchase ID
 * @returns {Promise<Object>} Result with success status
 */
export const deletePurchase = async (purchaseId) => {
  try {
    const { error } = await supabase
      .from('user_purchases')
      .delete()
      .eq('id', purchaseId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error deleting purchase:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get average market price for an item
 * @param {string} itemId - Item ID
 * @returns {Promise<number|null>} Average price or null
 */
export const getAveragePrice = async (itemId) => {
  try {
    const { data, error } = await supabase
      .from('prices')
      .select('price')
      .eq('item_id', itemId);

    if (error) throw error;

    if (!data || data.length === 0) return null;

    const total = data.reduce((sum, p) => sum + parseFloat(p.price), 0);
    return total / data.length;
  } catch (error) {
    console.error('Error fetching average price:', error);
    return null;
  }
};

/**
 * Calculate savings for purchases
 * @param {Array} purchases - Array of purchase objects
 * @returns {Promise<Object>} Savings statistics
 */
export const calculateSavings = async (purchases) => {
  try {
    let totalSavings = 0;
    let totalSpent = 0;
    let purchasesWithComparison = 0;
    let bestDeal = null;
    let worstDeal = null;

    for (const purchase of purchases) {
      const avgPrice = await getAveragePrice(purchase.item_id);
      const spent = parseFloat(purchase.price_paid) * purchase.quantity;
      totalSpent += spent;

      if (avgPrice !== null) {
        const savings = (avgPrice - parseFloat(purchase.price_paid)) * purchase.quantity;
        totalSavings += savings;
        purchasesWithComparison++;

        // Track best and worst deals
        if (!bestDeal || savings > bestDeal.savings) {
          bestDeal = { ...purchase, savings, avgPrice };
        }
        if (!worstDeal || savings < worstDeal.savings) {
          worstDeal = { ...purchase, savings, avgPrice };
        }
      }
    }

    return {
      totalSavings: parseFloat(totalSavings.toFixed(2)),
      totalSpent: parseFloat(totalSpent.toFixed(2)),
      totalPurchases: purchases.length,
      purchasesWithComparison,
      averageSavingsPerPurchase: purchasesWithComparison > 0 
        ? parseFloat((totalSavings / purchasesWithComparison).toFixed(2))
        : 0,
      bestDeal,
      worstDeal,
    };
  } catch (error) {
    console.error('Error calculating savings:', error);
    return {
      totalSavings: 0,
      totalSpent: 0,
      totalPurchases: 0,
      purchasesWithComparison: 0,
      averageSavingsPerPurchase: 0,
      bestDeal: null,
      worstDeal: null,
    };
  }
};

/**
 * Calculate savings for a single purchase
 * @param {Object} purchase - Purchase object with item_id
 * @param {number} pricePaid - Price paid
 * @param {number} quantity - Quantity purchased
 * @returns {Promise<Object>} Savings info
 */
export const calculatePurchaseSavings = async (purchase, pricePaid, quantity) => {
  try {
    const avgPrice = await getAveragePrice(purchase.item_id);
    
    if (avgPrice === null) {
      return {
        savings: null,
        avgPrice: null,
        hasSavings: false,
      };
    }

    const savings = (avgPrice - pricePaid) * quantity;

    return {
      savings: parseFloat(savings.toFixed(2)),
      avgPrice: parseFloat(avgPrice.toFixed(2)),
      hasSavings: true,
    };
  } catch (error) {
    console.error('Error calculating purchase savings:', error);
    return {
      savings: null,
      avgPrice: null,
      hasSavings: false,
    };
  }
};
