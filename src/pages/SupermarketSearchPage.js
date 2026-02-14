import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SupermarketMap from '../components/SupermarketMap';
import PriceSubmissionModal from '../components/PriceSubmissionModal';
import ReceiptViewerModal from '../components/ReceiptViewerModal';
import { fetchLocations, fetchCities, fetchItems, formatLocationType } from '../services/locationService';
import { getMalaysianSupermarkets, convertGooglePlaceToLocation } from '../services/googlePlacesService';

const SupermarketSearchPage = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [locations, setLocations] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [cities, setCities] = useState([]);
  // const [items, setItems] = useState([]); // Unused
  const [loading, setLoading] = useState(true);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showReceiptViewer, setShowReceiptViewer] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  // Filter state
  const [filters, setFilters] = useState({
    locationType: ['supermarket', 'pasar_malam', 'grocery_store', 'food_bank'],
    city: '',
    items: [],
  });

  // Define applyFilters before it is used in useEffect
  const applyFilters = () => {
    // Filter from the merged locations state instead of fetching from Supabase
    let filtered = locations;

    // Filter by location type
    if (filters.locationType.length > 0) {
      filtered = filtered.filter(loc => filters.locationType.includes(loc.type));
    }

    // Filter by city
    if (filters.city) {
      filtered = filtered.filter(loc => loc.city === filters.city);
    }

    setFilteredLocations(filtered);
  };

  useEffect(() => {
    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, locations]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      // Load both Supabase data and Malaysian supermarkets
      const [locationsData, , , malaysianSupermarkets] = await Promise.all([
        fetchLocations(),
        fetchCities(),
        fetchItems(),
        getMalaysianSupermarkets(),
      ]);


      // Merge Malaysian supermarkets with Supabase locations
      const convertedSupermarkets = malaysianSupermarkets.map(convertGooglePlaceToLocation);
      
      // Combine both datasets, avoiding duplicates by name
      const existingNames = new Set(locationsData.map(loc => loc.name.toLowerCase()));
      const newSupermarkets = convertedSupermarkets.filter(
        sup => !existingNames.has(sup.name.toLowerCase())
      );
      
      const allLocations = [...locationsData, ...newSupermarkets];
      
      setLocations(allLocations);
      setFilteredLocations(allLocations);
      
      // Extract unique cities from all locations
      const allCities = [...new Set(allLocations.map(loc => loc.city).filter(Boolean))].sort();
      setCities(allCities);

      

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };



  const handleLocationTypeToggle = (type) => {
    setFilters(prev => ({
      ...prev,
      locationType: prev.locationType.includes(type)
        ? prev.locationType.filter(t => t !== type)
        : [...prev.locationType, type]
    }));
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleAddPrice = (location) => {
    setSelectedLocation(location);
    setShowPriceModal(true);
  };

  const handlePriceSubmitted = () => {
    // Reload data to show new submission
    loadInitialData();
  };

  const handleViewReceipt = (receiptUrl, itemName) => {
    setSelectedReceipt({ url: receiptUrl, itemName });
    setShowReceiptViewer(true);
  };

  const locationTypes = [
    { value: 'supermarket', label: 'Supermarkets', icon: '🏪' },
    { value: 'pasar_malam', label: 'Pasar Malam', icon: '🏮' },
    { value: 'grocery_store', label: 'Grocery Stores', icon: '🛒' },
    { value: 'food_bank', label: 'Food Banks', icon: '🎁' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-gray-600 hover:text-gray-800"
            >
              ← Back
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">$</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                SaveSmart
              </span>
            </div>
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
      <div className="container mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Find Affordable Supermarkets</h1>
          <p className="text-gray-600">
            Showing {filteredLocations.length} location{filteredLocations.length !== 1 ? 's' : ''} across Malaysia
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Filters</h2>

              {/* Location Type Filter */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Location Type
                </label>
                <div className="space-y-2">
                  {locationTypes.map((type) => (
                    <label key={type.value} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.locationType.includes(type.value)}
                        onChange={() => handleLocationTypeToggle(type.value)}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700">
                        {type.icon} {type.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* City Filter */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  City
                </label>
                <select
                  value={filters.city}
                  onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                >
                  <option value="">All Cities</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              {/* Legend */}
              <div className="border-t pt-4">
                <p className="text-xs font-semibold text-gray-700 mb-2">Price Legend</p>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-xs text-gray-600">Cheapest</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span className="text-xs text-gray-600">Moderate</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-xs text-gray-600">Expensive</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-lg p-4 h-[400px] lg:h-[600px]">
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 font-medium">Loading map...</p>
                  </div>
                </div>
              ) : (
                <SupermarketMap 
                  locations={filteredLocations} 
                  onAddPrice={handleAddPrice}
                  onViewReceipt={handleViewReceipt}
                />
              )}
            </div>

            {/* Location List */}
            <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Locations</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredLocations.length > 0 ? (
                  filteredLocations.map((location) => (
                    <div
                      key={location.id || location.google_place_id}
                      className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:shadow-md transition-all"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-gray-800">{location.name}</h4>
                          <p className="text-xs text-gray-500 uppercase">
                            {formatLocationType(location.type)}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">{location.address}</p>
                        </div>
                        <span className="text-2xl">{location.type === 'supermarket' ? '🏪' : location.type === 'pasar_malam' ? '🏮' : location.type === 'food_bank' ? '🎁' : '🛒'}</span>
                      </div>
                      {location.prices && location.prices.length > 0 && (
                        <div className="mt-2 text-sm text-gray-600">
                          {location.prices.length} item{location.prices.length !== 1 ? 's' : ''} with pricing
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-8">
                    No locations found matching your filters
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Price Submission Modal */}
      {showPriceModal && selectedLocation && (
        <PriceSubmissionModal
          location={selectedLocation}
          onClose={() => setShowPriceModal(false)}
          onSuccess={handlePriceSubmitted}
        />
      )}

      {/* Receipt Viewer Modal */}
      {showReceiptViewer && selectedReceipt && (
        <ReceiptViewerModal
          receiptUrl={selectedReceipt.url}
          itemName={selectedReceipt.itemName}
          onClose={() => setShowReceiptViewer(false)}
        />
      )}
    </div>
  );
};

export default SupermarketSearchPage;
