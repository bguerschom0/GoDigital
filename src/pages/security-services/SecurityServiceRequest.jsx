// src/pages/security-services/SecurityServiceRequest.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/config/supabase'
import { useAuth } from '@/context/AuthContext'
import { usePageAccess } from '@/hooks/usePageAccess'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Save, 
  Printer, 
  RefreshCw,
  AlertCircle,
  Loader2,
  CheckCircle,
  User,
  Phone,
  FileText,
  ArrowLeft,
  ChevronRight,
  Shield,
  XCircle,
    Calendar,
  Wallet,
  Plus  
} from 'lucide-react'

// Success Message Component
const SuccessPopup = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
      window.location.reload()
    }, 10000)

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
            <CheckCircle className="h-6 w-6 text-[#0A2647]" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-medium text-[#0A2647]">Success</h3>
            <p className="text-[#0A2647]/70 dark:text-[#0A2647]/90">{message}</p>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <Button
            onClick={() => {
              onClose()
              window.location.reload()
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

const phoneModels = [
  'iPhone', 'Samsung', 'Techno', 'Infinix', 
  'Xiaomi', 'Itel', 'Nokia', 'Huawei'
]

const services = [
  { 
    value: 'request_serial_number', 
    label: 'Request Serial Number',
    description: 'Retrieve stolen phone serial number',
    icon: <Phone className="w-4 h-4" />
  },
  { 
    value: 'check_stolen_phone', // Updated value
    label: 'Check Stolen Phone Status',
    description: 'Check status of stolen phones by IMEI',
    icon: <Shield className="w-4 h-4" />
  },
  { 
    value: 'unblock_momo', 
    label: 'Unblock MoMo Account & MoMoPay',
    description: 'Get assistance with unblocking MoMo',
    icon: <Wallet className="w-4 h-4" />
  },
  { 
    value: 'money_refund', 
    label: 'Money Refund',
    description: 'Request money refund',
    icon: <Save className="w-4 h-4" />
  },
  { 
    value: 'backoffice_appointment', 
    label: 'Appointment with Backoffice',
    description: 'Schedule a backoffice appointment',
    icon: <Calendar className="w-4 h-4" />
  },
  { 
    value: 'other_issues', 
    label: 'Other Issues',
    description: 'Other security concerns',
    icon: <FileText className="w-4 h-4" />
  }
]

const SecurityServiceRequest = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { checkPermission } = usePageAccess()

  const [backofficeUsers, setBackofficeUsers] = useState([])
  const [selectedService, setSelectedService] = useState(null)
  const [showPersonalInfo, setShowPersonalInfo] = useState(false)
const [imeiList, setImeiList] = useState([{ imei: '', id: Date.now() }])
const handleAddImei = () => {
  setImeiList([...imeiList, { imei: '', id: Date.now() }])
}

const handleImeiChange = (id, value) => {
  const updatedList = imeiList.map(item => 
    item.id === id ? { ...item, imei: value } : item
  )
  setImeiList(updatedList)
}

const handleRemoveImei = (id) => {
  setImeiList(imeiList.filter(item => item.id !== id))
}


  
  const [formData, setFormData] = useState({
    full_names: '',
    id_passport: '',
    primary_contact: '',
    secondary_contact: '',
    service_type: '',
      phone_number: '',
  date_range: '',
  phone_model: '',
  details: '',
  imei_list: []
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    const checkAccess = async () => {
      let permissionPath = user?.role === 'admin' 
        ? '/admin/security_services/security_service_request'
        : '/security_services/security_service_request'
      
      const { canAccess } = checkPermission(permissionPath)
      
      if (!canAccess) {
        navigate(user?.role === 'admin' ? '/admin/dashboard' : '/user/dashboard')
        return
      }
      setPageLoading(false)
    }
    
    checkAccess()
  }, [])

  const fetchBackofficeUsers = async () => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, full_names')
      .eq('role', 'backoffice')
      .eq('status', 'active')
      .order('full_names')

    if (error) throw error
    setBackofficeUsers(data || [])
  } catch (error) {
    console.error('Error fetching backoffice users:', error)
  }
}

  useEffect(() => {
  if (selectedService?.value === 'backoffice_appointment') {
    fetchBackofficeUsers()
  }
}, [selectedService])

  const handleServiceSelect = (service) => {
    setSelectedService(service)
    setFormData(prev => ({ ...prev, service_type: service.value }))
    setShowPersonalInfo(true)
  }

  const handleBack = () => {
    setShowPersonalInfo(false)
    setSelectedService(null)
    setFormData(prev => ({ ...prev, service_type: '' }))
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.full_names) newErrors.full_names = 'Full names are required'
    if (!formData.id_passport) newErrors.id_passport = 'ID/Passport is required'
    if (!formData.primary_contact) newErrors.primary_contact = 'Primary contact is required'
    if (!formData.service_type) newErrors.service_type = 'Please select a service type'
    if (!formData.details) newErrors.details = 'Please provide service details'

    // Phone number format validation
    if (formData.primary_contact && !/^\d{10}$/.test(formData.primary_contact)) {
      newErrors.primary_contact = 'Contact number must be 10 digits'
    }
    if (formData.secondary_contact && !/^\d{10}$/.test(formData.secondary_contact)) {
      newErrors.secondary_contact = 'Contact number must be 10 digits'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('service_requests')
        .insert([{
          ...formData,
          created_by: user.id,
          status: 'Pending',
          created_at: new Date().toISOString(),
          updated_by: user.id,
          updated_at: new Date().toISOString()
        }])

      if (error) throw error

      setMessage({
        type: 'success',
        text: 'Service request submitted successfully!'
      })

    } catch (error) {
      console.error('Submission error:', error)
      setMessage({
        type: 'error',
        text: 'Failed to submit request. Please try again.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleReset = () => {
    setFormData({
      full_names: '',
      id_passport: '',
      primary_contact: '',
      secondary_contact: '',
      service_type: '',
      details: ''
    })
    setErrors({})
    setMessage({ type: '', text: '' })
  }

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#0A2647]" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <AnimatePresence mode="wait">
        {!showPersonalInfo ? (
          // Service Selection Screen
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Select Service Type</CardTitle>
                <p className="text-sm text-gray-500">Choose the service you need assistance with</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {services.map((service) => (
                    <div
                      key={service.value}
                      onClick={() => handleServiceSelect(service)}
                      className="flex items-center p-3 rounded-lg border border-gray-200 cursor-pointer hover:border-[#0A2647] hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-shrink-0 p-2 rounded-md bg-[#0A2647]/5 text-[#0A2647]">
                        {service.icon}
                      </div>
                      <div className="ml-3">
                        <h4 className="text-sm font-medium">{service.label}</h4>
                        <p className="text-xs text-gray-500">{service.description}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 ml-auto text-gray-400" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          // Personal Information Form
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleBack}
                    className="p-1 rounded-full hover:bg-gray-100"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <CardTitle>{selectedService?.label}</CardTitle>
                    <p className="text-sm text-gray-500">{selectedService?.description}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium">
                        Full Names <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="full_names"
                        value={formData.full_names}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#0A2647] focus:ring-[#0A2647]"
                        placeholder="Enter full names"
                      />
                      {errors.full_names && (
                        <p className="mt-1 text-sm text-red-500">{errors.full_names}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium">
                        ID/Passport <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="id_passport"
                        value={formData.id_passport}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#0A2647] focus:ring-[#0A2647]"
                        placeholder="Enter ID/Passport number"
                      />
                      {errors.id_passport && (
                        <p className="mt-1 text-sm text-red-500">{errors.id_passport}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium">
                        Primary Contact <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        name="primary_contact"
                        value={formData.primary_contact}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#0A2647] focus:ring-[#0A2647]"
                        placeholder="Enter primary contact"
                        maxLength={10}
                      />
                      {errors.primary_contact && (
                        <p className="mt-1 text-sm text-red-500">{errors.primary_contact}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium">
                        Secondary Contact
                      </label>
                      <input
                        type="tel"
                        name="secondary_contact"
                        value={formData.secondary_contact}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#0A2647] focus:ring-[#0A2647]"
                        placeholder="Enter secondary contact (optional)"
                        maxLength={10}
                      />
                      {errors.secondary_contact && (
                        <p className="mt-1 text-sm text-red-500">{errors.secondary_contact}</p>
                      )}
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium">
                        Request Details <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="details"
                        value={formData.details}
                        onChange={handleInputChange}
                        rows={4}
                        className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#0A2647] focus:ring-[#0A2647]"
                        placeholder="Please provide detailed information about your request..."
                      />
                      {errors.details && (
                        <p className="mt-1 text-sm text-red-500">{errors.details}</p>
                      )}
                    </div>
                  </div>

                  {/* Service-specific fields based on service type */}
{selectedService?.value === 'request_serial_number' && (
  <div className="space-y-4">
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium">
          Stolen Phone Number <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          name="phone_number"
          value={formData.phone_number}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#0A2647] focus:ring-[#0A2647]"
          placeholder="Enter phone number"
          maxLength={10}
        />
      </div>

      <div>
        <label className="block text-sm font-medium">
          Date Range <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="date_range"
          value={formData.date_range}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#0A2647] focus:ring-[#0A2647]"
          placeholder="Select date range"
          onFocus={(e) => e.target.type = 'date'}
        />
      </div>

      <div>
        <label className="block text-sm font-medium">
          Phone Model <span className="text-red-500">*</span>
        </label>
        <select
          name="phone_model"
          value={formData.phone_model}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#0A2647] focus:ring-[#0A2647]"
        >
          <option value="">Select phone model</option>
          {phoneModels.map(model => (
            <option key={model} value={model}>{model}</option>
          ))}
        </select>
      </div>
    </div>

    <div>
      <label className="block text-sm font-medium">
        Additional Details
      </label>
      <textarea
        name="details"
        value={formData.details}
        onChange={handleInputChange}
        rows={4}
        className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#0A2647] focus:ring-[#0A2647]"
        placeholder="Enter any additional details (optional)"
      />
    </div>
  </div>
)}
                  {selectedService?.value === 'check_stolen_phone' && (
  <div className="space-y-4">
    <div className="space-y-4">
      {imeiList.map((item, index) => (
        <div key={item.id} className="flex items-center space-x-2">
          <div className="flex-1">
            <label className="block text-sm font-medium">
              IMEI {index + 1} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={item.imei}
              onChange={(e) => handleImeiChange(item.id, e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#0A2647] focus:ring-[#0A2647]"
              placeholder="Enter IMEI number"
              maxLength={15}
            />
          </div>
          {imeiList.length > 1 && (
            <Button
              type="button"
              variant="outline"
              className="mt-6"
              onClick={() => handleRemoveImei(item.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={handleAddImei}
        className="w-full"
      >
        Add Another IMEI
      </Button>
    </div>

    <div>
      <label className="block text-sm font-medium">
        Date Range <span className="text-red-500">*</span>
      </label>
      <input
        type="text"
        name="date_range"
        value={formData.date_range}
        onChange={handleInputChange}
        className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#0A2647] focus:ring-[#0A2647]"
        placeholder="Select date range"
        onFocus={(e) => e.target.type = 'date'}
      />
    </div>

    <div>
      <label className="block text-sm font-medium">
        Additional Details
      </label>
      <textarea
        name="details"
        value={formData.details}
        onChange={handleInputChange}
        rows={4}
        className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#0A2647] focus:ring-[#0A2647]"
        placeholder="Enter any additional details (optional)"
      />
    </div>
  </div>
)}

                  {selectedService?.value === 'unblock_momo' && (
  <div className="space-y-4">
    <div>
      <label className="block text-sm font-medium">
        Blocked MoMo/MoMoPay Number <span className="text-red-500">*</span>
      </label>
      <input
        type="tel"
        name="blocked_number"
        value={formData.blocked_number}
        onChange={handleInputChange}
        className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#0A2647] focus:ring-[#0A2647]"
        placeholder="Enter blocked number"
        maxLength={10}
      />
    </div>

    <div>
      <label className="block text-sm font-medium">
        Additional Details
      </label>
      <textarea
        name="details"
        value={formData.details}
        onChange={handleInputChange}
        rows={4}
        className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#0A2647] focus:ring-[#0A2647]"
        placeholder="Enter any additional details (optional)"
      />
    </div>
  </div>
)}
                  

{selectedService?.value === 'money_refund' && (
  <div className="space-y-4">
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium">
          Amount <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          name="amount"
          value={formData.amount}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#0A2647] focus:ring-[#0A2647]"
          placeholder="Enter amount"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">
          Storage Number <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          name="storage_number"
          value={formData.storage_number}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#0A2647] focus:ring-[#0A2647]"
          placeholder="Enter number where amount is stored"
          maxLength={10}
        />
      </div>

      <div className="sm:col-span-2">
        <label className="block text-sm font-medium">
          Date Range <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          name="date_range"
          value={formData.date_range}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#0A2647] focus:ring-[#0A2647]"
        />
      </div>
    </div>

    <div>
      <label className="block text-sm font-medium">
        Additional Details
      </label>
      <textarea
        name="details"
        value={formData.details}
        onChange={handleInputChange}
        rows={4}
        className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#0A2647] focus:ring-[#0A2647]"
        placeholder="Enter any additional details (optional)"
      />
    </div>
  </div>
)}

{selectedService?.value === 'backoffice_appointment' && (
  <div className="space-y-4">
    <div>
      <label className="block text-sm font-medium">
        Select Backoffice User <span className="text-red-500">*</span>
      </label>
      <select
        name="backoffice_user"
        value={formData.backoffice_user}
        onChange={handleInputChange}
        className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#0A2647] focus:ring-[#0A2647]"
      >
        <option value="">Select a backoffice user</option>
        {backofficeUsers.map(user => (
          <option key={user.id} value={user.id}>
            {user.full_names}
          </option>
        ))}
      </select>
    </div>

    <div>
      <label className="block text-sm font-medium">
        Additional Details
      </label>
      <textarea
        name="details"
        value={formData.details}
        onChange={handleInputChange}
        rows={4}
        className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#0A2647] focus:ring-[#0A2647]"
        placeholder="Enter any additional details (optional)"
      />
    </div>
  </div>
)}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t">
                    <Button 
                      onClick={handlePrint}
                      variant="outline"
                      className="w-full sm:w-auto"
                    >
                      <Printer className="w-4 h-4 mr-2" />
                      Print
                    </Button>

                    <Button 
                      onClick={handleReset}
                      variant="outline"
                      className="w-full sm:w-auto"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Reset
                    </Button>

                    <Button 
                      onClick={handleSubmit}
                      disabled={isLoading}
                      className="w-full sm:w-auto bg-[#0A2647] hover:bg-[#0A2647]/90 text-white"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Submit
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Message */}
      {message.type === 'success' && (
        <SuccessPopup
          message={message.text}
          onClose={() => {
            setMessage({ type: '', text: '' })
            handleReset()
          }}
        />
      )}

      {/* Error Message */}
      {message.type === 'error' && (
        <Alert variant="destructive" className="mt-6">
          <AlertCircle className="h-4 h-4" />
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}

export default SecurityServiceRequest
