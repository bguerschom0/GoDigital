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

const statusOptions = ["Pending", "Answered"]
const answeredByOptions = ["bigirig", "isimbie", "niragit", "nkomatm", "tuyisec"]
const senderOptions = [
  "NPPA", 
  "RIB", 
  "MPG", 
  "Private Advocate", 
  "Other"
]

const subjectOptions = [
  "Account Unblock",
  "MoMo Transaction",
  "Call History",
  "Reversal",
  "MoMo Transaction & Call History",
  "Account Information",
  "Account Status",
  "Balance",
  "Other"
]

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
            window.location.reload(); // Reset page
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
  const [availableUsers, setAvailableUsers] = useState([])
  const [currentAnswerer, setCurrentAnswerer] = useState(null)
  const [availableSenders, setAvailableSenders] = useState([])
  const [availableSubjects, setAvailableSubjects] = useState([])
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

  useEffect(() => {
    fetchAvailableUsers()
    fetchAvailableSendersAndSubjects()
  }, [])

    // When a request is selected or status changes
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

  const fetchAvailableSendersAndSubjects = async () => {
    try {
      // Fetch all requests to get unique senders and subjects
      const { data: requests, error } = await supabase
        .from('stakeholder_requests')
        .select('sender, subject')

      if (error) throw error

      // Get unique senders
      const uniqueSenders = [...new Set(requests.map(req => req.sender))]
        .filter(Boolean)
        .sort()
      setAvailableSenders(['NPPA', 'RIB', 'MPG', 'Private Advocate', 'Other', ...uniqueSenders])

      // Get unique subjects
      const uniqueSubjects = [...new Set(requests.map(req => req.subject))]
        .filter(Boolean)
        .sort()
      setAvailableSubjects([
        'Account Unblock',
        'MoMo Transaction',
        'Call History',
        'Reversal',
        'Account Information',
        'Account Status',
        'Balance',
        'Other',
        ...uniqueSubjects
      ])
    } catch (error) {
      console.error('Error fetching senders and subjects:', error)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };

      // Reset related fields when certain values change
      if (name === 'sender' && value !== 'Other') {
        newData.otherSender = '';
      }
      if (name === 'subject' && value !== 'Other') {
        newData.otherSubject = '';
      }
      if (name === 'status' && value !== 'Answered') {
        newData.responseDate = '';
        newData.answeredBy = '';
      }

           // Handle status change
      if (name === 'status') {
        if (value === 'Pending') {
          newData.answeredBy = '';
          newData.responseDate = '';
        }
        // If changing from Pending to Answered, keep answeredBy empty to force selection
        if (value === 'Answered' && prev.status === 'Pending') {
          newData.answeredBy = '';
        }
      }

      return newData;
    });

    // Clear any errors for the changed field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // For date picker changes
  const handleDateChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  


  

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

  const handleUpdate = async (e) => {
    e.preventDefault()
    setIsUpdating(true)
    try {
      const updateData = {
        ...formData,
        sender: formData.sender === 'Other' ? formData.otherSender : formData.sender,
        subject: formData.subject === 'Other' ? formData.otherSubject : formData.subject,
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

   // Render the answeredBy select based on conditions
  const renderAnsweredBySelect = () => {
    if (formData.status !== 'Answered') {
      return null;
    }

  const clearMessage = () => setMessage({ type: '', text: '' })

  return (
    <AdminLayout>
      <div className="flex flex-col min-h-[calc(100vh-theme(spacing.16))] -mt-6">
        <div className="flex-1 flex justify-center">
          <div className="w-full max-w-[90%] px-4 pb-8">
            {/* Header */}
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white pt-2 mb-4">
              Update Request
            </h1>

            {/* Content */}
            <div className="space-y-6">
              {/* Search Card */}
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
                                ? 'border-[#0A2647] bg-[#0A2647]/10'
                                : 'border-gray-200 hover:border-[#0A2647]/30'
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
<div className={`text-sm px-3 py-1 rounded-full ${
  result.status === 'Pending'
    ? 'bg-[#0A2647]/10 text-[#0A2647]'
    : 'bg-[#0A2647]/10 text-[#0A2647]'
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
                    className="mb-8"
                  >
                    <Card className="overflow-visible">
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
                                value={formData.reference_number}
                                onChange={(e) => setFormData(prev => ({ ...prev, reference_number: e.target.value }))}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] dark:bg-gray-800 dark:border-gray-700"
                              />
                            </div>

    <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      Sender
    </label>
    <select
      name="sender"
      value={formData.sender}
      onChange={handleInputChange}
      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] dark:bg-gray-800 dark:border-gray-700"
    >
      <option value="">Select Sender</option>
      {availableSenders.map((sender) => (
        <option key={sender} value={sender}>{sender}</option>
      ))}
    </select>
  </div>

{formData.sender === 'Other' && (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      Other Sender
    </label>
    <input
      type="text"
      value={formData.otherSender || ''}
      onChange={(e) => setFormData(prev => ({ ...prev, otherSender: e.target.value }))}
      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] dark:bg-gray-800 dark:border-gray-700"
      placeholder="Specify sender"
    />
  </div>
)}

<div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      Subject
    </label>
    <select
      name="subject"
      value={formData.subject}
      onChange={handleInputChange}
      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] dark:bg-gray-800 dark:border-gray-700"
    >
      <option value="">Select Subject</option>
      {availableSubjects.map((subject) => (
        <option key={subject} value={subject}>{subject}</option>
      ))}
    </select>
  </div>

{formData.subject === 'Other' && (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      Other Subject
    </label>
    <input
      type="text"
      value={formData.otherSubject || ''}
      onChange={(e) => setFormData(prev => ({ ...prev, otherSubject: e.target.value }))}
      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] dark:bg-gray-800 dark:border-gray-700"
      placeholder="Specify subject"
    />
  </div>
)}

                            <div className="space-y-2">
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Status
                              </label>
                              <select
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
                                  value={formData.response_date}
                                  onChange={(e) => setFormData(prev => ({ ...prev, response_date: e.target.value }))}
                                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] dark:bg-gray-800 dark:border-gray-700"
                                />
                                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                              </div>
                            </div>




    <div className="space-y-2">

        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Answered By
        </label>
        <select
          name="answeredBy"
          value={formData.answeredBy}
          onChange={handleInputChange}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] dark:bg-gray-800 dark:border-gray-700"
        >
          <option value="">Select Person</option>
          {/* If there's a current answerer, show it first */}
          {currentAnswerer && (
            <option key={currentAnswerer} value={currentAnswerer}>
              {currentAnswerer} (Current)
            </option>
          )}
          {/* Show all available users */}
          {availableUsers.map((user) => (
            user.username !== currentAnswerer && (
              <option key={user.username} value={user.username}>
                {user.fullname} ({user.username})
              </option>
            )
          ))}
        </select>
        {errors.answeredBy && (
          <p className="mt-1 text-sm text-red-500">{errors.answeredBy}</p>
        )}
      </div>


                            <div className="space-y-2 md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Description
                              </label>
                              <textarea
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
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
  );
}
}

export default UpdateRequest
