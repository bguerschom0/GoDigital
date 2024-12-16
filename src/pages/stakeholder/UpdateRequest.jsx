// src/pages/stakeholder/UpdateRequest.jsx
import { AdminLayout } from '@/components/layout'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Save, 
  Loader, 
  AlertCircle, 
  Calendar,
  X,
  CheckCircle
} from 'lucide-react'
import { supabase } from '@/config/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { format } from 'date-fns'
import { useAuth } from '@/context/AuthContext'

const SuccessPopup = ({ message, onClose }) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md mx-4 relative"
    >
      <div className="flex items-center space-x-4">
        <div className="bg-[#0A2647]/10 dark:bg-[#0A2647]/30 p-2 rounded-full">
          <CheckCircle className="h-6 w-6 text-[#0A2647] dark:text-[#0A2647]" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-medium text-[#0A2647] dark:text-[#0A2647]">Success</h3>
          <p className="text-[#0A2647]/70 dark:text-[#0A2647]/90">{message}</p>
        </div>
      </div>
      <div className="mt-6 flex justify-end">
        <Button
          onClick={() => {
            onClose();
            window.location.reload();
          }}
          className="bg-[#0A2647] hover:bg-[#0A2647]/90 text-white"
        >
          Close
        </Button>
      </div>
    </motion.div>
  </div>
)

const UpdateRequest = () => {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [errors, setErrors] = useState({})
  const [availableUsers, setAvailableUsers] = useState([])
  const [currentAnswerer, setCurrentAnswerer] = useState(null)

  useEffect(() => {
    fetchAvailableUsers()
  }, [])

  useEffect(() => {
    if (selectedRequest) {
      if (selectedRequest.status === 'Answered') {
        setCurrentAnswerer(selectedRequest.answered_by)
      } else {
        setCurrentAnswerer(null)
      }
    }
  }, [selectedRequest])

  const fetchAvailableUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('username, fullname')
        .eq('status', 'active')
        .order('username')

      if (error) throw error
      setAvailableUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setMessage({ type: 'error', text: 'Please enter a reference number' })
      return
    }

    setIsLoading(true)
    setSearchResults([])
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

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => {
      const newData = { ...prev, [name]: value }

      if (name === 'status') {
        if (value === 'Pending') {
          newData.response_date = ''
          newData.answered_by = ''
        }
      }

      return newData
    })

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }
  
  const [formData, setFormData] = useState({
  date_received: '',
  reference_number: '',
  sender: '',
  subject: '',
  status: '',
  response_date: '',
  answered_by: '',
  description: '',
  otherSender: '',   // Add this
  otherSubject: ''   // Add this
})

const handleUpdate = async (e) => {
  e.preventDefault()
  setIsUpdating(true)
  try {
    const updateData = {
      date_received: formData.date_received,
      reference_number: formData.reference_number,
      sender: formData.sender === 'Other' ? formData.otherSender : formData.sender,
      subject: formData.subject === 'Other' ? formData.otherSubject : formData.subject,
      status: formData.status,
      response_date: formData.status === 'Answered' ? formData.response_date : null,
      answered_by: formData.status === 'Answered' ? formData.answered_by : null,
      description: formData.description,
      updated_by: user.username,
      updated_at: new Date().toISOString()
    }

    const { error } = await supabase
      .from('stakeholder_requests')
      .update(updateData)
      .eq('id', selectedRequest.id)

    if (error) throw error

    setMessage({ type: 'success', text: 'Request updated successfully!' })
    handleSearch() // Refresh the search results
  } catch (error) {
    console.error('Error:', error)
    setMessage({ type: 'error', text: 'Error updating request. Please try again.' })
  } finally {
    setIsUpdating(false)
  }
}

  const clearMessage = () => setMessage({ type: '', text: '' })



  return (
    <AdminLayout>

  <AdminLayout>
    <div className="flex flex-col min-h-[calc(100vh-theme(spacing.16))] -mt-6 bg-white dark:bg-gray-900">
        <div className="flex-1 flex justify-center">
          <div className="w-full max-w-[90%] px-4 pb-8">
            {/* Header */}
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white pt-2 mb-4">
              Update Request
            </h1>

            {/* Search Section */}
            <Card className="overflow-visible">
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
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      placeholder="Enter Reference Number"
                      className="w-full px-4 py-2 border-2 border-[#0A2647]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] focus:border-transparent dark:bg-gray-800 dark:border-gray-700"
                    />
                    {isLoading && (
                      <Loader className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 animate-spin text-[#0A2647]" />
                    )}
                  </div>
                  <Button
                    onClick={handleSearch}
                    disabled={isLoading}
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
                              ? 'border-[#0A2647] bg-[#0A2647]/10 dark:bg-[#0A2647]/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-[#0A2647]/30 dark:hover:border-[#0A2647]/50'
                          } dark:text-white`}
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
                            <div className={`text-sm px-3 py-1 rounded-full ${
                              result.status === 'Pending'
                                ? 'bg-[#0A2647]/10 text-[#0A2647]'
                                : 'bg-green-100 text-green-800'
                            }`}>
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
                  className="mt-6"
                >
                  <Card className="overflow-visible">
                    <CardHeader>
                      <CardTitle className="text-lg font-medium">Update Request</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleUpdate} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Basic Information */}
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Date Received
                            </label>
                            <div className="relative">
                              <input
                                type="date"
                                name="date_received"
                                value={formData.date_received}
                                onChange={handleInputChange}
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
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] dark:bg-gray-800 dark:border-gray-700"
                            />
                          </div>

<div className="space-y-2">
  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
    Sender
  </label>
  <select
    name="sender"
    value={formData.sender}
    onChange={handleInputChange}
    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] dark:bg-gray-800 dark:border-gray-700 dark:text-white"
  >
    <option value="">Select Sender</option>
    <option value="NPPA">NPPA</option>
    <option value="RIB">RIB</option>
    <option value="MPG">MPG</option>
    <option value="Private Advocate">Private Advocate</option>
    <option value="Other">Other</option>
  </select>
</div>

{formData.sender === 'Other' && (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      Other Sender
    </label>
    <input
      type="text"
      name="otherSender"
      value={formData.otherSender}
      onChange={handleInputChange}
      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] dark:bg-gray-800 dark:border-gray-700 dark:text-white"
      placeholder="Specify sender"
    />
  </div>
)}

<div className="space-y-2">
  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
    Subject
  </label>
  <select
    name="subject"
    value={formData.subject}
    onChange={handleInputChange}
    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] dark:bg-gray-800 dark:border-gray-700 dark:text-white"
  >
    <option value="">Select Subject</option>
    <option value="Account Unblock">Account Unblock</option>
    <option value="MoMo Transaction">MoMo Transaction</option>
    <option value="Call History">Call History</option>
    <option value="Reversal">Reversal</option>
    <option value="MoMo Transaction & Call History">MoMo Transaction & Call History</option>
    <option value="Account Information">Account Information</option>
    <option value="Account Status">Account Status</option>
    <option value="Balance">Balance</option>
    <option value="Other">Other</option>
  </select>
</div>

{formData.subject === 'Other' && (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      Other Subject
    </label>
    <input
      type="text"
      name="otherSubject"
      value={formData.otherSubject}
      onChange={handleInputChange}
      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] dark:bg-gray-800 dark:border-gray-700 dark:text-white"
      placeholder="Specify subject"
    />
  </div>
)}
                          

                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Status
                            </label>
                            <select
                              name="status"
                              value={formData.status}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] dark:bg-gray-800 dark:border-gray-700"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Answered">Answered</option>
                            </select>
                          </div>

                          {formData.status === 'Answered' && (
                            <>
                              <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Response Date
                                </label>
                                <div className="relative">
                                  <input
                                    type="date"
                                    name="response_date"
                                    value={formData.response_date}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] dark:bg-gray-800 dark:border-gray-700"
                                  />
                                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                </div>
                              </div>

                              <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Answered By
                                </label>
                                <select
                                  name="answered_by"
                                  value={formData.answered_by}
                                  onChange={handleInputChange}
                                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] dark:bg-gray-800 dark:border-gray-700"
                                >
                                  <option value="">Select Person</option>
                                  {availableUsers.map((user) => (
                                    <option key={user.username} value={user.username}>
                                      {user.fullname} ({user.username})
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </>
                          )}

                          <div className="space-y-2 md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Description
                            </label>
                            <textarea
                              name="description"
                              value={formData.description}
                              onChange={handleInputChange}
                              rows={6}
                              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] dark:bg-gray-800 dark:border-gray-700"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end space-x-4">
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
                      </form>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Success/Error Message Popup */}
      <AnimatePresence>
        {message?.text && (
          <SuccessPopup 
            message={message.text} 
            onClose={clearMessage}
          />
        )}
      </AnimatePresence>
    </AdminLayout>
  )
}

export default UpdateRequest
