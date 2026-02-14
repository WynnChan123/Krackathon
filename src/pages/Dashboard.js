import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">$</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              SaveSmart
            </span>
          </div>
          <button
            onClick={handleSignOut}
            className="px-6 py-2 text-red-600 font-semibold hover:bg-red-50 rounded-lg transition-all duration-200"
          >
            Sign Out
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome to SaveSmart!</h1>
                <p className="text-gray-600">
                  Logged in as: <span className="font-semibold text-indigo-600">{user?.email}</span>
                </p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                <span className="text-3xl">✓</span>
              </div>
            </div>
            <div className="border-t border-gray-200 pt-6">
              <p className="text-gray-700 mb-4">
                🎉 Your account is all set up! You're now ready to start finding the cheapest supermarkets near you.
              </p>
              <p className="text-gray-600 text-sm">
                This is your dashboard where you'll be able to search for supermarkets, compare prices, and track your savings.
              </p>
            </div>
          </div>

          {/* Coming Soon Features */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl">🔍</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">Supermarket Search</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Find and compare supermarkets in your area based on location and pricing.
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate('/supermarket-search')}
                className="w-full py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
              >
                View Map
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-dashed border-gray-200">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Savings Tracker</h3>
              <p className="text-gray-600 text-sm">
                Track how much you've saved over time by shopping at cheaper stores.
              </p>
              <span className="inline-block mt-3 text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                Coming Soon
              </span>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-dashed border-gray-200">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🛒</span>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Shopping Lists</h3>
              <p className="text-gray-600 text-sm">
                Create shopping lists and see which store offers the best total price.
              </p>
              <span className="inline-block mt-3 text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                Coming Soon
              </span>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-dashed border-gray-200">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🔔</span>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Price Alerts</h3>
              <p className="text-gray-600 text-sm">
                Get notified when prices drop at your favorite supermarkets.
              </p>
              <span className="inline-block mt-3 text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                Coming Soon
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
