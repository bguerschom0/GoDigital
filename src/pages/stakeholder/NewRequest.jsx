// src/pages/stakeholder/NewRequest.jsx
import { AdminLayout } from '@/components/layout'
import { useState,useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calendar,
  FileText,
  Check,
  Save,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { supabase } from '@/config/supabase'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
import { useAuth } from '@/context/AuthContext'

const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

const NewRequest = () => {
  const [availableUsers, setAvailableUsers] = useState([])
  const { user } = useAuth()
  const [currentSection, setCurrentSection] = useState(0)
const [formData, setFormData] = useState({
  dateReceived: '',
  referenceNumber: '',
  sender: '',
  otherSender: '',
  subject: '',
  otherSubject: '',
  status: 'Pending',
  responseDate: '',
  answeredBy: '',
  description: ''
})
  
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })


  useEffect(() => {
    fetchAvailableUsers()
  }, [])

  // Add this function with your other functions
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
  
  

  const sections = [
    {
      title: 'Basic Information',
      description: 'Reference and date details',
      fields: () => (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Date Received
            </label>
            <div className="relative">
              <DatePicker
                selected={formData.dateReceived ? new Date(formData.dateReceived) : null}
                onChange={(date) => handleDateChange('dateReceived', date)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647]"
                dateFormat="yyyy-MM-dd"
                placeholderText="Select date"
                maxDate={new Date()}
              />
            </div>
            {errors.dateReceived && (
              <p className="mt-1 text-sm text-red-500">{errors.dateReceived}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Reference Number
            </label>
            <input
              type="text"
              name="referenceNumber"
              value={formData.referenceNumber}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647]"
            />
            {errors.referenceNumber && (
              <p className="mt-1 text-sm text-red-500">{errors.referenceNumber}</p>
            )}
          </div>
        </div>
      )
    },
    {
      title: 'Request Details',
      description: 'Sender and subject information',
      fields: () => (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Sender
            </label>
            <select
              name="sender"
              value={formData.sender}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647]"
            >
              <option value="">Select Sender</option>
              <option value="NPPA">NPPA</option>
              <option value="RIB">RIB</option>
              <option value="MPG">MPG</option>
              <option value="Private Advocate">Private Advocate</option>
              <option value="Other">Other</option>
            </select>
            {errors.sender && (
              <p className="mt-1 text-sm text-red-500">{errors.sender}</p>
            )}
          </div>

          {formData.sender === 'Other' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Other Sender
              </label>
              <input
                type="text"
                name="otherSender"
                value={formData.otherSender}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647]"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Subject
            </label>
            <select
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647]"
            >
              <option value="">Select Subject</option>
              <option value="Account Unblock">Account Unblock</option>
              <option value="Account Block">Account Block</option>
              <option value="MoMo Transaction & Account Block">MoMo Transaction & Account Block</option>
              <option value="MoMo Transaction & Account Unblock">MoMo Transaction & Account Unblock</option>
              <option value="MoMo Transaction">MoMo Transaction</option>
              <option value="Call History">Call History</option>
              <option value="Call History & MoMo Transaction">Call History & MoMo Transaction</option>
              <option value="Reversal">Reversal</option>
              <option value="Reversal & Account Unblock">Reversal & Account Unblock</option>
              <option value="Account Information">Account Information</option>
              <option value="Account Information & MoMo Transaction">Account Information & MoMo Transaction</option>
              <option value="Account Status">Account Status</option>
              <option value="Sim Registration Information">Sim Registration Information</option>
              <option value="Sim Swap Information">Sim Swap Information</option>
              <option value="Sim Card Information">Sim Card Information</option>
              <option value="Balance">Balance</option>
              <option value="Other">Other</option>
            </select>
            {errors.subject && (
              <p className="mt-1 text-sm text-red-500">{errors.subject}</p>
            )}
          </div>

          {formData.subject === 'Other' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Other Subject
              </label>
              <input
                type="text"
                name="otherSubject"
                value={formData.otherSubject}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647]"
              />
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Description',
      description: 'Detailed request information',
      fields: () => (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={6}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647]"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-500">{errors.description}</p>
          )}
        </div>
      )
    },
{
  title: 'Response',
  description: 'Status and response details',
  fields: () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Status
        </label>
        <select
          name="status"
          value={formData.status}
          onChange={handleInputChange}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647]"
        >
          <option value="Pending">Pending</option>
          <option value="Answered">Answered</option>
        </select>
      </div>

      {formData.status === 'Answered' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Response Date
            </label>
            <div className="relative">
              <DatePicker
                selected={formData.responseDate ? new Date(formData.responseDate) : null}
                onChange={(date) => handleDateChange('responseDate', date)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647]"
                dateFormat="yyyy-MM-dd"
                placeholderText="Select response date"
                maxDate={new Date()}
                minDate={formData.dateReceived ? new Date(formData.dateReceived) : null}
              />
            </div>
            {errors.responseDate && (
              <p className="mt-1 text-sm text-red-500">{errors.responseDate}</p>
            )}
          </div>

       <div>
  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
    Answered By
  </label>
  <select
    name="answeredBy"
    value={formData.answeredBy}
    onChange={handleInputChange}
    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647]"
  >
    <option value="">Select Person</option>
    {availableUsers.map((user) => (
      <option key={user.username} value={user.username}>
        {user.fullname}
      </option>
    ))}
  </select>
  {errors.answeredBy && (
    <p className="mt-1 text-sm text-red-500">{errors.answeredBy}</p>
  )}
</div>
        </>
      )}
    </div>
  )
}
  ]


  

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleDateChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: formatDate(value) }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateSection = (section) => {
    const newErrors = {}

    if (section === 0) {
      if (!formData.dateReceived) newErrors.dateReceived = 'Date is required'
      if (!formData.referenceNumber) newErrors.referenceNumber = 'Reference number is required'
    } else if (section === 1) {
      if (!formData.sender) newErrors.sender = 'Sender is required'
      if (formData.sender === 'Other' && !formData.otherSender) {
        newErrors.otherSender = 'Please specify the sender'
      }
      if (!formData.subject) newErrors.subject = 'Subject is required'
      if (formData.subject === 'Other' && !formData.otherSubject) {
        newErrors.otherSubject = 'Please specify the subject'
      }
    } else if (section === 2) {
      if (!formData.description) newErrors.description = 'Description is required'
    }

  else if (section === 3) { // Response section
    if (formData.status === 'Answered') {
      if (!formData.responseDate) newErrors.responseDate = 'Response date is required'
      if (!formData.answeredBy) newErrors.answeredBy = 'Please select who answered'
    }
  }

  setErrors(newErrors)
  return Object.keys(newErrors).length === 0
}

const handleSubmit = async () => {
  if (!validateSection(currentSection)) return

  if (currentSection < sections.length - 1) {
    setCurrentSection(prev => prev + 1)
    return
  }

  setIsLoading(true)
  try {
    if (!user) {
      throw new Error('No user found. Please login again.')
    }

    const requestData = {
      date_received: formData.dateReceived,
      reference_number: formData.referenceNumber,
      sender: formData.sender === 'Other' ? formData.otherSender : formData.sender,
      subject: formData.subject === 'Other' ? formData.otherSubject : formData.subject,
      status: formData.status,
      response_date: formData.responseDate || null,
      answered_by: formData.answeredBy || null,
      description: formData.description,
      created_by: user.username,
      created_at: new Date().toISOString()
    }

    const { error } = await supabase
      .from('stakeholder_requests')
      .insert([requestData])

    if (error) throw error

    setMessage({ type: 'success', text: 'Request saved successfully!' })
    handleReset()
  } catch (error) {
    console.error('Error:', error)
    setMessage({ type: 'error', text: error.message || 'Error saving request. Please try again.' })
  } finally {
    setIsLoading(false)
  }
}

const handleReset = () => {
  setFormData({
    dateReceived: '',
    referenceNumber: '',
    sender: '',
    otherSender: '',
    subject: '',
    otherSubject: '',
    status: 'Pending',
    responseDate: '',
    answeredBy: '',
    description: ''
  })
  setCurrentSection(0)
  setErrors({})
}

return (
  <AdminLayout>
    <div className="flex justify-center -mt-6">
      <div className="w-full max-w-4xl px-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white pt-2 mb-6">
          New Request
        </h1>

        {/* Mobile view: Stack timeline and form */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Timeline - Hide on small screens */}
          <div className="hidden lg:block relative">
            <div className="absolute top-0 bottom-0 left-4 w-0.5 bg-gray-200 dark:bg-gray-700" />
            {sections.map((section, index) => (
              <div key={index} className="relative mb-8">
                <div className={`
                  absolute left-0 w-8 h-8 rounded-full flex items-center justify-center
                  ${index <= currentSection 
                    ? 'bg-[#0A2647] text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}
                `}>
                  {index < currentSection ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <div className="ml-12 pt-1">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {section.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {section.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Progress Indicator */}
          <div className="lg:hidden mb-6">
            <div className="flex items-center justify-between px-2">
              {sections.map((section, index) => (
                <div 
                  key={index} 
                  className={`flex flex-col items-center ${
                    index === currentSection 
                      ? 'text-[#0A2647] dark:text-white' 
                      : 'text-gray-400 dark:text-gray-500'
                  }`}
                >
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center mb-2
                    ${index <= currentSection 
                      ? 'bg-[#0A2647] text-white' 
                      : 'bg-gray-200 dark:bg-gray-700'}
                  `}>
                    {index < currentSection ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  <span className="text-xs text-center">{section.title}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Form Content */}
          <div className="flex-1">
            <Card className="p-4 lg:p-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              {sections[currentSection].fields()}

              <div className="mt-6 flex flex-col sm:flex-row justify-between gap-4">
                <Button
                  type="button"
                  onClick={handleReset}
                  variant="outline"
                  className="text-[#0A2647] dark:text-white border-[#0A2647] dark:border-white"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reset
                </Button>

                <div className="flex flex-col sm:flex-row gap-2">
                  {currentSection > 0 && (
                    <Button
                      type="button"
                      onClick={() => setCurrentSection(prev => prev - 1)}
                      variant="outline"
                      className="text-[#0A2647] dark:text-white border-[#0A2647] dark:border-white"
                    >
                      <ChevronUp className="w-4 h-4 mr-2" />
                      Previous
                    </Button>
                  )}
                  <Button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="bg-[#0A2647] hover:bg-[#0A2647]/90 text-white"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : currentSection === sections.length - 1 ? (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Submit
                      </>
                    ) : (
                      <>
                        Next
                        <ChevronDown className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>

{/* Success/Error Message */}
<AnimatePresence>
  {message.text && (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={`
          mx-4 p-6 rounded-lg shadow-xl max-w-md w-full
          ${message.type === 'success' 
            ? 'bg-white text-[#0A2647]' 
            : 'bg-white text-red-600'
          }
        `}
      >
        <div className="flex items-center space-x-4">
          <div className={`
            p-2 rounded-full 
            ${message.type === 'success' 
              ? 'bg-[#0A2647]/10 text-[#0A2647]' 
              : 'bg-red-100 text-red-600'
            }
          `}>
            {message.type === 'success' ? (
              <Check className="w-6 h-6" />
            ) : (
              <AlertCircle className="w-6 h-6" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-medium">
              {message.type === 'success' ? 'Success' : 'Error'}
            </h3>
            <p className="text-gray-600">
              {message.text}
            </p>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <Button
            onClick={() => setMessage({ type: '', text: '' })}
            className="bg-[#0A2647] hover:bg-[#0A2647]/90 text-white"
          >
            Close
          </Button>
        </div>
      </motion.div>
    </div>
  )}
</AnimatePresence>
  </AdminLayout>
)
}

export default NewRequest
