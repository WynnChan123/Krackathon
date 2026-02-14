import { useState, useEffect } from 'react';
import { calculatePurchaseSavings } from '../services/savingsService';
import { deletePurchase } from '../services/savingsService';

const PurchaseCard = ({ purchase, onDelete }) => {
  const [savings, setSavings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSavings = async () => {
      setLoading(true);
      const savingsData = await calculatePurchaseSavings(
        purchase,
        parseFloat(purchase.price_paid),
        purchase.quantity
      );
      setSavings(savingsData);
      setLoading(false);
    };

    loadSavings();
  }, [purchase]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this purchase?')) {
      const result = await deletePurchase(purchase.id);
      if (result.success) {
        onDelete && onDelete(purchase.id);
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-MY', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getSavingsColor = () => {
    if (!savings || !savings.hasSavings) return 'text-gray-500';
    return savings.savings > 0 ? 'text-green-600' : 'text-red-600';
  };

  const getSavingsBgColor = () => {
    if (!savings || !savings.hasSavings) return 'bg-gray-50';
    return savings.savings > 0 ? 'bg-green-50' : 'bg-red-50';
  };

  const totalPaid = parseFloat(purchase.price_paid) * purchase.quantity;

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="text-white font-bold text-lg">
              {purchase.items?.name || 'Unknown Item'}
            </h3>
            {purchase.items?.brand && (
              <p className="text-indigo-100 text-sm">{purchase.items.brand}</p>
            )}
          </div>
          <button
            onClick={handleDelete}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all"
            title="Delete purchase"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        {/* Location */}
        <div className="flex items-center text-sm text-gray-600">
          <span className="mr-2">📍</span>
          <span>{purchase.locations?.name || 'Unknown Location'}</span>
        </div>

        {/* Date */}
        <div className="flex items-center text-sm text-gray-600">
          <span className="mr-2">📅</span>
          <span>{formatDate(purchase.purchase_date)}</span>
        </div>

        {/* Price Details */}
        <div className="border-t pt-3 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Price Paid:</span>
            <span className="font-semibold text-gray-800">
              RM {parseFloat(purchase.price_paid).toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Quantity:</span>
            <span className="font-semibold text-gray-800">{purchase.quantity}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Total:</span>
            <span className="font-bold text-indigo-600">
              RM {totalPaid.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Savings Indicator */}
        {loading ? (
          <div className="text-center py-2">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
          </div>
        ) : savings && savings.hasSavings ? (
          <div className={`${getSavingsBgColor()} rounded-lg p-3 border-l-4 ${savings.savings > 0 ? 'border-green-500' : 'border-red-500'}`}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-600">Avg Market Price:</span>
              <span className="text-sm font-medium text-gray-700">
                RM {savings.avgPrice.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`text-sm font-semibold ${getSavingsColor()}`}>
                {savings.savings > 0 ? '💰 Saved:' : '⚠️ Overpaid:'}
              </span>
              <span className={`text-lg font-bold ${getSavingsColor()}`}>
                RM {Math.abs(savings.savings).toFixed(2)}
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <span className="text-xs text-gray-500">
              No market data available for comparison
            </span>
          </div>
        )}

        {/* Notes */}
        {purchase.notes && (
          <div className="bg-yellow-50 rounded-lg p-3 border-l-4 border-yellow-400">
            <p className="text-xs text-gray-600 mb-1">Notes:</p>
            <p className="text-sm text-gray-700">{purchase.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PurchaseCard;
