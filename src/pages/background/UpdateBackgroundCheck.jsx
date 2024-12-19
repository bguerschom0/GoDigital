// src/pages/background/NewBackgroundCheck.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calendar,
  Check,
  Save,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  User,
  Building,
  Clock,
  FileText,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { supabase } from '@/config/supabase'
import { useAuth } from '@/context/AuthContext'
import { usePageAccess } from '@/hooks/usePageAccess'

// Keep your existing steps and SuccessPopup component

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

// Similar updates for PendingBackgroundChecks.jsx:
const PendingBackgroundChecks = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { checkPermission } = usePageAccess()
  const [pageLoading, setPageLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [departments, setDepartments] = useState([])
  const [roles, setRoles] = useState([])
  const [formData, setFormData] = useState({
    full_names: '',
    citizenship: '',
    id_passport_number: '',
    passport_expiry_date: '',
    department_id: '',
    role_id: '',
    submitted_date: '',
    status: 'Pending',
    requested_by: '',
    from_company: '',
    duration: '',
    operating_country: '',
    date_start: '',
    date_end: '',
    work_with: ''
  })
  
  // Add permission check
  useEffect(() => {
    const checkAccess = async () => {
      const { canAccess } = checkPermission('/background/pending')
      
      if (!canAccess) {
        navigate(user?.role === 'admin' ? '/admin/dashboard' : '/dashboard')
        return
      }
      setPageLoading(false)
    }
    
    checkAccess()
  }, [])

useEffect(() => {
    fetchDepartments()
    fetchRoles()
  }, [])

  const fetchDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .eq('status', 'active')
        .order('name')

      if (error) throw error
      setDepartments(data)
    } catch (error) {
      console.error('Error fetching departments:', error)
    }
  }

  const fetchRoles = async () => {
    try {
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .eq('status', 'active')
        .order('name')

      if (error) throw error
      setRoles(data)
    } catch (error) {
      console.error('Error fetching roles:', error)
    }
  }

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setMessage({ type: 'error', text: 'Please enter an ID/Passport number' })
      return
    }

    setIsLoading(true)
    setSearchResults([])
    try {
      const { data, error } = await supabase
        .from('background_checks')
        .select(`
          *,
          departments (name),
          roles (name, type)
        `)
        .ilike('id_passport_number', `%${searchTerm}%`)
        .order('created_at', { ascending: false })

      if (error) throw error

      setSearchResults(data)
      if (data.length === 0) {
        setMessage({ type: 'info', text: 'No records found' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error searching records' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelect = (record) => {
    setSelectedRequest(record)
    setFormData({
      full_names: record.full_names,
      citizenship: record.citizenship,
      id_passport_number: record.id_passport_number,
      passport_expiry_date: record.passport_expiry_date || '',
      department_id: record.department_id,
      role_id: record.role_id,
      submitted_date: record.submitted_date || '',
      status: record.status,
      requested_by: record.requested_by || '',
      from_company: record.from_company || '',
      duration: record.duration || '',
      operating_country: record.operating_country || '',
      date_start: record.date_start || '',
      date_end: record.date_end || '',
      work_with: record.work_with || ''
    })
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const getSelectedRole = () => {
    const selectedRole = roles.find(role => role.id === formData.role_id)
    return selectedRole?.type || ''
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    setIsUpdating(true)
    try {
      const updateData = {
        ...formData,
        updated_by: user.id,
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('background_checks')
        .update(updateData)
        .eq('id', selectedRequest.id)

      if (error) throw error

      setMessage({ type: 'success', text: 'Record updated successfully!' })
    } catch (error) {
      console.error('Error:', error)
      setMessage({ type: 'error', text: 'Error updating record. Please try again.' })
    } finally {
      setIsUpdating(false)
    }
  }

  const clearMessage = () => setMessage({ type: '', text: '' })

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#0A2647]" />
      </div>
    )
  }

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-[90%] px-4">
                    {/* Search Section */}
            <Card className="overflow-visible">
              <CardHeader>
                <CardTitle className="text-lg font-medium">Search Record</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-4">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      placeholder="Enter ID/Passport Number"
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
                {/* ... Search Results Section (same pattern as before) ... */}
              </CardContent>
            </Card>

            {/* Update Form */}
            {/* Would you like me to continue with the update form section? */}
      </div>
    </div>
  )
}
export default UpdateBackgroundCheck
