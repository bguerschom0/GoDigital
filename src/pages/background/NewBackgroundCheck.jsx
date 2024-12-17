```jsx
// src/pages/background/NewBackgroundCheck.jsx
import { AdminLayout } from '@/components/layout'
import { useState, useEffect } from 'react'
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
  FileText
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { supabase } from '@/config/supabase'
import { useAuth } from '@/context/AuthContext'

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
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [departments, setDepartments] = useState([])
  const [roles, setRoles] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
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
            {/* Staff or Apprentice Fields */}
            {['Staff', 'Apprentice'].includes(formData.role_type) && (
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
                    // Continuing from where it left off...
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
                  />
                  {errors.requested_by && (
                    <p className="mt-1 text-sm text-red-500">{errors.requested_by}</p>
                  )}
                </div>
              </>
            )}

            {/* Expert Fields */}
            {formData.role_type === 'Expert' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Company
                  </label>
                  <input
                    type="text"
                    name="from_company"
                    value={formData.from_company}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] dark:bg-gray-800 dark:border-gray-700"
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
                  />
                  {errors.requested_by && (
                    <p className="mt-1 text-sm text-red-500">{errors.requested_by}</p>
                  )}
                </div>
              </>
            )}

            {/* Contractor or Consultant Fields */}
            {['Contractor', 'Consultant'].includes(formData.role_type) && (
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
                    placeholder="e.g., 6 months"
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
                  />
                  {errors.operating_country && (
                    <p className="mt-1 text-sm text-red-500">{errors.operating_country}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Company
                  </label>
                  <input
                    type="text"
                    name="from_company"
                    value={formData.from_company}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] dark:bg-gray-800 dark:border-gray-700"
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
                  />
                  {errors.requested_by && (
                    <p className="mt-1 text-sm text-red-500">{errors.requested_by}</p>
                  )}
                </div>
              </>
            )}

            {/* Internship Fields */}
            {formData.role_type === 'Internship' && (
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
                    placeholder="Supervisor/Team"
                  />
                  {errors.work_with && (
                    <p className="mt-1 text-sm text-red-500">{errors.work_with}</p>
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

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <Card className="p-6">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">New Background Check</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Submit a new background check request
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex flex-col items-center ${
                    index < steps.length - 1 ? 'w-full' : ''
                  }`}
                >
                  <div className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        step.id <= currentStep
                          ? 'bg-[#0A2647] text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {step.id < currentStep ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        step.id
                      )}
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`h-1 w-full mx-4 ${
                          step.id < currentStep ? 'bg-[#0A2647]' : 'bg-gray-200'
                        }`}
                      />
                    )}
                  </div>
                  <div className="mt-2 text-center">
                    <div className="text-sm font-medium">{step.title}</div>
                    <div className="text-xs text-gray-500">{step.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form Content */}
          <div className="mb-8">
            {renderStepContent()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 border-t">
            <Button
              type="button"
              onClick={() => setCurrentStep(prev => prev - 1)}
              disabled={currentStep === 1}
              className="bg-gray-100 text-gray-900 hover:bg-gray-200"
            >
              Previous
            </Button>
            <div className="flex gap-3">
              <Button
                type="button"
                onClick={handleReset}
                className="bg-gray-100 text-gray-900 hover:bg-gray-200"
              >
                Reset
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                className="bg-[#0A2647] text-white hover:bg-[#0A2647]/90"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </div>
                ) : currentStep === steps.length ? (
                  <div className="flex items-center">
                    <Save className="w-4 h-4 mr-2" />
                    Submit
                  </div>
                ) : (
                  <div className="flex items-center">
                    <ChevronDown className="w-4 h-4 mr-2" />
                    Next
                  </div>
                )}
              </Button>
            </div>
          </div>
        </Card>

        {/* Success Message Popup */}
        <AnimatePresence>
          {message.type === 'success' && (
            <SuccessPopup
              message={message.text}
              onClose={() => setMessage({ type: '', text: '' })}
            />
          )}
        </AnimatePresence>

        {/* Error Message */}
        {message.type === 'error' && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{message.text}</p>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default NewBackgroundCheck
