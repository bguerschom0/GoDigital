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
  Loader2,
  Search, 
  Loader, 
  AlertCircle, 
  X,
  CheckCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/config/supabase'
import { useAuth } from '@/context/AuthContext'
import { usePageAccess } from '@/hooks/usePageAccess'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { format } from 'date-fns'

const SuccessPopup = ({ message, onClose }) => {
  useEffect(() => {
    // Auto close and refresh after 10 seconds
    const timer = setTimeout(() => {
      onClose()
      window.location.reload()
    }, 10000) // 10 seconds

    return () => clearTimeout(timer)
  }, [onClose])

  return (
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
              onClose()
              window.location.reload() // Immediate refresh on manual close
            }}
            className="bg-[#0A2647] hover:bg-[#0A2647]/90 text-white"
          >
            Close
          </Button>
        </div>
      </motion.div>
    </div>
  )
}

const UpdateBackgroundCheck = () => {
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
    work_with: '',
    closed_date: ''
  })

  useEffect(() => {
    const checkAccess = async () => {
      const { canAccess } = checkPermission('/background/update')
      
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
      ...record,
      closed_date: record.closed_date || ''
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
  
  // Basic validation
  const requiredFields = ['full_names', 'citizenship', 'id_passport_number', 'department_id', 'role_id']
  const roleType = getSelectedRole()

  // Add role-specific required fields
  if (roleType !== 'Internship') {
    requiredFields.push('submitted_date', 'requested_by')
  }

  if (['Expert', 'Contractor', 'Consultant'].includes(roleType)) {
    requiredFields.push('from_company')
  }

  if (['Contractor', 'Consultant'].includes(roleType)) {
    requiredFields.push('duration', 'operating_country', 'additional_info')
  }

  if (roleType === 'Internship') {
    requiredFields.push('date_start', 'date_end', 'work_with', 'contact_number')
  }

  // Check required fields
  const missingFields = requiredFields.filter(field => !formData[field])
  if (missingFields.length > 0) {
    setMessage({
      type: 'error',
      text: `Please fill in all required fields: ${missingFields.join(', ')}`
    })
    return
  }

  // Additional validation for closed status
  if (formData.status === 'Closed' && !formData.closed_date) {
    setMessage({
      type: 'error',
      text: 'Please enter a closed date'
    })
    return
  }

  setIsUpdating(true)
  try {
    const updateData = {
      ...formData,
      updated_by: user.id,
      updated_at: new Date().toISOString()
    }

    // Add closed_by if status is being set to Closed
    if (formData.status === 'Closed') {
      updateData.closed_by = user.id
    } else {
      // Reset closed fields if status is not Closed
      updateData.closed_date = null
      updateData.closed_by = null
    }

    const { error } = await supabase
      .from('background_checks')
      .update(updateData)
      .eq('id', selectedRequest.id)

    if (error) throw error

    setMessage({ 
      type: 'success', 
      text: `Record ${formData.status === 'Closed' ? 'closed' : 'updated'} successfully!` 
    })
    
    // Refresh search results
    handleSearch()
  } catch (error) {
    console.error('Error:', error)
    setMessage({ 
      type: 'error', 
      text: 'Error updating record. Please try again.' 
    })
  } finally {
    setIsUpdating(false)
  }
}

  const resetForm = () => {
    setSelectedRequest(null)
    setFormData({
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
      work_with: '',
      closed_date: ''
    })
  }

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#0A2647]" />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-theme(spacing.16))]">
      <div className="flex-1 flex justify-center">
        <div className="w-full max-w-[90%] px-4 pb-8">
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
              {searchResults.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-lg font-medium mb-2">Search Results</h3>
                  <div className="space-y-4">
                    {searchResults.map((record) => (
                      <div
                        key={record.id}
                        className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                        onClick={() => handleSelect(record)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{record.full_names}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              ID/Passport: {record.id_passport_number}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Department: {record.departments?.name} | Role: {record.roles?.name} ({record.roles?.type})
                            </p>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className={`
                              px-2 py-1 rounded-full text-xs font-medium
                              ${record.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                              ${record.status === 'Closed' ? 'bg-green-100 text-green-800' : ''}
                            `}>
                              {record.status}
                            </span>
                            {record.closed_date && (
                              <span className="text-xs text-gray-500 mt-1">
                                Closed on: {format(new Date(record.closed_date), 'dd MMM yyyy')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

{/* Update Form */}
{selectedRequest && (
  <Card className="mt-6">
    <CardHeader>
      <CardTitle className="text-lg font-medium">Update Background Check</CardTitle>
    </CardHeader>
    <CardContent>
      <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
        {/* Personal Information */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900 dark:text-white">Personal Information</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Full Names <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="full_names"
              value={formData.full_names}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border-2 border-[#0A2647]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] focus:border-transparent dark:bg-gray-800 dark:border-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Citizenship <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="citizenship"
              value={formData.citizenship}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border-2 border-[#0A2647]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] focus:border-transparent dark:bg-gray-800 dark:border-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              ID/Passport Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="id_passport_number"
              value={formData.id_passport_number}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border-2 border-[#0A2647]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] focus:border-transparent dark:bg-gray-800 dark:border-gray-700"
            />
          </div>

          {formData.citizenship && 
           !['Rwanda', 'Rwandan'].includes(formData.citizenship.trim()) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Passport Expiry Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="passport_expiry_date"
                value={formData.passport_expiry_date}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border-2 border-[#0A2647]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] focus:border-transparent dark:bg-gray-800 dark:border-gray-700"
              />
            </div>
          )}
        </div>

        {/* Department and Role */}
        <div className="space-y-4 pt-4">
          <h3 className="font-medium text-gray-900 dark:text-white">Department and Role</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Department <span className="text-red-500">*</span>
            </label>
            <select
              name="department_id"
              value={formData.department_id}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border-2 border-[#0A2647]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] focus:border-transparent dark:bg-gray-800 dark:border-gray-700"
            >
              <option value="">Select Department</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Role <span className="text-red-500">*</span>
            </label>
            <select
              name="role_id"
              value={formData.role_id}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border-2 border-[#0A2647]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] focus:border-transparent dark:bg-gray-800 dark:border-gray-700"
            >
              <option value="">Select Role</option>
              {roles.map(role => (
                <option key={role.id} value={role.id}>{role.name} ({role.type})</option>
              ))}
            </select>
          </div>
        </div>

{/* Role Specific Information */}
{getSelectedRole() && (
  <div className="space-y-4 pt-4">
    <h3 className="font-medium text-gray-900 dark:text-white">Additional Information</h3>
    
    {/* Common fields for all roles except Internship */}
    {getSelectedRole() !== 'Internship' && (
      <>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Submitted Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="submitted_date"
            value={formData.submitted_date}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border-2 border-[#0A2647]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] focus:border-transparent dark:bg-gray-800 dark:border-gray-700"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Requested By <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="requested_by"
            value={formData.requested_by}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border-2 border-[#0A2647]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] focus:border-transparent dark:bg-gray-800 dark:border-gray-700"
          />
        </div>
      </>
    )}
    
    {/* Expert Fields */}
    {getSelectedRole() === 'Expert' && (
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          From Company <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="from_company"
          value={formData.from_company}
          onChange={handleInputChange}
          className="w-full px-4 py-2 border-2 border-[#0A2647]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] focus:border-transparent dark:bg-gray-800 dark:border-gray-700"
        />
      </div>
    )}

    {/* Contractor & Consultant Fields */}
    {['Contractor', 'Consultant'].includes(getSelectedRole()) && (
      <>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            From Company <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="from_company"
            value={formData.from_company}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border-2 border-[#0A2647]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] focus:border-transparent dark:bg-gray-800 dark:border-gray-700"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Duration <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="duration"
            value={formData.duration}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border-2 border-[#0A2647]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] focus:border-transparent dark:bg-gray-800 dark:border-gray-700"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Operating Country <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="operating_country"
            value={formData.operating_country}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border-2 border-[#0A2647]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] focus:border-transparent dark:bg-gray-800 dark:border-gray-700"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Additional Information <span className="text-red-500">*</span>
          </label>
          <textarea
            name="additional_info"
            value={formData.additional_info}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-4 py-2 border-2 border-[#0A2647]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] focus:border-transparent dark:bg-gray-800 dark:border-gray-700"
          />
        </div>
      </>
    )}

    {/* Internship Fields */}
    {getSelectedRole() === 'Internship' && (
      <>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Start Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="date_start"
            value={formData.date_start}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border-2 border-[#0A2647]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] focus:border-transparent dark:bg-gray-800 dark:border-gray-700"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            End Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="date_end"
            value={formData.date_end}
            onChange={handleInputChange}
            min={formData.date_start}
            className="w-full px-4 py-2 border-2 border-[#0A2647]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] focus:border-transparent dark:bg-gray-800 dark:border-gray-700"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Work With <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="work_with"
            value={formData.work_with}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border-2 border-[#0A2647]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] focus:border-transparent dark:bg-gray-800 dark:border-gray-700"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Contact Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            name="contact_number"
            value={formData.contact_number}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border-2 border-[#0A2647]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] focus:border-transparent dark:bg-gray-800 dark:border-gray-700"
          />
        </div>
      </>
    )}
  </div>
)}

        {/* Status Section - Always at the bottom */}
        <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h3 className="font-medium text-gray-900 dark:text-white">Status Information</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border-2 border-[#0A2647]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] focus:border-transparent dark:bg-gray-800 dark:border-gray-700"
            >
              <option value="Pending">Pending</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          {formData.status === 'Closed' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Closed Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="closed_date"
                value={formData.closed_date}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border-2 border-[#0A2647]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] focus:border-transparent dark:bg-gray-800 dark:border-gray-700"
                required
              />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-6">
          <Button
            onClick={resetForm}
            variant="outline"
            className="border-[#0A2647] hover:bg-[#0A2647]/10"
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdate}
            disabled={isUpdating}
            className="bg-[#0A2647] hover:bg-[#0A2647]/90 text-white"
          >
            {isUpdating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </CardContent>
  </Card>
)}

{/* Success Message Modal */}
{message.type === 'success' && (
  <SuccessPopup
    message={message.text}
    onClose={() => {
      setMessage({ type: '', text: '' })
      resetForm()
    }}
  />
)}

{/* Error Message Modal */}
{message.type === 'error' && (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
  >
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
      <div className="flex items-center justify-center mb-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
      </div>
      <h2 className="text-xl font-semibold text-center mb-2">Error</h2>
      <p className="text-center text-gray-600 dark:text-gray-300 mb-4">
        {message.text}
      </p>
      <div className="flex justify-center">
        <Button 
          onClick={() => setMessage({ type: '', text: '' })}
          className="bg-red-500 hover:bg-red-600 text-white"
        >
          Close
        </Button>
      </div>
    </div>
  </motion.div>
)}

{/* Info Message */}
{message.type === 'info' && (
  <div className="mt-4 p-4 bg-blue-50 text-blue-700 rounded-lg">
    <p className="text-center">{message.text}</p>
  </div>
)}
        </div>
      </div>
    </div>
  )
}

export default UpdateBackgroundCheck
