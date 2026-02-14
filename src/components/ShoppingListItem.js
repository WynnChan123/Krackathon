import { updateItemQuantity, removeItemFromList } from '../services/shoppingListService';

const ShoppingListItem = ({ item, onUpdate }) => {
  const handleQuantityChange = (delta) => {
    const newQuantity = item.quantity + delta;
    if (newQuantity > 0) {
      updateItemQuantity(item.id, newQuantity);
      onUpdate && onUpdate();
    }
  };

  const handleRemove = () => {
    removeItemFromList(item.id);
    onUpdate && onUpdate();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-all duration-200">
      <div className="flex items-center justify-between">
        {/* Item Info */}
        <div className="flex-1">
          <h3 className="font-semibold text-gray-800">{item.item_name}</h3>
          {item.item_brand && (
            <p className="text-sm text-gray-500">{item.item_brand}</p>
          )}
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => handleQuantityChange(-1)}
            className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-all"
            title="Decrease quantity"
          >
            <span className="text-gray-600 font-bold">−</span>
          </button>
          
          <div className="text-center min-w-[60px]">
            <p className="text-lg font-bold text-gray-800">{item.quantity}</p>
            <p className="text-xs text-gray-500">{item.unit}</p>
          </div>
          
          <button
            onClick={() => handleQuantityChange(1)}
            className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-all"
            title="Increase quantity"
          >
            <span className="text-gray-600 font-bold">+</span>
          </button>

          {/* Remove Button */}
          <button
            onClick={handleRemove}
            className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 transition-all ml-2"
            title="Remove item"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShoppingListItem;
