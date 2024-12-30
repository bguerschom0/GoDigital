// src/pages/security-services/SecurityServiceRequest.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
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
  Mail,
  MapPin,
  FileText,
  Globe,
  Info
} from 'lucide-react'

// Success Message Component
const SuccessPopup = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
      window.location.reload()
    }, 10000) // 10 seconds auto-close

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
          <div className="bg-green-100 p-2 rounded-full">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-medium">Success</h3>
            <p className="text-gray-600 dark:text-gray-300">{message}</p>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <Button
            onClick={() => {
              onClose()
              window.location.reload()
            }}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Close
          </Button>
        </div>
      </motion.div>
    </div>
  )
}

const SecurityServiceRequest = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { checkPermission } = usePageAccess()
  
  const [formData, setFormData] = useState({
    // Personal Information
    full_names: '',
    id_passport: '',
    contact_number: '',
    email: '',
    current_address: '',
    nationality: '',
    gender: '',
    
    // Service Information
    service_type: '',
    details: '',
    file_attachments: [],
  })

  const [currentStep, setCurrentStep] = useState('personal')
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    const checkAccess = async () => {
      let permissionPath
      
      if (user?.role === 'admin') {
        permissionPath = '/admin/security_services/security_service_request'
      } else {
        permissionPath = '/security_services/security_service_request'
      }
      
      const { canAccess } = checkPermission(permissionPath)
      
      if (!canAccess) {
        if (user?.role === 'admin') {
          navigate('/admin/dashboard')
        } else {
          navigate('/user/dashboard')
        }
        return
      }
      setPageLoading(false)
    }
    
    checkAccess()
  }, [])

  const phoneModels = [
    'iPhone', 'Samsung', 'Techno', 'Infinix', 
    'Xiaomi', 'Itel', 'Nokia', 'Huawei'
  ]

  const services = [
    { 
      value: 'request_serial_number', 
      label: 'Request Serial Number of Stolen phone',
      description: 'Get help retrieving the serial number of your stolen phone',
      icon: <Phone className="h-5 w-5" />
    },
    { 
      value: 'check_number_online', 
      label: 'Request to look if the number is on Air',
      description: 'Check if a phone number is currently active',
      icon: <Globe className="h-5 w-5" />
    },
    { 
      value: 'unblock_number', 
      label: 'Request to unblock Number/MoMo Account',
      description: 'Get assistance with unblocking your number or mobile money account',
      icon: <RefreshCw className="h-5 w-5" />
    },
    { 
      value: 'money_refund', 
      label: 'Request Money Refund',
      description: 'Request assistance for money refund transactions',
      icon: <Save className="h-5 w-5" />
    },
    { 
      value: 'other_issues', 
      label: 'Other Issues',
      description: 'Report any other security-related concerns',
      icon: <Info className="h-5 w-5" />
    }
  ]

  const validatePersonalInfo = () => {
    const newErrors = {}
    
    if (!formData.full_names) newErrors.full_names = 'Full names are required'
    if (!formData.id_passport) newErrors.id_passport = 'ID/Passport is required'
    if (!formData.contact_number) newErrors.contact_number = 'Contact number is required'
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email address'
    }
    if (!formData.nationality) newErrors.nationality = 'Nationality is required'
    if (!formData.gender) newErrors.gender = 'Gender is required'
    if (!formData.current_address) newErrors.current_address = 'Current address is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateServiceInfo = () => {
    const newErrors = {}
    
    if (!formData.service_type) {
      newErrors.service_type = 'Please select a service type'
    }
    if (!formData.details) {
      newErrors.details = 'Please provide service details'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = async () => {
    if (!validatePersonalInfo() || !validateServiceInfo()) return

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
      contact_number: '',
      email: '',
      current_address: '',
      nationality: '',
      gender: '',
      service_type: '',
      details: '',
      file_attachments: []
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
    <div className="max-w-4xl mx-auto p-6">
      {/* Personal Information Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5 text-[#0A2647]" />
            <span>Personal Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Full Names <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="full_names"
                value={formData.full_names}
                onChange={handleInputChange}
                className="mt-1 w-full rounded-md border border-gray-300 shadow-sm focus:border-[#0A2647] focus:ring-[#0A2647]"
              />
              {errors.full_names && (
                <p className="mt-1 text-sm text-red-500">{errors.full_names}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                ID/Passport <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="id_passport"
                value={formData.id_passport}
                onChange={handleInputChange}
                className="mt-1 w-full rounded-md border border-gray-300 shadow-sm focus:border-[#0A2647] focus:ring-[#0A2647]"
              />
              {errors.id_passport && (
                <p className="mt-1 text-sm text-red-500">{errors.id_passport}</p>
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
                className="mt-1 w-full rounded-md border border-gray-300 shadow-sm focus:border-[#0A2647] focus:ring-[#0A2647]"
              />
              {errors.contact_number && (
                <p className="mt-1 text-sm text-red-500">{errors.contact_number}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="mt-1 w-full rounded-md border border-gray-300 shadow-sm focus:border-[#0A2647] focus:ring-[#0A2647]"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nationality <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nationality"
                value={formData.nationality}
                onChange={handleInputChange}
                className="mt-1 w-full rounded-md border border-gray-300 shadow-sm focus:border-[#0A2647] focus:ring-[#0A2647]"
              />
              {errors.nationality && (
                <p className="mt-1 text-sm text-red-500">{errors.nationality}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Gender <span className="text-red-500">*</span>
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="mt-1 w-full rounded-md border border-gray-300 shadow-sm focus:border-[#0A2647] focus:ring-[#0A2647]"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              {errors.gender && (
                <p className="mt-1 text-sm text-red-500">{errors.gender}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Current Address <span className="text-red-500">*</span>
              </label>
              <textarea
                name="current_address"
                value={formData.current_address}
                onChange={handleInputChange}
                rows={3}
                className="mt-1 w-full rounded-md border border-gray-300 shadow-sm focus:border-[#0A2647] focus:ring-[#0A2647]"
              />
              {errors.current_address && (
                <p className="mt-1 text-sm text-red-500">{errors.current_address}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service Selection Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-[#0A2647]" />
            <span>Service Selection</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Service Type <span className="text-red-500">*</span>
              </label>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((service) => (
                  <div
                    key={service.value}
                    onClick={() => handleInputChange({ target: { name: 'service_type', value: service.value } })}
                    className={`
                      cursor-pointer rounded-lg border p-4 transition-colors
                      ${formData.service_type === service.value
                        ? 'border-[#0A2647] bg-[#0A2647]/5'
                        : 'border-gray-200 hover:border-[#0A2647]/50'
                      }
                    `}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`
                        mt-0.5 p-2 rounded-lg
                        ${formData.service_type === service.value
                          ? 'bg-[#0A2647] text-white'
                          : 'bg-gray-100 text-gray-600'
                        }
                      `}>
                        {service.icon}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">
                          {service.label}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {service.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {errors.service_type && (
                <p className="mt-2 text-sm text-red-500">{errors.service_type}</p>
              )}
            </div>

            {/* Service Specific Fields */}
            {formData.service_type && (
              <div className="mt-6 space-y-4">
                {formData.service_type === 'request_serial_number' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Phone Model <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="phone_model"
                        value={formData.phone_model}
                        onChange={handleInputChange}
                        className="mt-1 w-full rounded-md border border-gray-300 shadow-sm focus:border-[#0A2647] focus:ring-[#0A2647]"
                      >
                        <option value="">Select phone model</option>
                        {phoneModels.map(model => (
                          <option key={model} value={model}>{model}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Date of Incident <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="incident_date"
                        value={formData.incident_date}
                        onChange={handleInputChange}
                        className="mt-1 w-full rounded-md border border-gray-300 shadow-sm focus:border-[#0A2647] focus:ring-[#0A2647]"
                      />
                    </div>
                  </>
                )}

                {formData.service_type === 'check_number_online' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      IMEI Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="imei"
                      value={formData.imei}
                      onChange={handleInputChange}
                      maxLength={15}
                      className="mt-1 w-full rounded-md border border-gray-300 shadow-sm focus:border-[#0A2647] focus:ring-[#0A2647]"
                      placeholder="Enter 15-digit IMEI number"
                    />
                  </div>
                )}

                {formData.service_type === 'money_refund' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Transaction Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="transaction_date"
                        value={formData.transaction_date}
                        onChange={handleInputChange}
                        className="mt-1 w-full rounded-md border border-gray-300 shadow-sm focus:border-[#0A2647] focus:ring-[#0A2647]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Transaction Amount <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="amount"
                        value={formData.amount}
                        onChange={handleInputChange}
                        className="mt-1 w-full rounded-md border border-gray-300 shadow-sm focus:border-[#0A2647] focus:ring-[#0A2647]"
                        placeholder="Enter amount"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Additional Details <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="details"
                    value={formData.details}
                    onChange={handleInputChange}
                    rows={4}
                    className="mt-1 w-full rounded-md border border-gray-300 shadow-sm focus:border-[#0A2647] focus:ring-[#0A2647]"
                    placeholder="Please provide detailed information about your request..."
                  />
                  {errors.details && (
                    <p className="mt-1 text-sm text-red-500">{errors.details}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-end gap-4">
        <Button 
          onClick={handleReset}
          variant="outline"
          className="w-full sm:w-auto"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Reset Form
        </Button>

        <Button 
          onClick={handlePrint}
          variant="outline"
          className="w-full sm:w-auto"
        >
          <Printer className="w-4 h-4 mr-2" />
          Print
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
              Submit Request
            </>
          )}
        </Button>
      </div>

      {/* Success Popup */}
      {message.type === 'success' && (
        <SuccessPopup
          message={message.text}
          onClose={() => {
            setMessage({ type: '', text: '' })
            handleReset()
          }}
        />
      )}

      {/* Error Alert */}
      {message.type === 'error' && (
        <Alert variant="destructive" className="mt-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}

export default SecurityServiceRequest
