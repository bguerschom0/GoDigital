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
  AlertCircle,
  Info
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { supabase } from '@/config/supabase'
import { useAuth } from '@/context/AuthContext'
import { usePageAccess } from '@/hooks/usePageAccess'
import debounce from 'lodash/debounce'

const steps = [
  { id: 1, title: 'Basic Information', description: 'Personal and identification details' },
  { id: 2, title: 'Department & Role', description: 'Work placement information' },
  { id: 3, title: 'Additional Details', description: 'Role specific information' },
  { id: 4, title: 'Review', description: 'Verify information' }
]

const SuccessPopup = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
      window.location.reload()
    }, 30000)
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
            <Check className="h-6 w-6 text-[#0A2647] dark:text-[#0A2647]" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-medium text-[#0A2647] dark:text-[#0A2647]">Success</h3>
            <p className="text-[#0A2647]/70 dark:text-[#0A2647]/90">{message}</p>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <Button
            onClick={onClose}
            className="bg-[#0A2647] hover:bg-[#0A2647]/90 text-white"
          >
            Close
          </Button>
        </div>
      </motion.div>
    </div>
  )
}

const NewBackgroundCheck = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { checkPermission } = usePageAccess()
  
  const [pageLoading, setPageLoading] = useState(true)
  const [currentStep, setCurrentStep] = useState(1)
  const [departments, setDepartments] = useState([])
  const [departmentRoles, setDepartmentRoles] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationErrors, setValidationErrors] = useState([])
  const [duplicateIdFound, setDuplicateIdFound] = useState(false)
  const [idCheckLoading, setIdCheckLoading] = useState(false)
  const [roleTypes, setRoleTypes] = useState([])
  
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
    additional_info: '',
    contact_number: ''
  })

  // Check permissions
  useEffect(() => {
    const checkAccess = async () => {
      const { canAccess } = await checkPermission('/background/new')
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

  const checkForDuplicateId = debounce(async (idNumber) => {
    if (!idNumber) return
    
    setIdCheckLoading(true)
    try {
      const { data, error } = await supabase
        .from('background_checks')
        .select('id_passport_number')
        .eq('id_passport_number', idNumber)
        .limit(1)

      if (error) throw error

      setDuplicateIdFound(data && data.length > 0)
    } catch (error) {
      console.error('Error checking for duplicate ID:', error)
    } finally {
      setIdCheckLoading(false)
    }
  }, 500)

const fetchDepartmentsAndRoles = async () => {
  try {
    setIsLoading(true)
    console.log('Starting to fetch departments and roles...')
    
    // First fetch departments
    const { data: departmentData, error: deptError } = await supabase
      .from('departments')
      .select('id, name')
      .eq('status', 'active')
      .order('name')

    if (deptError) {
      console.error('Department fetch error:', deptError)
      throw deptError
    }

    setDepartments(departmentData || [])

    // Then fetch roles
    const { data: rolesData, error: rolesError } = await supabase
      .from('roles')
      .select('id, name, type')
      .eq('status', 'active')
      .order('name')

    if (rolesError) {
      console.error('Role fetch error:', rolesError)
      throw rolesError
    }

    setRoles(rolesData || [])

    // Get unique role types
    const uniqueTypes = [...new Set(rolesData.map(role => role.type))]
    setRoleTypes(uniqueTypes)

  } catch (error) {
    console.error('Error fetching data:', error)
    setMessage({ 
      type: 'error', 
      text: 'Failed to load departments and roles.' 
    })
  } finally {
    setIsLoading(false)
  }
}

  const handleInputChange = (e) => {
    const { name, value } = e.target
    
    if (name === 'id_passport_number') {
      setFormData(prev => ({ ...prev, [name]: value }))
      checkForDuplicateId(value)
    } else if (name === 'department_id') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        role_id: '' // Reset role when department changes
      }))
    } else if (name === 'citizenship') {
      const formattedValue = value.trim()
      const lowerCaseValue = formattedValue.toLowerCase()
      if (['rwanda', 'rwandan'].includes(lowerCaseValue)) {
        const capitalizedValue = formattedValue.charAt(0).toUpperCase() + formattedValue.slice(1).toLowerCase()
        setFormData(prev => ({
          ...prev,
          [name]: capitalizedValue,
          passport_expiry_date: ''
        }))
      } else {
        setFormData(prev => ({ ...prev, [name]: value }))
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }

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
        if (!formData.role_id) {
          newErrors.role_id = 'Role is required'
          newValidationErrors.push('Role is required')
        }
        break

      case 3:
        const selectedRole = departmentRoles[formData.department_id]?.find(
          role => role.id === formData.role_id
        )
        const roleType = selectedRole?.type

        if (['Staff', 'Apprentice'].includes(roleType)) {
          if (!formData.submitted_date) {
            newErrors.submitted_date = 'Submitted date is required'
            newValidationErrors.push('Submitted date is required')
          }
          if (!formData.requested_by) {
            newErrors.requested_by = 'Requested by is required'
            newValidationErrors.push('Requested by is required')
          }
        }
        else if (roleType === 'Expert') {
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
        else if (['Contractor', 'Consultant'].includes(roleType)) {
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
          if (!formData.additional_info) {
            newErrors.additional_info = 'Additional information is required'
            newValidationErrors.push('Additional information is required')
          }
        }
        else if (roleType === 'Internship') {
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
          if (!formData.contact_number) {
            newErrors.contact_number = 'Contact number is required'
            newValidationErrors.push('Contact number is required')
          }
        }
        break
    }

    setErrors(newErrors)
    setValidationErrors(newValidationErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return

    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1)
      return
    }

    setIsSubmitting(true)

    try {
      const selectedRole = departmentRoles[formData.department_id]?.find(
        role => role.id === formData.role_id
      )

      const submissionData = {
        full_names: formData.full_names,
        citizenship: formData.citizenship,
        id_passport_number: formData.id_passport_number,
        passport_expiry_date: formData.passport_expiry_date || null,
        department_id: formData.department_id,
        role_id: formData.role_id,
        submitted_date: formData.submitted_date || null,
        status: 'Pending',
        requested_by: formData.requested_by,
        from_company: formData.from_company || null,
        duration: formData.duration || null,
        operating_country: formData.operating_country || null,
        date_start: formData.date_start || null,
        date_end: formData.date_end || null,
        work_with: formData.work_with || null,
        additional_info: formData.additional_info || null,
        contact_number: formData.contact_number || null,
        created_by: user.id,
        updated_by: user.id
      }

      const { data, error } = await supabase
        .from('background_checks')
        .insert([submissionData])
        .select()

      if (error) throw error

      setMessage({ 
        type: 'success', 
        text: 'Background check saved successfully!' 
      })
      
    } catch (error) {
      console.error('Error saving background check:', error)
      setMessage({ 
        type: 'error', 
        text: `Failed to save background check: ${error.message}`
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
      submitted_date: '',
      status: 'Pending',
      requested_by: '',
      from_company: '',
      duration: '',
      operating_country: '',
      date_start: '',
      date_end: '',
      work_with: '',
      additional_info: '',
      contact_number: ''
    })
    setCurrentStep(1)
    setErrors({})
    setValidationErrors([])
    setDuplicateIdFound(false)
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
    const selectedRole = departmentRoles[formData.department_id]?.find(
      role => role.id === formData.role_id
    )
    const roleType = selectedRole?.type

    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Full Names <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="full_names"
                value={formData.full_names}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] dark:bg-gray-800 dark:border-gray-700"
                placeholder="Enter full names"
              />
              {errors.full_names && (
                <p className="mt-1 text-sm text-red-500">{errors.full_names}</p>
              )}
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
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] dark:bg-gray-800 dark:border-gray-700"
                placeholder="Enter citizenship"
              />
              {errors.citizenship && (
                <p className="mt-1 text-sm text-red-500">{errors.citizenship}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                ID/Passport Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="id_passport_number"
                  value={formData.id_passport_number}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] dark:bg-gray-800 dark:border-gray-700 ${
                    idCheckLoading ? 'pr-10' : ''
                  }`}
                  placeholder="Enter ID or passport number"
                />
                {idCheckLoading && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                  </div>
                )}
              </div>
              {errors.id_passport_number && (
                <p className="mt-1 text-sm text-red-500">{errors.id_passport_number}</p>
              )}
              {duplicateIdFound && (
                <div className="mt-2 flex items-start gap-2 text-blue-600 dark:text-blue-400">
                  <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">
                    This ID/Passport number already exists in the database.
                    You can still proceed with the submission.
                  </p>
                </div>
              )}
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
          Department <span className="text-red-500">*</span>
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
          Role <span className="text-red-500">*</span>
        </label>
        <select
          name="role_id"
          value={formData.role_id}
          onChange={handleInputChange}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] dark:bg-gray-800 dark:border-gray-700"
        >
          <option value="">Select Role</option>
          {roles.map(role => (
            <option key={role.id} value={role.id}>
              {role.name} ({role.type})
            </option>
          ))}
        </select>
        {errors.role_id && (
          <p className="mt-1 text-sm text-red-500">{errors.role_id}</p>
        )}
      </div>
    </div>
  )

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Submitted Date <span className="text-red-500">*</span>
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
                Requested By <span className="text-red-500">*</span>
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

            {/* Expert, Contractor, Consultant fields */}
            {['Expert', 'Contractor', 'Consultant'].includes(roleType) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  From Company <span className="text-red-500">*</span>
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
            )}

            {/* Contractor & Consultant specific fields */}
            {['Contractor', 'Consultant'].includes(roleType) && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Duration <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] dark:bg-gray-800 dark:border-gray-700"
                    placeholder="Enter duration (e.g., 6 months)"
                  />
                  {errors.duration && (
                    <p className="mt-1 text-sm text-red-500">{errors.duration}</p>
                  )}
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
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] dark:bg-gray-800 dark:border-gray-700"
                    placeholder="Enter operating country"
                  />
                  {errors.operating_country && (
                    <p className="mt-1 text-sm text-red-500">{errors.operating_country}</p>
                  )}
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
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] dark:bg-gray-800 dark:border-gray-700"
                    placeholder="Enter any additional information..."
                  />
                  {errors.additional_info && (
                    <p className="mt-1 text-sm text-red-500">{errors.additional_info}</p>
                  )}
                </div>
              </>
            )}

            {/* Internship specific fields */}
            {roleType === 'Internship' && (
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
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] dark:bg-gray-800 dark:border-gray-700"
                  />
                  {errors.date_start && (
                    <p className="mt-1 text-sm text-red-500">{errors.date_start}</p>
                  )}
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
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] dark:bg-gray-800 dark:border-gray-700"
                  />
                  {errors.date_end && (
                    <p className="mt-1 text-sm text-red-500">{errors.date_end}</p>
                  )}
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
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] dark:bg-gray-800 dark:border-gray-700"
                    placeholder="Enter supervisor/mentor name"
                  />
                  {errors.work_with && (
                    <p className="mt-1 text-sm text-red-500">{errors.work_with}</p>
                  )}
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
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] dark:bg-gray-800 dark:border-gray-700"
                    placeholder="Enter contact number"
                  />
                  {errors.contact_number && (
                    <p className="mt-1 text-sm text-red-500">{errors.contact_number}</p>
                  )}
                </div>
              </>
            )}
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
                  <p>
                    <span className="font-medium">Department:</span>{' '}
                    {departments.find(d => d.id === formData.department_id)?.name}
                  </p>
                  <p>
                    <span className="font-medium">Role:</span>{' '}
                    {departmentRoles[formData.department_id]?.find(r => r.id === formData.role_id)?.name}
                    {' '}({departmentRoles[formData.department_id]?.find(r => r.id === formData.role_id)?.type})
                  </p>
                  
                  {formData.submitted_date && (
                    <p><span className="font-medium">Submitted Date:</span> {formData.submitted_date}</p>
                  )}
                  {formData.requested_by && (
                    <p><span className="font-medium">Requested By:</span> {formData.requested_by}</p>
                  )}
                  {formData.from_company && (
                    <p><span className="font-medium">Company:</span> {formData.from_company}</p>
                  )}
                  {formData.duration && (
                    <p><span className="font-medium">Duration:</span> {formData.duration}</p>
                  )}
                  {formData.operating_country && (
                    <p><span className="font-medium">Operating Country:</span> {formData.operating_country}</p>
                  )}
                  {formData.date_start && (
                    <p><span className="font-medium">Start Date:</span> {formData.date_start}</p>
                  )}
                  {formData.date_end && (
                    <p><span className="font-medium">End Date:</span> {formData.date_end}</p>
                  )}
                  {formData.work_with && (
                    <p><span className="font-medium">Work With:</span> {formData.work_with}</p>
                  )}
                  {formData.contact_number && (
                    <p><span className="font-medium">Contact Number:</span> {formData.contact_number}</p>
                  )}
                  {formData.additional_info && (
                    <div>
                      <p className="font-medium">Additional Information:</p>
                      <p className="whitespace-pre-wrap text-gray-600 dark:text-gray-400 mt-1">
                        {formData.additional_info}
                      </p>
                    </div>
                  )}
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
        <SuccessPopup
          message={message.text}
          onClose={() => {
            setMessage({ type: '', text: '' })
            setTimeout(() => {
              window.location.reload()
            }, 30000)
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
    </div>
  )
}

export default NewBackgroundCheck
