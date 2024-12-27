import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Calendar,
  Check,
  Save,
  ChevronRight, 
  ChevronLeft, 
  RefreshCw,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
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
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationErrors, setValidationErrors] = useState([])
  
  const [formData, setFormData] = useState({
    full_names: '',
    citizenship: '',
    id_passport_number: '',
    passport_expiry_date: '',
  department_id: null,
  role_id: null,   
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
      setMessage({ type: 'error', text: 'Failed to load departments and roles.' })
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

      // Reset passport expiry date if citizenship is Rwanda/Rwandan
      if (name === 'citizenship' && 
          ['rwanda', 'rwandan'].includes(value.trim().toLowerCase())) {
        newData.passport_expiry_date = ''
      }

      return newData
    })

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateStep = (step) => {
    const newErrors = {}
    const newValidationErrors = []

    switch (step) {
      case 1:
        if (!formData.full_names) {
          newErrors.full_names = 'Full names are required'
          newValidationErrors.push('Full names are required')
        }
        if (!formData.citizenship) {
          newErrors.citizenship = 'Citizenship is required'
          newValidationErrors.push('Citizenship is required')
        }
        if (!formData.id_passport_number) {
          newErrors.id_passport_number = 'ID/Passport number is required'
          newValidationErrors.push('ID/Passport number is required')
        }
        
        // Check passport expiry only if citizenship is not Rwanda/Rwandan
        const citizenshipLower = formData.citizenship.trim().toLowerCase()
        if (!['rwanda', 'rwandan'].includes(citizenshipLower) && 
            !formData.passport_expiry_date) {
          newErrors.passport_expiry_date = 'Passport expiry date is required'
          newValidationErrors.push('Passport expiry date is required')
        }
        break

      case 2:
        if (!formData.department_id) {
          newErrors.department_id = 'Department is required'
          newValidationErrors.push('Department is required')
        }
        if (!formData.role_type) {
          newErrors.role_type = 'Role type is required'
          newValidationErrors.push('Role type is required')
        }
        break

      case 3:
        if (['Staff', 'Apprentice'].includes(formData.role_type)) {
          if (!formData.submitted_date) {
            newErrors.submitted_date = 'Submitted date is required'
            newValidationErrors.push('Submitted date is required')
          }
          if (!formData.requested_by) {
            newErrors.requested_by = 'Requested by is required'
            newValidationErrors.push('Requested by is required')
          }
        }
        else if (formData.role_type === 'Expert') {
          if (!formData.from_company) {
            newErrors.from_company = 'Company is required'
            newValidationErrors.push('Company is required')
          }
          if (!formData.submitted_date) {
            newErrors.submitted_date = 'Submitted date is required'
            newValidationErrors.push('Submitted date is required')
          }
          if (!formData.requested_by) {
            newErrors.requested_by = 'Requested by is required'
            newValidationErrors.push('Requested by is required')
          }
        }
        else if (['Contractor', 'Consultant'].includes(formData.role_type)) {
          if (!formData.duration) {
            newErrors.duration = 'Duration is required'
            newValidationErrors.push('Duration is required')
          }
          if (!formData.operating_country) {
            newErrors.operating_country = 'Operating country is required'
            newValidationErrors.push('Operating country is required')
          }
          if (!formData.from_company) {
            newErrors.from_company = 'Company is required'
            newValidationErrors.push('Company is required')
          }
          if (!formData.submitted_date) {
            newErrors.submitted_date = 'Submitted date is required'
            newValidationErrors.push('Submitted date is required')
          }
          if (!formData.requested_by) {
            newErrors.requested_by = 'Requested by is required'
            newValidationErrors.push('Requested by is required')
          }
        }
        else if (formData.role_type === 'Internship') {
          if (!formData.date_start) {
            newErrors.date_start = 'Start date is required'
            newValidationErrors.push('Start date is required')
          }
          if (!formData.date_end) {
            newErrors.date_end = 'End date is required'
            newValidationErrors.push('End date is required')
          }
          if (!formData.work_with) {
            newErrors.work_with = 'Work with is required'
            newValidationErrors.push('Work with is required')
          }
        }
        break
    }

    setErrors(newErrors)
    setValidationErrors(newValidationErrors)
    return Object.keys(newErrors).length === 0
  }

const handleSubmit = async () => {
  // Validate the current step
  if (!validateStep(currentStep)) return

  // Move to next step if not on final step
  if (currentStep < steps.length) {
    setCurrentStep(prev => prev + 1)
    return
  }

  // Set loading state
  setIsSubmitting(true)

  try {
    // Prepare submission data matching database schema
    const submissionData = {
      full_names: formData.full_names,
      citizenship: formData.citizenship,
      id_passport_number: formData.id_passport_number,
      passport_expiry_date: formData.passport_expiry_date || null,
  department_id: formData.department_id || null,
  role_id: formData.role_id || null,
      submitted_date: formData.submitted_date || null,
      status: 'Pending',
      requested_by: formData.requested_by,
      from_company: formData.from_company || null,
      duration: formData.duration || null,
      operating_country: formData.operating_country || null,
      date_start: formData.date_start || null,
      date_end: formData.date_end || null,
      work_with: formData.work_with || null,
      created_by: user.id,
      updated_by: user.id
    }

    // Perform insert with detailed error checking
    const { data, error } = await supabase
      .from('background_checks')
      .insert([submissionData])
      .select()

    // Handle potential errors
    if (error) {
      console.error('Supabase Insertion Error:', error)
      setMessage({ 
        type: 'error', 
        text: `Failed to save background check: ${error.message || 'Unknown error'}` 
      })
      return
    }

    // Success handling
    setMessage({ type: 'success', text: 'Background check saved successfully!' })
    handleReset()
    navigate('/background/list')
  } catch (error) {
    console.error('Unexpected error:', error)
    setMessage({ 
      type: 'error', 
      text: 'Unexpected error occurred. Please try again.' 
    })
  } finally {
    setIsSubmitting(false)
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
    setValidationErrors([])
  }

  const renderValidationErrors = () => {
    if (validationErrors.length === 0) return null

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
    )
  }

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
              <input
                type="text"
                name="citizenship"
                value={formData.citizenship}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] dark:bg-gray-800 dark:border-gray-700"
                placeholder="Enter citizenship"
              />
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

            {formData.citizenship && 
             !['Rwanda', 'Rwandan'].includes(formData.citizenship.trim()) && (
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
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] dark:bg-gray-800 dark:border-gray-700">
                // Rest of the select tag for departments
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
            {formData.role_type === 'Staff' || formData.role_type === 'Apprentice' ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Submitted Date
                  </label>
                  <input
                    type="date"
                    name="submitted_date"
                    value={formData.submitted_date}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] dark:bg-gray-800 dark:border-gray-700"
                  />
                  {errors.submitted_date && (
                    <p className="mt-1 text-sm text-red-500">{errors.submitted_date}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Requested By
                  </label>
                  <input
                    type="text"
                    name="requested_by"
                    value={formData.requested_by}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] dark:bg-gray-800 dark:border-gray-700"
                    placeholder="Enter requester name"
                  />
                  {errors.requested_by && (
                    <p className="mt-1 text-sm text-red-500">{errors.requested_by}</p>
                  )}
                </div>
              </>
            ) : formData.role_type === 'Expert' ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    From Company
                  </label>
                  <input
                    type="text"
                    name="from_company"
                    value={formData.from_company}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] dark:bg-gray-800 dark:border-gray-700"
                    placeholder="Enter company name"
                  />
                  {errors.from_company && (
                    <p className="mt-1 text-sm text-red-500">{errors.from_company}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Submitted Date
                  </label>
                  <input
                    type="date"
                    name="submitted_date"
                    value={formData.submitted_date}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] dark:bg-gray-800 dark:border-gray-700"
                  />
                  {errors.submitted_date && (
                    <p className="mt-1 text-sm text-red-500">{errors.submitted_date}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Requested By
                  </label>
                  <input
                    type="text"
                    name="requested_by"
                    value={formData.requested_by}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] dark:bg-gray-800 dark:border-gray-700"
                    placeholder="Enter requester name"
                  />
                  {errors.requested_by && (
                    <p className="mt-1 text-sm text-red-500">{errors.requested_by}</p>
                  )}
                </div>
              </>
            ) : formData.role_type === 'Contractor' || formData.role_type === 'Consultant' ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Duration
                  </label>
                  <input
                    type="text"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] dark:bg-gray-800 dark:border-gray-700"
                    placeholder="Enter duration"
                  />
                  {errors.duration && (
                    <p className="mt-1 text-sm text-red-500">{errors.duration}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Operating Country
                  </label>
                  <input
                    type="text"
                    name="operating_country"
                    value={formData.operating_country}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] dark:bg-gray-800 dark:border-gray-700"
                    placeholder="Enter operating country"
                  />
                  {errors.operating_country && (
                    <p className="mt-1 text-sm text-red-500">{errors.operating_country}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    From Company
                  </label>
                  <input
                    type="text"
                    name="from_company"
                    value={formData.from_company}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] dark:bg-gray-800 dark:border-gray-700"
                    placeholder="Enter company name"
                  />
                  {errors.from_company && (
                    <p className="mt-1 text-sm text-red-500">{errors.from_company}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Submitted Date
                  </label>
                  <input
                    type="date"
                    name="submitted_date"
                    value={formData.submitted_date}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] dark:bg-gray-800 dark:border-gray-700"
                  />
                  {errors.submitted_date && (
                    <p className="mt-1 text-sm text-red-500">{errors.submitted_date}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Requested By
                  </label>
                  <input
                    type="text"
                    name="requested_by"
                    value={formData.requested_by}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] dark:bg-gray-800 dark:border-gray-700"
                    placeholder="Enter requester name"
                  />
                  {errors.requested_by && (
                    <p className="mt-1 text-sm text-red-500">{errors.requested_by}</p>
                  )}
                </div>
              </>
            ) : formData.role_type === 'Internship' ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="date_start"
                    value={formData.date_start}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] dark:bg-gray-800 dark:border-gray-700"
                  />
                  {errors.date_start && (
                    <p className="mt-1 text-sm text-red-500">{errors.date_start}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="date_end"
                    value={formData.date_end}
                    onChange={handleInputChange}
                    min={formData.date_start}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] dark:bg-gray-800 dark:border-gray-700"
                  />
                  {errors.date_end && (
                    <p className="mt-1 text-sm text-red-500">{errors.date_end}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Work With
                  </label>
                  <input
                    type="text"
                    name="work_with"
                    value={formData.work_with}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] dark:bg-gray-800 dark:border-gray-700"
                    placeholder="Enter supervisor/mentor name"
                  />
                  {errors.work_with && (
                    <p className="mt-1 text-sm text-red-500">{errors.work_with}</p>
                  )}
                </div>
              </>
            ) : null}
          </div>
        )

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
                  {formData.citizenship && 
                   !['Rwanda', 'Rwandan'].includes(formData.citizenship.trim()) && (
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
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
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

      {/* Success Message Modal */}
{message.type === 'success' && (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
  >
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
      <div className="flex items-center justify-center mb-4">
        <Check className="w-12 h-12 text-green-500" />
      </div>
      <h2 className="text-xl font-semibold text-center mb-2">Success</h2>
      <p className="text-center text-gray-600 dark:text-gray-300 mb-4">
        Background check saved successfully!
      </p>
      <div className="flex justify-center">
        <Button 
          onClick={() => {
            setMessage({ type: '', text: '' });
            navigate('/background/list');
          }}
          className="bg-[#0A2647] hover:bg-[#0A2647]/90 text-white"
        >
          Close
        </Button>
      </div>
    </div>
  </motion.div>
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
    </div>
  )
}

export default NewBackgroundCheck
