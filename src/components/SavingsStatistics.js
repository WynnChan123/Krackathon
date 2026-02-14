const SavingsStatistics = ({ statistics, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  const getSavingsColor = (amount) => {
    return amount >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getSavingsBg = (amount) => {
    return amount >= 0 ? 'from-green-500 to-green-600' : 'from-red-500 to-red-600';
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl shadow-lg p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Savings</h2>
        <p className="text-gray-600 text-sm">Track how much you've saved on your purchases</p>
      </div>

      {/* Main Savings Display */}
      <div className={`bg-gradient-to-r ${getSavingsBg(statistics.totalSavings)} rounded-xl p-6 mb-6 text-white`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-90 mb-1">Total Savings</p>
            <p className="text-4xl font-bold">
              RM {Math.abs(statistics.totalSavings).toFixed(2)}
            </p>
            <p className="text-sm opacity-75 mt-2">
              {statistics.totalSavings >= 0 ? '💰 Money Saved' : '⚠️ Overpaid'}
            </p>
          </div>
          <div className="text-6xl opacity-20">
            {statistics.totalSavings >= 0 ? '📈' : '📉'}
          </div>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Total Purchases */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-xs text-gray-500 mb-1">Total Purchases</p>
          <p className="text-2xl font-bold text-indigo-600">{statistics.totalPurchases}</p>
        </div>

        {/* Total Spent */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-xs text-gray-500 mb-1">Total Spent</p>
          <p className="text-2xl font-bold text-gray-800">
            RM {statistics.totalSpent.toFixed(2)}
          </p>
        </div>

        {/* Average Savings */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-xs text-gray-500 mb-1">Avg Savings/Purchase</p>
          <p className={`text-2xl font-bold ${getSavingsColor(statistics.averageSavingsPerPurchase)}`}>
            RM {Math.abs(statistics.averageSavingsPerPurchase).toFixed(2)}
          </p>
        </div>

        {/* Compared Purchases */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-xs text-gray-500 mb-1">With Price Data</p>
          <p className="text-2xl font-bold text-purple-600">
            {statistics.purchasesWithComparison}
          </p>
        </div>
      </div>

      {/* Best Deal */}
      {statistics.bestDeal && statistics.bestDeal.savings > 0 && (
        <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-4 mb-4">
          <div className="flex items-start">
            <span className="text-2xl mr-3">🏆</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-green-800 mb-1">Best Deal</p>
              <p className="text-sm text-gray-700">
                {statistics.bestDeal.items?.name}
              </p>
              <p className="text-xs text-green-600 font-medium mt-1">
                Saved RM {statistics.bestDeal.savings.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Worst Deal */}
      {statistics.worstDeal && statistics.worstDeal.savings < 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
          <div className="flex items-start">
            <span className="text-2xl mr-3">⚠️</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-800 mb-1">Highest Overpayment</p>
              <p className="text-sm text-gray-700">
                {statistics.worstDeal.items?.name}
              </p>
              <p className="text-xs text-red-600 font-medium mt-1">
                Overpaid RM {Math.abs(statistics.worstDeal.savings).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavingsStatistics;
