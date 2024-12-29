import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '@/config/supabase'
import { useAuth } from '@/context/AuthContext'
import { usePageAccess } from '@/hooks/usePageAccess'
import { Button } from '@/components/ui/button'
import { 
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Save, 
  Printer, 
  RefreshCw,
  AlertCircle,
  Loader2,
  CheckCircle,
  Info
} from 'lucide-react'

// Success Popup Component
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
  
  const [selectedService, setSelectedService] = useState('')
  const [formData, setFormData] = useState({})
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [pageLoading, setPageLoading] = useState(true)

  useEffect(() => {
    const checkAccess = async () => {
      const { canAccess } = checkPermission('/security/request')
      
      if (!canAccess) {
        navigate(user?.role === 'admin' ? '/admin/dashboard' : '/dashboard')
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
      icon: 'Phone',
      fields: [
        { 
          name: 'phone_number', 
          type: 'tel', 
          label: 'Phone Number', 
          placeholder: 'Enter phone number',
          maxLength: 10
        },
        { 
          name: 'incident_date', 
          type: 'date', 
          label: 'Date of Incident' 
        },
        { 
          name: 'phone_model', 
          type: 'select', 
          label: 'Phone Model',
          options: phoneModels
        }
      ]
    },
    // ... rest of your services array
  ]

  const handleServiceChange = (e) => {
    const service = e.target.value
    setSelectedService(service)
    setFormData({})
    setErrors({})
    setMessage({ type: '', text: '' })
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

  const validateForm = () => {
    const newErrors = {}
    const currentService = services.find(s => s.value === selectedService)
    
    if (!selectedService) {
      newErrors.service = 'Please select a service'
    }
    
    if (currentService) {
      currentService.fields.forEach(field => {
        if (!formData[field.name]) {
          newErrors[field.name] = `${field.label} is required`
        } else if (field.type === 'tel' && formData[field.name].length !== 10) {
          newErrors[field.name] = 'Phone number must be 10 digits'
        }
      })
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
          service_type: selectedService,
          client_details: formData,
          created_by: user.id,
          status: 'Pending',
          created_at: new Date().toISOString()
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
    setSelectedService('')
    setFormData({})
    setErrors({})
    setMessage({ type: '', text: '' })
  }

  const renderServiceFields = () => {
    const currentService = services.find(s => s.value === selectedService)
    if (!currentService) return null

    return (
      <div className="space-y-6">
        <div className="border-b pb-4 mb-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {currentService.label}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {currentService.description}
          </p>
        </div>

        {currentService.fields.map(field => (
          <div key={field.name} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {field.label} <span className="text-red-500">*</span>
            </label>
            
            {field.type === 'select' ? (
              <select
                name={field.name}
                value={formData[field.name] || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
              >
                <option value="">Select {field.label}</option>
                {field.options.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            ) : field.type === 'textarea' ? (
              <textarea
                name={field.name}
                value={formData[field.name] || ''}
                onChange={handleInputChange}
                placeholder={field.placeholder}
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
              />
            ) : (
              <input
                type={field.type}
                name={field.name}
                value={formData[field.name] || ''}
                onChange={handleInputChange}
                placeholder={field.placeholder}
                maxLength={field.maxLength}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
              />
            )}
            
            {errors[field.name] && (
              <p className="text-sm text-red-500">{errors[field.name]}</p>
            )}
          </div>
        ))}
      </div>
    )
  }

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Security Service Request</CardTitle>
          <CardDescription>
            Select a service type and fill in the required information
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Service Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Select Service <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedService}
              onChange={handleServiceChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
            >
              <option value="">Select a service</option>
              {services.map(service => (
                <option key={service.value} value={service.value}>
                  {service.label}
                </option>
              ))}
            </select>
            {errors.service && (
              <p className="text-sm text-red-500">{errors.service}</p>
            )}
          </div>

          {/* Service Fields */}
          {selectedService && renderServiceFields()}

          {/* Messages */}
          {message.type === 'error' && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}
        </CardContent>

        {selectedService && (
          <CardFooter className="flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={handleReset}
              variant="outline"
              className="w-full sm:w-auto"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset
            </Button>
            
            <Button 
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Submit
                </>
              )}
            </Button>
            
            <Button 
              onClick={handlePrint}
              variant="outline"
              className="w-full sm:w-auto"
            >
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
          </CardFooter>
        )}
      </Card>

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
    </div>
  )
}

export default SecurityServiceRequest
