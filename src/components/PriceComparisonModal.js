const PriceComparisonModal = ({ comparisonData, onClose }) => {
  const { hasEnoughData, supermarkets, itemsWithPrices, totalItems, coveragePercentage } = comparisonData;

  const getMedalIcon = (index) => {
    const medals = ['🥇', '🥈', '🥉'];
    return medals[index] || '📍';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 rounded-t-2xl sticky top-0">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">Price Comparison</h2>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all"
            >
              ✕
            </button>
          </div>
          <p className="text-green-100 mt-2 text-sm">
            {hasEnoughData 
              ? `Comparing prices across ${supermarkets.length} supermarkets`
              : 'Not enough price data available'}
          </p>
        </div>

        {/* Body */}
        <div className="p-6">
          {!hasEnoughData ? (
            // Not Enough Data State
            <div className="text-center py-12">
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Not Enough Data</h3>
              <p className="text-gray-600 mb-4">
                We don't have enough price information to compare supermarkets for your list.
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-700">
                  <strong>Coverage:</strong> {itemsWithPrices} out of {totalItems} items ({coveragePercentage}%)
                </p>
                <p className="text-xs text-gray-600 mt-2">
                  We need at least 50% coverage and 2+ supermarkets to show comparison
                </p>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                Help us by submitting prices for items in your list!
              </p>
              <button
                onClick={onClose}
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                Got it
              </button>
            </div>
          ) : (
            // Comparison Results
            <div className="space-y-4">
              {/* Coverage Info */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-gray-700">
                  <strong>Price Coverage:</strong> {itemsWithPrices} out of {totalItems} items ({coveragePercentage}%)
                </p>
              </div>

              {/* Supermarket Rankings */}
              {supermarkets.map((supermarket, index) => (
                <div
                  key={supermarket.location_id}
                  className={`rounded-xl p-5 border-2 ${
                    index === 0
                      ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  {/* Supermarket Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl">{getMedalIcon(index)}</span>
                      <div>
                        <h3 className="font-bold text-lg text-gray-800">
                          {supermarket.location_name}
                        </h3>
                        <p className="text-xs text-gray-500">{supermarket.location_city}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">
                        RM {supermarket.total.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {supermarket.itemCount} items
                      </p>
                    </div>
                  </div>

                  {/* Item Breakdown */}
                  {index === 0 && (
                    <div className="border-t border-green-200 pt-3 mt-3">
                      <p className="text-xs font-semibold text-gray-600 mb-2">Breakdown:</p>
                      <div className="space-y-1">
                        {supermarket.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span className="text-gray-700">
                              {item.name} ({item.quantity} {item.unit})
                            </span>
                            <span className="text-gray-600">
                              RM {item.total.toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Savings Badge */}
                  {index > 0 && (
                    <div className="mt-2">
                      <span className="inline-block bg-red-100 text-red-700 text-xs px-2 py-1 rounded">
                        +RM {(supermarket.total - supermarkets[0].total).toFixed(2)} more expensive
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PriceComparisonModal;
