import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { getMarkerColor, getLocationIcon, formatLocationType, getAveragePrice, getPriceCategory } from '../services/locationService';
import { getPriceFreshness, getFreshnessColor, formatDaysAgo } from '../services/priceService';

// Fix for default marker icon issue in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const SupermarketMap = ({ locations, center = [3.139, 101.687], zoom = 12, onAddPrice, onViewReceipt }) => {
  // Calculate price range for color coding
  const allPrices = locations.flatMap(loc => 
    (loc.prices || []).map(p => parseFloat(p.price))
  ).filter(p => !isNaN(p));
  
  const minPrice = allPrices.length > 0 ? Math.min(...allPrices) : 0;
  const maxPrice = allPrices.length > 0 ? Math.max(...allPrices) : 100;

  // Create custom marker icon
  const createCustomIcon = (location) => {
    const avgPrice = getAveragePrice(location.prices);
    const category = avgPrice ? getPriceCategory(avgPrice, minPrice, maxPrice) : 'medium';
    const color = getMarkerColor(category);
    const emoji = getLocationIcon(location.type);

    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          background-color: ${color};
          width: 40px;
          height: 40px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <span style="
            transform: rotate(45deg);
            font-size: 20px;
          ">${emoji}</span>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40],
    });
  };

  // Get most recent price date for freshness indicator
  const getMostRecentPriceDate = (prices) => {
    if (!prices || prices.length === 0) return null;
    const dates = prices.map(p => new Date(p.date));
    return new Date(Math.max(...dates)).toISOString().split('T')[0];
  };

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: '100%', width: '100%', borderRadius: '12px' }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {locations.map((location) => {
        const recentDate = getMostRecentPriceDate(location.prices);
        const freshness = getPriceFreshness(recentDate);
        const freshnessColor = getFreshnessColor(freshness);

        return (
          <Marker
            key={location.id || location.google_place_id}
            position={[location.lat, location.lng]}
            icon={createCustomIcon(location)}
          >
            <Popup maxWidth={320} className="custom-popup">
              <div className="p-2">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">{location.name}</h3>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      {formatLocationType(location.type)}
                    </p>
                  </div>
                  <span className="text-2xl">{getLocationIcon(location.type)}</span>
                </div>

                <div className="mb-3">
                  <p className="text-sm text-gray-600">{location.address}</p>
                  <p className="text-xs text-gray-500">{location.city}, {location.state}</p>
                </div>

                {location.prices && location.prices.length > 0 ? (
                  <div className="border-t pt-2 mb-3">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-xs font-semibold text-gray-700">Recent Prices:</p>
                      <p className={`text-xs ${freshnessColor}`}>
                        {formatDaysAgo(recentDate)}
                      </p>
                    </div>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {location.prices.slice(0, 5).map((price) => (
                        <div key={price.id} className="space-y-1">
                          <div className="flex justify-between text-sm items-center">
                            <span className="text-gray-700 flex-1">
                              {price.items?.name || 'Unknown Item'}
                              {price.items?.brand && ` (${price.items.brand})`}
                            </span>
                            <span className="font-semibold text-indigo-600 ml-2">
                              RM {parseFloat(price.price).toFixed(2)}
                            </span>
                          </div>
                          {price.receipt_url && onViewReceipt && (
                            <button
                              onClick={() => onViewReceipt(price.receipt_url, price.items?.name)}
                              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                            >
                              📷 View Receipt
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    {location.prices.length > 5 && (
                      <p className="text-xs text-gray-500 mt-1">
                        +{location.prices.length - 5} more items
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 italic mb-3">No pricing data available</p>
                )}

                {/* Add Price Button */}
                {onAddPrice && (
                  <button
                    onClick={() => onAddPrice(location)}
                    className="w-full py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold rounded-lg hover:shadow-lg transition-all duration-200"
                  >
                    + Add Price
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default SupermarketMap;

