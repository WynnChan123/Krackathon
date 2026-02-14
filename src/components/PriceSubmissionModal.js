import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { submitPrice, uploadReceipt } from '../services/priceService';
import { fetchItems } from '../services/locationService';

const PriceSubmissionModal = ({ location, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    item_id: '',
    price: '',
    date: new Date().toISOString().split('T')[0],
    receipt: null,
  });
  const [receiptPreview, setReceiptPreview] = useState(null);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    const itemsData = await fetchItems();
    setItems(itemsData);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      
      setFormData({ ...formData, receipt: file });
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setReceiptPreview(previewUrl);
    }
  };

  const handleRemoveReceipt = () => {
    setFormData({ ...formData, receipt: null });
    if (receiptPreview) {
      URL.revokeObjectURL(receiptPreview);
      setReceiptPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate
      if (!formData.item_id || !formData.price) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }

      let receiptUrl = null;

      // Upload receipt if provided
      if (formData.receipt) {
        try {
          receiptUrl = await uploadReceipt(formData.receipt);
        } catch (err) {
          console.error('Receipt upload failed:', err);
          setError(`Receipt upload failed: ${err.message}. Please check if Supabase Storage bucket 'receipts' exists.`);
          setLoading(false);
          return;
        }
      }

      // Submit price
      const selectedItem = items.find(item => item.id === formData.item_id);
      const result = await submitPrice({
        item_id: formData.item_id,
        location_id: location.id,
        price: formData.price,
        date: formData.date,
        receipt_image_url: receiptUrl,
        location_name: location.name,
        item_name: selectedItem?.name || 'Unknown Item',
      });

      if (result.success) {
        setSuccess(true);
        
        // Clean up preview URL
        if (receiptPreview) {
          URL.revokeObjectURL(receiptPreview);
        }
        
        setTimeout(() => {
          onSuccess && onSuccess();
          onClose();
        }, 1500);
      } else {
        setError(result.error || 'Failed to submit price');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Submission error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">Add Price</h2>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all"
            >
              ✕
            </button>
          </div>
          <p className="text-indigo-100 mt-2 text-sm">
            Help the community by sharing prices you've seen
          </p>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Location Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">Location</p>
            <p className="font-semibold text-gray-800">{location.name}</p>
            <p className="text-sm text-gray-600">{location.address}</p>
          </div>

          {/* Item Selection */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Item <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.item_id}
              onChange={(e) => setFormData({ ...formData, item_id: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            >
              <option value="">Select an item...</option>
              {items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} {item.brand ? `(${item.brand})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Price Input */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Price (RM) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="0.00"
              required
            />
          </div>

          {/* Date Input */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Date Seen
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Receipt Upload */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Receipt Photo (Optional)
            </label>
            
            {!receiptPreview ? (
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              />
            ) : (
              <div className="space-y-2">
                <div className="relative border-2 border-indigo-200 rounded-lg p-2">
                  <img 
                    src={receiptPreview} 
                    alt="Receipt preview" 
                    className="w-full h-48 object-contain rounded"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveReceipt}
                    className="absolute top-4 right-4 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-all shadow-lg"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  {formData.receipt.name} ({(formData.receipt.size / 1024).toFixed(1)} KB)
                </p>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-600 font-medium">
                ✓ Price submitted successfully!
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || success}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {loading ? 'Submitting...' : success ? 'Submitted!' : 'Submit Price'}
          </button>

          <p className="text-xs text-gray-500 text-center mt-3">
            Your submission will be reviewed before appearing on the map
          </p>
        </form>
      </div>
    </div>
  );
};

export default PriceSubmissionModal;
