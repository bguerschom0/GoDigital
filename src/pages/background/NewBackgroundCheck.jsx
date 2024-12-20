// src/pages/background/NewBackgroundCheck.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calendar,
  Check,
  Save,
  ChevronRight, 
  ChevronLeft, 
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

const steps = [
  { id: 1, title: 'Basic Information', description: 'Personal and identification details' },
  { id: 2, title: 'Department & Role', description: 'Work placement information' },
  { id: 3, title: 'Additional Details', description: 'Role specific information' },
  { id: 4, title: 'Review', description: 'Verify information' }
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
          <Check className="h-6 w-6 text-[#0A2647] dark:text-[#0A2647]" />
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

const NewBackgroundCheck = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { checkPermission } = usePageAccess()
  const [pageLoading, setPageLoading] = useState(true)
  
  const [currentStep, setCurrentStep] = useState(1)
  const [departments, setDepartments] = useState([])
  const [roles, setRoles] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [validationErrors, setValidationErrors] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({})
  
  const [formData, setFormData] = useState({
    full_names: '',
    citizenship: '',
    id_passport_number: '',
    passport_expiry_date: '',
    department_id: '',
    role_id: '',
    role_type: '',
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

  // Check permissions
  useEffect(() => {
    const checkAccess = async () => {
      const { canAccess } = checkPermission('/background/new')
      
      if (!canAccess) {
        navigate(user?.role === 'admin' ? '/admin/dashboard' : '/dashboard')
        return
      }
      setPageLoading(false)
    }
    
    checkAccess()
  }, [])

  useEffect(() => {
    fetchDepartmentsAndRoles()
  }, [])

  const fetchDepartmentsAndRoles = async () => {
    try {
      // Fetch departments
      const { data: deptData, error: deptError } = await supabase
        .from('departments')
        .select('*')
        .eq('status', 'active')

      if (deptError) throw deptError
      setDepartments(deptData)

      // Fetch roles
      const { data: roleData, error: roleError } = await supabase
        .from('roles')
        .select('*')
        .eq('status', 'active')

      if (roleError) throw roleError
      setRoles(roleData)
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => {
      const newData = { ...prev, [name]: value }

      // Clear fields when role changes
      if (name === 'role_type') {
        newData.from_company = ''
        newData.duration = ''
        newData.operating_country = ''
        newData.date_start = ''
        newData.date_end = ''
        newData.work_with = ''
      }

      return newData
    })

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateStep = (step) => {
    const newErrors = {}

    switch (step) {
      case 1:
        if (!formData.full_names) newErrors.full_names = 'Full names are required'
        if (!formData.citizenship) newErrors.citizenship = 'Citizenship is required'
        if (!formData.id_passport_number) newErrors.id_passport_number = 'ID/Passport number is required'
        if (formData.citizenship !== 'Rwandan' && !formData.passport_expiry_date) {
          newErrors.passport_expiry_date = 'Passport expiry date is required'
        }
        break

      case 2:
        if (!formData.department_id) newErrors.department_id = 'Department is required'
        if (!formData.role_type) newErrors.role_type = 'Role type is required'
        break

      case 3:
        if (['Staff', 'Apprentice'].includes(formData.role_type)) {
          if (!formData.submitted_date) newErrors.submitted_date = 'Submitted date is required'
          if (!formData.requested_by) newErrors.requested_by = 'Requested by is required'
        }
        else if (formData.role_type === 'Expert') {
          if (!formData.from_company) newErrors.from_company = 'Company is required'
          if (!formData.submitted_date) newErrors.submitted_date = 'Submitted date is required'
          if (!formData.requested_by) newErrors.requested_by = 'Requested by is required'
        }
        else if (['Contractor', 'Consultant'].includes(formData.role_type)) {
          if (!formData.duration) newErrors.duration = 'Duration is required'
          if (!formData.operating_country) newErrors.operating_country = 'Operating country is required'
          if (!formData.from_company) newErrors.from_company = 'Company is required'
          if (!formData.submitted_date) newErrors.submitted_date = 'Submitted date is required'
          if (!formData.requested_by) newErrors.requested_by = 'Requested by is required'
        }
        else if (formData.role_type === 'Internship') {
          if (!formData.date_start) newErrors.date_start = 'Start date is required'
          if (!formData.date_end) newErrors.date_end = 'End date is required'
          if (!formData.work_with) newErrors.work_with = 'Work with is required'
        }
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return

    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1)
      return
    }

    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('background_checks')
        .insert([{
          ...formData,
          created_by: user.id,
          updated_by: user.id
        }])

      if (error) throw error

      setMessage({ type: 'success', text: 'Background check saved successfully!' })
      handleReset()
    } catch (error) {
      console.error('Error:', error)
      setMessage({ type: 'error', text: 'Error saving background check. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setFormData({
      full_names: '',
      citizenship: '',
      id_passport_number: '',
      passport_expiry_date: '',
      department_id: '',
      role_id: '',
      role_type: '',
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
    setCurrentStep(1)
    setErrors({})
  }
    const renderValidationErrors = () => {
    if (validationErrors.length === 0) return null;

    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <ul className="list-disc list-inside">
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </AlertDescription>
      </Alert>
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Full Names
              </label>
              <input
                type="text"
                name="full_names"
                value={formData.full_names}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] dark:bg-gray-800 dark:border-gray-700"
              />
              {errors.full_names && (
                <p className="mt-1 text-sm text-red-500">{errors.full_names}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Citizenship
              </label>
              <select
                name="citizenship"
                value={formData.citizenship}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] dark:bg-gray-800 dark:border-gray-700"
              >
                <option value="">Select Citizenship</option>
                <option value="Rwandan">Rwandan</option>
                <option value="Other">Other</option>
              </select>
              {errors.citizenship && (
                <p className="mt-1 text-sm text-red-500">{errors.citizenship}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                ID/Passport Number
              </label>
              <input
                type="text"
                name="id_passport_number"
                value={formData.id_passport_number}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] dark:bg-gray-800 dark:border-gray-700"
              />
              {errors.id_passport_number && (
                <p className="mt-1 text-sm text-red-500">{errors.id_passport_number}</p>
              )}
            </div>

            {formData.citizenship !== 'Rwandan' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Passport Expiry Date
                </label>
                <input
                  type="date"
                  name="passport_expiry_date"
                  value={formData.passport_expiry_date}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] dark:bg-gray-800 dark:border-gray-700"
                />
                {errors.passport_expiry_date && (
                  <p className="mt-1 text-sm text-red-500">{errors.passport_expiry_date}</p>
                )}
              </div>
            )}
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Department
              </label>
              <select
                name="department_id"
                value={formData.department_id}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] dark:bg-gray-800 dark:border-gray-700"
              >
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
              {errors.department_id && (
                <p className="mt-1 text-sm text-red-500">{errors.department_id}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Role Type
              </label>
              <select
                name="role_type"
                value={formData.role_type}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] dark:bg-gray-800 dark:border-gray-700"
              >
                <option value="">Select Role Type</option>
                <option value="Staff">Staff</option>
                <option value="Expert">Expert</option>
                <option value="Contractor">Contractor</option>
                <option value="Consultant">Consultant</option>
                <option value="Internship">Internship</option>
                <option value="Apprentice">Apprentice</option>
              </select>
              {errors.role_type && (
                <p className="mt-1 text-sm text-red-500">{errors.role_type}</p>
              )}
            </div>
          </div>
        )

      case 3:
  return (
    <div className="space-y-4">
      {formData.roleType === 'Staff' || formData.roleType === 'Apprentice' ? (
        // Staff or Apprentice Fields
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Submitted Date *
            </label>
            <div className="relative">
              <input
                type="date"
                name="submittedDate"
                value={formData.submittedDate}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] dark:bg-gray-800 dark:border-gray-700"
              />
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
            {errors.submittedDate && (
              <p className="mt-1 text-sm text-red-500">{errors.submittedDate}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Requested By *
            </label>
            <input
              type="text"
              name="requestedBy"
              value={formData.requestedBy}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] dark:bg-gray-800 dark:border-gray-700"
              placeholder="Enter requester name"
            />
            {errors.requestedBy && (
              <p className="mt-1 text-sm text-red-500">{errors.requestedBy}</p>
            )}
          </div>
        </>
      ) : formData.roleType === 'Expert' ? (
        // Expert Fields
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              From Company *
            </label>
            <input
              type="text"
              name="fromCompany"
              value={formData.fromCompany}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] dark:bg-gray-800 dark:border-gray-700"
              placeholder="Enter company name"
            />
            {errors.fromCompany && (
              <p className="mt-1 text-sm text-red-500">{errors.fromCompany}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Submitted Date *
            </label>
            <div className="relative">
              <input
                type="date"
                name="submittedDate"
                value={formData.submittedDate}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] dark:bg-gray-800 dark:border-gray-700"
              />
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
            {errors.submittedDate && (
              <p className="mt-1 text-sm text-red-500">{errors.submittedDate}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Requested By *
            </label>
            <input
              type="text"
              name="requestedBy"
              value={formData.requestedBy}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] dark:bg-gray-800 dark:border-gray-700"
              placeholder="Enter requester name"
            />
            {errors.requestedBy && (
              <p className="mt-1 text-sm text-red-500">{errors.requestedBy}</p>
            )}
          </div>
        </>
      ) : formData.roleType === 'Contractor' || formData.roleType === 'Consultant' ? (
        // Contractor or Consultant Fields
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Duration *
            </label>
            <input
              type="text"
              name="duration"
              value={formData.duration}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] dark:bg-gray-800 dark:border-gray-700"
              placeholder="Enter duration of stay"
            />
            {errors.duration && (
              <p className="mt-1 text-sm text-red-500">{errors.duration}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Operating Country *
            </label>
            <input
              type="text"
              name="operatingCountry"
              value={formData.operatingCountry}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] dark:bg-gray-800 dark:border-gray-700"
              placeholder="Enter operating country"
            />
            {errors.operatingCountry && (
              <p className="mt-1 text-sm text-red-500">{errors.operatingCountry}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              From Company *
            </label>
            <input
              type="text"
              name="fromCompany"
              value={formData.fromCompany}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] dark:bg-gray-800 dark:border-gray-700"
              placeholder="Enter company name"
            />
            {errors.fromCompany && (
              <p className="mt-1 text-sm text-red-500">{errors.fromCompany}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Submitted Date *
            </label>
            <div className="relative">
              <input
                type="date"
                name="submittedDate"
                value={formData.submittedDate}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] dark:bg-gray-800 dark:border-gray-700"
              />
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
            {errors.submittedDate && (
              <p className="mt-1 text-sm text-red-500">{errors.submittedDate}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Requested By *
            </label>
            <input
              type="text"
              name="requestedBy"
              value={formData.requestedBy}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] dark:bg-gray-800 dark:border-gray-700"
              placeholder="Enter requester name"
            />
            {errors.requestedBy && (
              <p className="mt-1 text-sm text-red-500">{errors.requestedBy}</p>
            )}
          </div>
        </>
      ) : formData.roleType === 'Internship' ? (
        // Internship Fields
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Date Start *
            </label>
            <div className="relative">
              <input
                type="date"
                name="dateStart"
                value={formData.dateStart}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] dark:bg-gray-800 dark:border-gray-700"
              />
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
            {errors.dateStart && (
              <p className="mt-1 text-sm text-red-500">{errors.dateStart}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Date End *
            </label>
            <div className="relative">
              <input
                type="date"
                name="dateEnd"
                value={formData.dateEnd}
                onChange={handleInputChange}
                min={formData.dateStart} // Ensure end date is after start date
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] dark:bg-gray-800 dark:border-gray-700"
              />
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
            {errors.dateEnd && (
              <p className="mt-1 text-sm text-red-500">{errors.dateEnd}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Will Work With *
            </label>
            <input
              type="text"
              name="workWith"
              value={formData.workWith}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] dark:bg-gray-800 dark:border-gray-700"
              placeholder="Enter supervisor/mentor name"
            />
            {errors.workWith && (
              <p className="mt-1 text-sm text-red-500">{errors.workWith}</p>
            )}
          </div>
        </>
      ) : null}
    </div>
  );

         case 4:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Personal Information</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Full Names:</span> {formData.full_names}</p>
                  <p><span className="font-medium">Citizenship:</span> {formData.citizenship}</p>
                  <p><span className="font-medium">ID/Passport:</span> {formData.id_passport_number}</p>
                  {formData.citizenship !== 'Rwandan' && (
                    <p><span className="font-medium">Passport Expiry:</span> {formData.passport_expiry_date}</p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Role Information</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Department:</span> {departments.find(d => d.id === formData.department_id)?.name}</p>
                  <p><span className="font-medium">Role Type:</span> {formData.role_type}</p>
                  {formData.from_company && <p><span className="font-medium">Company:</span> {formData.from_company}</p>}
                  {formData.duration && <p><span className="font-medium">Duration:</span> {formData.duration}</p>}
                  {formData.operating_country && <p><span className="font-medium">Operating Country:</span> {formData.operating_country}</p>}
                  {formData.date_start && <p><span className="font-medium">Start Date:</span> {formData.date_start}</p>}
                  {formData.date_end && <p><span className="font-medium">End Date:</span> {formData.date_end}</p>}
                  {formData.work_with && <p><span className="font-medium">Work With:</span> {formData.work_with}</p>}
                  {formData.submitted_date && <p><span className="font-medium">Submitted Date:</span> {formData.submitted_date}</p>}
                  {formData.requested_by && <p><span className="font-medium">Requested By:</span> {formData.requested_by}</p>}
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#0A2647]" />
      </div>
    )
  }

  return (
<div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-12">
        {/* Timeline - Desktop */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-8">
            <div className="relative">
              <div className="absolute top-0 bottom-0 left-4 w-0.5 bg-gray-200 dark:bg-gray-700" />
              {steps.map((step, index) => (
                <div key={index} className="relative mb-8">
                  <div className={`
                    absolute left-0 w-8 h-8 rounded-full flex items-center justify-center
                    ${index + 1 <= currentStep 
                      ? 'bg-[#0A2647] text-white' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}
                  `}>
                    {index + 1 < currentStep ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  <div className="ml-12 pt-1">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {step.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Progress Bar */}
        <div className="lg:hidden mb-6">
          <div className="flex items-center justify-between px-2">
            {steps.map((step, index) => (
              <div 
                key={index} 
                className={`flex flex-col items-center ${
                  index + 1 === currentStep 
                    ? 'text-[#0A2647] dark:text-white' 
                    : 'text-gray-400 dark:text-gray-500'
                }`}
              >
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center mb-2
                  ${index + 1 <= currentStep 
                    ? 'bg-[#0A2647] text-white' 
                    : 'bg-gray-200 dark:bg-gray-700'}
                `}>
                  {index + 1 < currentStep ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <span className="text-xs text-center hidden sm:block">{step.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Form Container */}
        <div className="flex-1">
          <Card className="p-4 lg:p-6">
            {renderValidationErrors()}
            {renderStepContent()}

            <div className="mt-6 flex flex-col sm:flex-row justify-between gap-4">
              <Button
                type="button"
                onClick={handleReset}
                variant="outline"
                className="border-[#0A2647] hover:bg-[#0A2647]/10"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset
              </Button>

              <div className="flex flex-col sm:flex-row gap-2">
                {currentStep > 1 && (
                  <Button
                    type="button"
                    onClick={() => {
                      setCurrentStep(prev => prev - 1);
                      setValidationErrors([]);
                    }}
                    variant="outline"
                    className="border-[#0A2647] hover:bg-[#0A2647]/10"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                )}
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-[#0A2647] hover:bg-[#0A2647]/90 text-white"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : currentStep === steps.length ? (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Submit
                    </>
                  ) : (
                    <>
                      Next
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default NewBackgroundCheck
