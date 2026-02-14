import { supabase } from './supabaseClient';

const STORAGE_KEY = 'savesmart_shopping_list';

/**
 * Get shopping list from localStorage
 * @returns {Array} Shopping list items
 */
export const getShoppingList = () => {
  try {
    const list = localStorage.getItem(STORAGE_KEY);
    return list ? JSON.parse(list) : [];
  } catch (error) {
    console.error('Error getting shopping list:', error);
    return [];
  }
};

/**
 * Save shopping list to localStorage
 * @param {Array} list - Shopping list items
 */
const saveShoppingList = (list) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (error) {
    console.error('Error saving shopping list:', error);
  }
};

/**
 * Add item to shopping list
 * @param {Object} item - Item object with id, name, brand, unit
 * @param {number} quantity - Quantity to add
 * @returns {Array} Updated shopping list
 */
export const addItemToList = (item, quantity) => {
  const list = getShoppingList();
  
  // Check if item already exists
  const existingIndex = list.findIndex(i => i.item_id === item.id);
  
  if (existingIndex >= 0) {
    // Update quantity if item exists
    list[existingIndex].quantity += quantity;
  } else {
    // Add new item
    list.push({
      id: `${Date.now()}_${item.id}`,
      item_id: item.id,
      item_name: item.name,
      item_brand: item.brand || '',
      quantity: quantity,
      unit: item.unit || 'unit',
    });
  }
  
  saveShoppingList(list);
  return list;
};

/**
 * Update item quantity
 * @param {string} listItemId - Shopping list item ID
 * @param {number} newQuantity - New quantity
 * @returns {Array} Updated shopping list
 */
export const updateItemQuantity = (listItemId, newQuantity) => {
  const list = getShoppingList();
  const index = list.findIndex(i => i.id === listItemId);
  
  if (index >= 0) {
    if (newQuantity <= 0) {
      // Remove if quantity is 0 or less
      list.splice(index, 1);
    } else {
      list[index].quantity = newQuantity;
    }
  }
  
  saveShoppingList(list);
  return list;
};

/**
 * Remove item from shopping list
 * @param {string} listItemId - Shopping list item ID
 * @returns {Array} Updated shopping list
 */
export const removeItemFromList = (listItemId) => {
  const list = getShoppingList();
  const filtered = list.filter(i => i.id !== listItemId);
  saveShoppingList(filtered);
  return filtered;
};

/**
 * Clear entire shopping list
 */
export const clearShoppingList = () => {
  saveShoppingList([]);
  return [];
};

/**
 * Compare prices across supermarkets for shopping list
 * @param {Array} shoppingList - Shopping list items
 * @returns {Promise<Object>} Comparison results
 */
export const compareSupermarkets = async (shoppingList) => {
  try {
    if (!shoppingList || shoppingList.length === 0) {
      return {
        hasEnoughData: false,
        supermarkets: [],
        itemsWithPrices: 0,
        totalItems: 0,
      };
    }

    // Get all item IDs
    const itemIds = shoppingList.map(item => item.item_id);

    // Fetch all prices for these items
    const { data: prices, error } = await supabase
      .from('prices')
      .select(`
        *,
        locations (
          id,
          name,
          city,
          type
        )
      `)
      .in('item_id', itemIds);

    if (error) throw error;

    // Group prices by location
    const locationTotals = {};
    const itemsFound = new Set();

    prices?.forEach(price => {
      const locationId = price.location_id;
      const locationName = price.locations?.name || 'Unknown';
      const locationCity = price.locations?.city || '';
      
      if (!locationTotals[locationId]) {
        locationTotals[locationId] = {
          location_id: locationId,
          location_name: locationName,
          location_city: locationCity,
          total: 0,
          items: [],
          itemCount: 0,
        };
      }

      // Find matching shopping list item
      const listItem = shoppingList.find(item => item.item_id === price.item_id);
      if (listItem) {
        const itemTotal = parseFloat(price.price) * listItem.quantity;
        locationTotals[locationId].total += itemTotal;
        locationTotals[locationId].items.push({
          name: listItem.item_name,
          quantity: listItem.quantity,
          unit: listItem.unit,
          price: parseFloat(price.price),
          total: itemTotal,
        });
        locationTotals[locationId].itemCount++;
        itemsFound.add(price.item_id);
      }
    });

    // Convert to array and sort by total
    const supermarkets = Object.values(locationTotals)
      .filter(loc => loc.itemCount > 0)
      .sort((a, b) => a.total - b.total);

    // Check if we have enough data (at least 50% of items)
    const itemsWithPrices = itemsFound.size;
    const hasEnoughData = itemsWithPrices >= shoppingList.length * 0.5 && supermarkets.length >= 2;

    return {
      hasEnoughData,
      supermarkets,
      itemsWithPrices,
      totalItems: shoppingList.length,
      coveragePercentage: Math.round((itemsWithPrices / shoppingList.length) * 100),
    };
  } catch (error) {
    console.error('Error comparing supermarkets:', error);
    return {
      hasEnoughData: false,
      supermarkets: [],
      itemsWithPrices: 0,
      totalItems: shoppingList.length,
      error: error.message,
    };
  }
};
