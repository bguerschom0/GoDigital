import { AdminLayout } from '@/components/layout'
import { useState, useEffect } from 'react'
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
import { usePageAccess } from '@/hooks/usePageAccess'
import { useNavigate } from 'react-router-dom'

const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

const NewRequest = () => {
  const [availableUsers, setAvailableUsers] = useState([])
  const [senderOptions, setSenderOptions] = useState([])
  const [subjectOptions, setSubjectOptions] = useState([])
  const { user } = useAuth()
  const navigate = useNavigate()
  const { checkPermission } = usePageAccess()
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
    const checkAccess = async () => {
      const permission = await checkPermission('/stakeholder/new')
      if (!permission.canAccess) {
        navigate('/admin/dashboard')
      }
    }
    checkAccess()
  }, [])

  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    try {
      // Fetch users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('username, fullname')
        .eq('status', 'active')
        .order('username')

      if (userError) throw userError
      setAvailableUsers(userData || [])

      // Fetch sender options
      const { data: senderData, error: senderError } = await supabase
        .from('sender_options')
        .select('value, label')
        .order('value')

      if (senderError) throw senderError
      setSenderOptions(senderData || [])

      // Fetch subject options
      const { data: subjectData, error: subjectError } = await supabase
        .from('subject_options')
        .select('value, label')
        .order('value')

      if (subjectError) throw subjectError
      setSubjectOptions(subjectData || [])
    } catch (error) {
      console.error('Error fetching initial data:', error)
      setMessage({ type: 'error', text: 'Error loading form data. Please try again.' })
    }
  }

  // ... (keep existing handleInputChange and handleDateChange functions)

  const sections = [
    // ... (keep Basic Information section as is)
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
              {senderOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
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
              {subjectOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
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
    // ... (keep Description and Response sections as is)
  ]

  // ... (keep rest of the component the same)
}

export default NewRequest
