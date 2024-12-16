// src/pages/stakeholder/NewRequest.jsx
import { AdminLayout } from '@/components/layout'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calendar,
  FileText,
  CheckCircle,
  Save,
  ChevronDown,
  ChevronUp,
  RefreshCw 
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { supabase } from '@/config/supabase'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"

const NewRequest = () => {
  const [currentSection, setCurrentSection] = useState(0)
  const [formData, setFormData] = useState({
    dateReceived: '',
    referenceNumber: '',
    sender: '',
    otherSender: '',
    subject: '',
    otherSubject: '',
    status: 'Pending',
    description: ''
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  const sections = [
    {
      title: 'Basic Information',
      description: 'Reference and date details',
      fields: (
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
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
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
      fields: (
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
              <option value="MoMo Transaction">MoMo Transaction</option>
              <option value="Call History">Call History</option>
              <option value="Reversal">Reversal</option>
              <option value="Account Information">Account Information</option>
              <option value="Account Status">Account Status</option>
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
      fields: (
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
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateSection = (section) => {
    const newErrors = {}
    const currentFields = sections[section].fields.props.children

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
      const requestData = {
        ...formData,
        sender: formData.sender === 'Other' ? formData.otherSender : formData.sender,
        subject: formData.subject === 'Other' ? formData.otherSubject : formData.subject,
        created_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('stakeholder_requests')
        .insert([requestData])

      if (error) throw error

      setMessage({ type: 'success', text: 'Request saved successfully!' })
      handleReset()
    } catch (error) {
      setMessage({ type: 'error', text: 'Error saving request. Please try again.' })
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

          <div className="flex gap-8">
            {/* Timeline */}
            <div className="relative">
              <div className="absolute top-0 bottom-0 left-4 w-0.5 bg-gray-200" />
              {sections.map((section, index) => (
                <div key={index} className="relative mb-8">
                  <div className={`
                    absolute left-0 w-8 h-8 rounded-full flex items-center justify-center
                    ${index <= currentSection ? 'bg-[#0A2647] text-white' : 'bg-gray-200 text-gray-500'}
                  `}>
                    {index < currentSection ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  <div className="ml-12 pt-1">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {section.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {section.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Form Content */}
            <div className="flex-1">
              <Card className="p-6">
                {sections[currentSection].fields}

                <div className="mt-6 flex justify-between">
                  <Button
                    type="button"
                    onClick={handleReset}
                    variant="outline"
                    className="text-[#0A2647] border-[#0A2647]"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>

                  <div className="space-x-2">
                    {currentSection > 0 && (
                      <Button
                        type="button"
                        onClick={() => setCurrentSection(prev => prev - 1)}
                        variant="outline"
                        className="text-[#0A2647] border-[#0A2647]"
                      >
                        <ChevronUp className="w-4 h-4 mr-2" />
                        Previous
                      </Button>
                    )}
                    <Button
                      onClick={handleSubmit}
                      disabled={isLoading}
                      className="bg-[#0A2647] hover:bg-[#0A2647]/90"
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
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg ${
              message.type === 'success' 
                ? 'bg-[#0A2647] text-white' 
                : 'bg-red-500 text-white'
            }`}
          >
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  )
}

export default NewRequest
