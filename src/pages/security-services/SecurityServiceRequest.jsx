import React, { useState } from 'react'
import { supabase } from '@/config/supabase'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { 
  Save, 
  Printer, 
  RefreshCw 
} from 'lucide-react'
import { usePageAccess } from '@/hooks/usePageAccess'

const SecurityServiceRequest = () => {
  const { user } = useAuth()
  
  const [selectedService, setSelectedService] = useState('')
  const [formData, setFormData] = useState({})
  const [errors, setErrors] = useState({})

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

  const phoneModels = [
    'iPhone', 'Samsung', 'Techno', 'Infinix', 
    'Xiaomi', 'Itel', 'Nokia', 'Huawei'
  ]

  const services = [
    { 
      value: 'request_serial_number', 
      label: 'Request Serial Number of Stolen phone',
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
          label: 'Date' 
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
          maxLength: 15
        }
      ]
    },
    { 
      value: 'unblock_number', 
      label: 'Request to unblock Number/MoMo Account',
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
      fields: [
        { 
          name: 'from_phone', 
          type: 'tel', 
          label: 'Source Phone Number',
          maxLength: 10
        },
        { 
          name: 'to_phone', 
          type: 'tel', 
          label: 'Destination Phone Number',
          maxLength: 10
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

  const handleServiceChange = (e) => {
    const service = e.target.value
    setSelectedService(service)
    setFormData({})
    setErrors({})
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const validateForm = () => {
    const newErrors = {}
    const currentService = services.find(s => s.value === selectedService)
    
    if (currentService) {
      currentService.fields.forEach(field => {
        if (!formData[field.name]) {
          newErrors[field.name] = `${field.label} is required`
        }
      })
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!selectedService) {
      setErrors({ service: 'Please select a service' })
      return
    }

    if (!validateForm()) return

    try {
      const { data, error } = await supabase
        .from('service_requests')
        .insert([{
          service_type: selectedService,
          client_details: JSON.stringify(formData),
          created_by: user.id,
          status: 'Pending'
        }])
        .select()

      if (error) throw error

      // Reset form or navigate
      setSelectedService('')
      setFormData({})
      setErrors({})
    } catch (error) {
      console.error('Submission error:', error)
    }
  }

  const renderServiceFields = () => {
    const currentService = services.find(s => s.value === selectedService)
    if (!currentService) return null

    return currentService.fields.map(field => (
      <div key={field.name} className="mb-4">
        <label className="block text-sm font-medium text-gray-700">
          {field.label}
        </label>
        {field.type === 'select' ? (
          <select
            name={field.name}
            value={formData[field.name] || ''}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border rounded-lg"
          >
            <option value="" disabled>Select {field.label}</option>
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
            className="w-full px-4 py-3 border rounded-lg"
          />
        ) : (
          <input
            type={field.type}
            name={field.name}
            value={formData[field.name] || ''}
            onChange={handleInputChange}
            placeholder={field.placeholder}
            maxLength={field.maxLength}
            className="w-full px-4 py-3 border rounded-lg"
          />
        )}
        {errors[field.name] && (
          <p className="text-red-500 text-sm mt-1">{errors[field.name]}</p>
        )}
      </div>
    ))
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-6">Security Service Request</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Select Service
          </label>
          <select
            value={selectedService}
            onChange={handleServiceChange}
            className="w-full px-4 py-3 border rounded-lg"
          >
            <option value="" disabled>Select a service</option>
            {services.map(service => (
              <option key={service.value} value={service.value}>
                {service.label}
              </option>
            ))}
          </select>
          {errors.service && (
            <p className="text-red-500 text-sm mt-1">{errors.service}</p>
          )}
        </div>

        {selectedService && renderServiceFields()}

        {selectedService && (
          <div className="flex space-x-4 mt-6">
            <Button 
              onClick={() => {
                setSelectedService('')
                setFormData({})
                setErrors({})
              }}
              variant="outline"
              className="flex-1"
            >
              <RefreshCw className="mr-2 h-4 w-4" /> Reset
            </Button>
            <Button 
              onClick={handleSubmit}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              <Save className="mr-2 h-4 w-4" /> Submit
            </Button>
            <Button 
              variant="outline"
              className="flex-1"
            >
              <Printer className="mr-2 h-4 w-4" /> Print
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}

export default SecurityServiceRequest
