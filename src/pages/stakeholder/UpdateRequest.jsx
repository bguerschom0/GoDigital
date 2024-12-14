// src/pages/stakeholder/UpdateRequest.jsx
import { AdminLayout } from '@/components/layout'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Save, Loader, AlertCircle, Calendar } from 'lucide-react'
import { supabase } from '@/config/supabase'

const UpdateRequest = () => {
    const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    dateReceived: '',
    referenceNumber: '',
    sender: '',
    subject: '',
    status: '',
    responseDate: '',
    answeredBy: '',
    description: ''
  });

  const handleSearch = async () => {
    if (!searchTerm) return;

    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const q = query(
        collection(db, 'stakeholder_requests'),
        where('referenceNumber', '>=', searchTerm),
        where('referenceNumber', '<=', searchTerm + '\uf8ff')
      );

      const querySnapshot = await getDocs(q);
      const results = [];
      querySnapshot.forEach((doc) => {
        results.push({ id: doc.id, ...doc.data() });
      });

      setSearchResults(results);
      if (results.length === 0) {
        setMessage({ type: 'info', text: 'No requests found' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error searching requests' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectRequest = (request) => {
    setSelectedRequest(request);
    setFormData(request);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setMessage({ type: '', text: '' });

    try {
      const docRef = doc(db, 'stakeholder_requests', selectedRequest.id);
      await updateDoc(docRef, formData);
      
      setMessage({ type: 'success', text: 'Request updated successfully' });
      handleSearch();
    } catch (error) {
      setMessage({ type: 'error', text: 'Error updating request' });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <AdminLayout>
       <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Search Request</h2>
        <div className="flex space-x-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Enter Reference Number"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {isLoading && (
              <motion.div 
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Loader className="h-5 w-5 text-emerald-500" />
              </motion.div>
            )}
          </div>
          <button
            onClick={handleSearch}
            className="px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 
                     transition-colors flex items-center space-x-2"
          >
            <Search className="h-5 w-5" />
            <span>Search</span>
          </button>
        </div>

        <AnimatePresence>
          {searchResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 space-y-2"
            >
              {searchResults.map((result) => (
                <motion.div
                  key={result.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedRequest?.id === result.id
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 hover:border-emerald-300'
                  }`}
                  onClick={() => handleSelectRequest(result)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-800">{result.referenceNumber}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(result.dateReceived).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-sm text-emerald-600">
                      {result.status}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {selectedRequest && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Update Request</h2>
            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Date Received</label>
                  <div className="relative">
                    <input
                      type="date"
                      name="dateReceived"
                      value={formData.dateReceived}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Reference Number</label>
                  <input
                    type="text"
                    name="referenceNumber"
                    value={formData.referenceNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {statusOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Response Date</label>
                  <div className="relative">
                    <input
                      type="date"
                      name="responseDate"
                      value={formData.responseDate}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Answered By</label>
                  <select
                    name="answeredBy"
                    value={formData.answeredBy}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Select Person</option>
                    {answeredByOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2 md:col-span-2">
<label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className={`px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 
                            transition-colors flex items-center space-x-2 ${
                              isUpdating ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                >
                  <Save className="h-5 w-5" />
                  <span>{isUpdating ? 'Updating...' : 'Update Request'}</span>
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {message.text && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg ${
              message.type === 'success' ? 'bg-emerald-50' : 'bg-red-50'
            }`}
          >
            <div className="flex items-center space-x-2">
              <AlertCircle className={`h-5 w-5 ${
                message.type === 'success' ? 'text-emerald-500' : 'text-red-500'
              }`} />
              <span className={message.type === 'success' ? 'text-emerald-700' : 'text-red-700'}>
                {message.text}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
          </AdminLayout>
  );
};

export default UpdateRequest
