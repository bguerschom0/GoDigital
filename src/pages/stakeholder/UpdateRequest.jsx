// src/pages/stakeholder/UpdateRequest.jsx
import { AdminLayout } from '@/components/layout'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Save, Loader, AlertCircle, Calendar } from 'lucide-react'
import { supabase } from '@/config/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { format } from 'date-fns'

const statusOptions = ["Pending", "Answered"]
const answeredByOptions = ["bigirig", "isimbie", "niragit", "nkomatm", "tuyisec"]

const SuccessPopup = ({ message }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 50 }}
    className="fixed bottom-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2"
  >
    <AlertCircle className="h-5 w-5" />
    <p>{message}</p>
  </motion.div>
)

const UpdateRequest = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [formData, setFormData] = useState({
    date_received: '',
    reference_number: '',
    sender: '',
    subject: '',
    status: '',
    response_date: '',
    answered_by: '',
    description: ''
  })

  const handleSearch = async () => {
    if (!searchTerm) return

    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('stakeholder_requests')
        .select('*')
        .ilike('reference_number', `%${searchTerm}%`)
        .order('date_received', { ascending: false })

      if (error) throw error

      setSearchResults(data)
      if (data.length === 0) {
        setMessage({ type: 'info', text: 'No requests found' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error searching requests' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelect = (request) => {
    setSelectedRequest(request)
    setFormData({
      date_received: request.date_received,
      reference_number: request.reference_number,
      sender: request.sender,
      subject: request.subject,
      status: request.status,
      response_date: request.response_date || '',
      answered_by: request.answered_by || '',
      description: request.description
    })
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    setIsUpdating(true)
    try {
      const { error } = await supabase
        .from('stakeholder_requests')
        .update(formData)
        .eq('id', selectedRequest.id)

      if (error) throw error

      setMessage({ type: 'success', text: 'Request updated successfully' })
      handleSearch() // Refresh the search results
    } catch (error) {
      setMessage({ type: 'error', text: 'Error updating request' })
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <AdminLayout>
      <div className="flex justify-center -mt-6">
        <div className="w-full max-w-[90%] px-4">
          {/* Header */}
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white pt-2 mb-4">
            Update Request
          </h1>

          {/* Search Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg font-medium">Search Request</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-4">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Enter Reference Number"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
                  />
                  {isLoading && (
                    <Loader className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 animate-spin text-blue-500" />
                  )}
                </div>
                <Button
                  onClick={handleSearch}
                  className="bg-[#0A2647] hover:bg-[#0A2647]/90 text-white"
                >
                  <Search className="h-5 w-5 mr-2" />
                  Search
                </Button>
              </div>

              {/* Search Results */}
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
                              ? 'border-[#0A2647] bg-[#0A2647]/10'
                              : 'border-gray-200 hover:border-[#0A2647]/30'}
                        }`}
                        onClick={() => handleSelect(result)}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                              {result.reference_number}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {format(new Date(result.date_received), 'MMM d, yyyy')}
                            </p>
                          </div>
                          <div className="text-sm text-blue-600 dark:text-blue-400">
                            {result.status}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* Update Form */}
          <AnimatePresence>
            {selectedRequest && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-medium">Update Request</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleUpdate} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      Date Received
    </label>
    <div className="relative">
      <input
        type="date"
        name="date_received"
        value={formData.date_received}
        onChange={(e) => setFormData(prev => ({ ...prev, date_received: e.target.value }))}
        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] dark:bg-gray-800 dark:border-gray-700"
      />
      <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
    </div>
  </div>

  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      Reference Number
    </label>
    <input
      type="text"
      name="reference_number"
      value={formData.reference_number}
      onChange={(e) => setFormData(prev => ({ ...prev, reference_number: e.target.value }))}
      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] dark:bg-gray-800 dark:border-gray-700"
    />
  </div>

  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      Status
    </label>
    <select
      name="status"
      value={formData.status}
      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] dark:bg-gray-800 dark:border-gray-700"
    >
      {statusOptions.map(option => (
        <option key={option} value={option}>{option}</option>
      ))}
    </select>
  </div>

  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      Response Date
    </label>
    <div className="relative">
      <input
        type="date"
        name="response_date"
        value={formData.response_date}
        onChange={(e) => setFormData(prev => ({ ...prev, response_date: e.target.value }))}
        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] dark:bg-gray-800 dark:border-gray-700"
      />
      <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
    </div>
  </div>

  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      Sender
    </label>
    <input
      type="text"
      name="sender"
      value={formData.sender}
      onChange={(e) => setFormData(prev => ({ ...prev, sender: e.target.value }))}
      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] dark:bg-gray-800 dark:border-gray-700"
      readOnly
    />
  </div>

  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      Answered By
    </label>
    <select
      name="answered_by"
      value={formData.answered_by}
      onChange={(e) => setFormData(prev => ({ ...prev, answered_by: e.target.value }))}
      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] dark:bg-gray-800 dark:border-gray-700"
    >
      <option value="">Select Person</option>
      {answeredByOptions.map(option => (
        <option key={option} value={option}>{option}</option>
      ))}
    </select>
  </div>

  <div className="space-y-2 md:col-span-2">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      Description
    </label>
    <textarea
      name="description"
      value={formData.description}
      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
      rows={6}
      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] dark:bg-gray-800 dark:border-gray-700"
    />
  </div>

  <div className="md:col-span-2 flex justify-end space-x-4">
    <Button
      type="button"
      onClick={() => setSelectedRequest(null)}
      variant="outline"
      className="border-[#0A2647] text-[#0A2647] hover:bg-[#0A2647]/10"
    >
      Cancel
    </Button>
    <Button
      type="submit"
      disabled={isUpdating}
      className="bg-[#0A2647] hover:bg-[#0A2647]/90 text-white"
    >
      {isUpdating ? (
        <>
          <Loader className="w-4 h-4 mr-2 animate-spin" />
          Updating...
        </>
      ) : (
        <>
          <Save className="w-4 h-4 mr-2" />
          Update Request
        </>
      )}
    </Button>
  </div>
</div>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {message?.text && (
          <SuccessPopup message={message.text} />
        )}
      </AnimatePresence>
    </AdminLayout>
  )
}

export default UpdateRequest
