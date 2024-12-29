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
  CardContent,
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
    let permissionPath;
    
    // Check if user is accessing from admin or user routes
    if (window.location.pathname.includes('/admin/')) {
      permissionPath = '/admin/security_services/security_service_request';
    } else {
      permissionPath = '/security_services/security_service_request';
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
}, [checkPermission, navigate, user])

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
    { 
      value: 'check_number_online', 
      label: 'Request to look if the number is on Air',
      description: 'Check if a phone number is currently active',
      fields: [
        { 
          name: 'incident_date', 
          type: 'date', 
          label: 'Date of Incident'
        },
        { 
          name: 'imei', 
          type: 'text', 
          label: 'IMEI Number',
          maxLength: 15,
          placeholder: 'Enter 15-digit IMEI number'
        }
      ]
    },
    { 
      value: 'unblock_number', 
      label: 'Request to unblock Number/MoMo Account',
      description: 'Get assistance with unblocking your number or mobile money account',
      fields: [
        { 
          name: 'phone_number', 
          type: 'tel', 
          label: 'Phone Number',
          placeholder: 'Enter blocked number',
          maxLength: 10
        },
        { 
          name: 'details', 
          type: 'textarea', 
          label: 'Details',
          placeholder: 'Provide additional information'
        }
      ]
    },
    { 
      value: 'money_refund', 
      label: 'Request Money Refund',
      description: 'Request assistance for money refund transactions',
      fields: [
        { 
          name: 'from_phone', 
          type: 'tel', 
          label: 'Source Phone Number',
          maxLength: 10,
          placeholder: 'Enter sender number'
        },
        { 
          name: 'to_phone', 
          type: 'tel', 
          label: 'Destination Phone Number',
          maxLength: 10,
          placeholder: 'Enter receiver number'
        },
        { 
          name: 'incident_date', 
          type: 'date', 
          label: 'Date of Incident'
        },
        { 
          name: 'details', 
          type: 'textarea', 
          label: 'Detailed Description',
          placeholder: 'Explain what happened'
        }
      ]
    },
    { 
      value: 'other_issues', 
      label: 'Other Issues',
      description: 'Report any other security-related concerns',
      fields: [
        { 
          name: 'details', 
          type: 'textarea', 
          label: 'Describe Your Issue',
          placeholder: 'Provide details of your issue'
        }
      ]
    }
  ]

  // ... handleServiceChange, handleInputChange, validateForm remain the same ...

  // Updated render method
  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Security Service Request</CardTitle>
          <p className="text-sm text-gray-500 mt-2">
            Select a service type and fill in the required information
          </p>
        </CardHeader>

        <CardContent>
          <div className="space-y-6">
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

            {/* Action Buttons */}
            {selectedService && (
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
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
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
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
              </div>
            )}
          </div>
        </CardContent>
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
