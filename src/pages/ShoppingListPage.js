import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getShoppingList, clearShoppingList, compareSupermarkets } from '../services/shoppingListService';
import AddItemToListModal from '../components/AddItemToListModal';
import ShoppingListItem from '../components/ShoppingListItem';
import PriceComparisonModal from '../components/PriceComparisonModal';

const ShoppingListPage = () => {
  const navigate = useNavigate();
  const [shoppingList, setShoppingList] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [comparisonData, setComparisonData] = useState(null);
  const [loadingComparison, setLoadingComparison] = useState(false);

  useEffect(() => {
    loadShoppingList();
  }, []);

  const loadShoppingList = () => {
    const list = getShoppingList();
    setShoppingList(list);
  };

  const handleItemAdded = () => {
    loadShoppingList();
  };

  const handleItemUpdated = () => {
    loadShoppingList();
  };

  const handleClearList = () => {
    if (window.confirm('Are you sure you want to clear your entire shopping list?')) {
      clearShoppingList();
      setShoppingList([]);
    }
  };

  const handleShowComparison = async () => {
    setLoadingComparison(true);
    const data = await compareSupermarkets(shoppingList);
    setComparisonData(data);
    setShowComparisonModal(true);
    setLoadingComparison(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-4 w-full md:w-auto">
              <button
                onClick={() => navigate('/dashboard')}
                className="hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all flex-shrink-0"
              >
                ← Back
              </button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">My Shopping List</h1>
                <p className="text-pink-100 mt-1">
                  {shoppingList.length} {shoppingList.length === 1 ? 'item' : 'items'} in your list
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-white text-pink-600 px-6 py-3 rounded-lg font-semibold hover:shadow-xl transition-all duration-200 flex items-center space-x-2 w-full md:w-auto justify-center"
            >
              <span className="text-xl">+</span>
              <span>Add Item</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {shoppingList.length === 0 ? (
            // Empty State
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <div className="text-8xl mb-6">🛒</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">Your list is empty</h2>
              <p className="text-gray-600 mb-8">
                Start adding items to compare prices across supermarkets!
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-gradient-to-r from-pink-600 to-rose-600 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-xl transition-all duration-200"
              >
                Start Adding Items
              </button>
            </div>
          ) : (
            <>
              {/* Shopping List Items */}
              <div className="space-y-3 mb-6">
                {shoppingList.map((item) => (
                  <ShoppingListItem
                    key={item.id}
                    item={item}
                    onUpdate={handleItemUpdated}
                  />
                ))}
              </div>

              {/* Action Buttons */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={handleClearList}
                    className="py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-all duration-200 border-2 border-gray-300"
                  >
                    Clear List
                  </button>
                  <button
                    onClick={handleShowComparison}
                    disabled={loadingComparison}
                    className="py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {loadingComparison ? 'Loading...' : 'Show Comparison'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <AddItemToListModal
          onClose={() => setShowAddModal(false)}
          onSuccess={handleItemAdded}
        />
      )}

      {/* Price Comparison Modal */}
      {showComparisonModal && comparisonData && (
        <PriceComparisonModal
          comparisonData={comparisonData}
          onClose={() => setShowComparisonModal(false)}
        />
      )}
    </div>
  );
};

export default ShoppingListPage;
