import { AdminLayout } from '@/components/layout'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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
  const navigate = useNavigate()
  const { user } = useAuth()
  const [hasAccess, setHasAccess] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [availableUsers, setAvailableUsers] = useState([])
  const [senderOptions, setSenderOptions] = useState([])
  const [subjectOptions, setSubjectOptions] = useState([])
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
  const [message, setMessage] = useState({ type: '', text: '' })

  // Check user permissions
  useEffect(() => {
    const checkPermissions = async () => {
      try {
        if (!user) {
          navigate('/login')
          return
        }

        // If user is admin, grant access immediately
        if (user.role === 'admin') {
          setHasAccess(true)
          await fetchInitialData()
          return
        }

        // For non-admin users, check permissions
        const { data: pageData, error: pageError } = await supabase
          .from('pages')
          .select('id')
          .eq('name', 'New Stakeholder Request')
          .single()

        if (pageError) throw pageError

        const { data: permissionData, error: permissionError } = await supabase
          .from('page_permissions')
          .select('can_access')
          .eq('user_id', user.id)
          .eq('page_id', pageData.id)
          .single()

        if (permissionError || !permissionData?.can_access) {
          navigate('/admin/dashboard')
          return
        }

        setHasAccess(true)
        await fetchInitialData()
      } catch (error) {
        console.error('Permission check error:', error)
        navigate('/admin/dashboard')
      } finally {
        setIsLoading(false)
      }
    }

    checkPermissions()
  }, [user, navigate])

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

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <RefreshCw className="w-8 h-8 animate-spin" />
        </div>
      </AdminLayout>
    )
  }

  if (!hasAccess) {
    return null
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
