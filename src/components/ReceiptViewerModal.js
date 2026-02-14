import { useState } from 'react';

const ReceiptViewerModal = ({ receiptUrl, itemName, onClose }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white">Receipt Image</h2>
            {itemName && (
              <p className="text-indigo-100 text-sm mt-1">{itemName}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all"
          >
            ✕
          </button>
        </div>

        {/* Image Container */}
        <div className="p-6 bg-gray-50 flex items-center justify-center min-h-[400px] max-h-[70vh] overflow-auto">
          {imageError ? (
            <div className="text-center">
              <div className="text-6xl mb-4">📷</div>
              <p className="text-gray-600 font-medium">Failed to load receipt image</p>
              <p className="text-sm text-gray-500 mt-2">The image may have been deleted or is unavailable</p>
            </div>
          ) : (
            <div className="relative">
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600"></div>
                </div>
              )}
              <img
                src={receiptUrl}
                alt="Receipt"
                className={`max-w-full max-h-[60vh] object-contain rounded-lg shadow-lg ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-100 flex justify-between items-center">
          <a
            href={receiptUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Open in new tab →
          </a>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptViewerModal;
