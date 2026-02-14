import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserPurchases, calculateSavings } from '../services/savingsService';
import AddPurchaseModal from '../components/AddPurchaseModal';
import PurchaseCard from '../components/PurchaseCard';
import SavingsStatistics from '../components/SavingsStatistics';

const SavingsTrackerPage = () => {
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    loadPurchases();
  }, []);

  const loadPurchases = async () => {
    console.log('🔍 Loading purchases...');
    setLoading(true);
    const data = await getUserPurchases();
    console.log('📦 Purchases data:', data);
    console.log('📊 Number of purchases:', data.length);
    setPurchases(data);
    
    // Calculate statistics
    const stats = await calculateSavings(data);
    console.log('💰 Statistics:', stats);
    setStatistics(stats);
    
    setLoading(false);
  };

  const handlePurchaseAdded = () => {
    loadPurchases();
  };

  const handlePurchaseDeleted = (purchaseId) => {
    setPurchases(purchases.filter(p => p.id !== purchaseId));
    // Recalculate statistics
    const updatedPurchases = purchases.filter(p => p.id !== purchaseId);
    calculateSavings(updatedPurchases).then(setStatistics);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg">
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
                <h1 className="text-2xl md:text-3xl font-bold">Savings Tracker</h1>
                <p className="text-indigo-100 mt-1">Track your purchases and see how much you save</p>
              </div>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:shadow-xl transition-all duration-200 flex items-center space-x-2 w-full md:w-auto justify-center"
            >
              <span className="text-xl">+</span>
              <span>Add Purchase</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your purchases...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Statistics Sidebar */}
            <div className="lg:col-span-1">
              <SavingsStatistics statistics={statistics} loading={false} />
            </div>

            {/* Purchases Grid */}
            <div className="lg:col-span-2">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Purchase History</h2>
                <p className="text-gray-600 text-sm">
                  {purchases.length} {purchases.length === 1 ? 'purchase' : 'purchases'} logged
                </p>
              </div>

              {purchases.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                  <div className="text-6xl mb-4">🛒</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">No purchases yet</h3>
                  <p className="text-gray-600 mb-6">
                    Start tracking your purchases to see how much you're saving!
                  </p>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-xl transition-all duration-200"
                  >
                    Add Your First Purchase
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {purchases.map((purchase) => (
                    <PurchaseCard
                      key={purchase.id}
                      purchase={purchase}
                      onDelete={handlePurchaseDeleted}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add Purchase Modal */}
      {showAddModal && (
        <AddPurchaseModal
          onClose={() => setShowAddModal(false)}
          onSuccess={handlePurchaseAdded}
        />
      )}
    </div>
  );
};

export default SavingsTrackerPage;
