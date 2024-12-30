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
  ChevronLeft,
  Shield,
  Calendar,
  Wallet,
  XCircle,
  Plus,
  History,
  Mail,
  Users,
  Wifi,
  BadgeHelp,
  PhoneCall
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
    value: 'rib_followup', 
    label: 'Followup on RIB Request',
    description: 'Track RIB request status',
    icon: <BadgeHelp className="w-4 h-4" />
  },
  { 
    value: 'call_history', 
    label: 'Call History',
    description: 'Request call history details',
    icon: <History className="w-4 h-4" />
  },
  { 
    value: 'momo_transaction', 
    label: 'MoMo Transaction',
    description: 'Check MoMo transaction details',
    icon: <Wallet className="w-4 h-4" />
  },
  { 
    value: 'agent_commission', 
    label: 'Agent Commission',
    description: 'Agent commission request',
    icon: <Users className="w-4 h-4" />
  },
  { 
    value: 'unblock_call', 
    label: 'Unblock Blocked Number for Calling',
    description: 'Unblock numbers for calling',
    icon: <PhoneCall className="w-4 h-4" />
  },
  { 
    value: 'internet_issue', 
    label: 'Internet Issue',
    description: 'Report internet connectivity issues',
    icon: <Wifi className="w-4 h-4" />
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
  const [blockedNumbers, setBlockedNumbers] = useState([{ number: '', id: Date.now() }])
  const handleAddNumber = () => {
  setBlockedNumbers([...blockedNumbers, { number: '', id: Date.now() }])
}
  const handleNumberChange = (id, value) => {
  const updatedList = blockedNumbers.map(item => 
    item.id === id ? { ...item, number: value } : item
  )
  setBlockedNumbers(updatedList)
}
  const handleRemoveNumber = (id) => {
  if (blockedNumbers.length > 1) {
    setBlockedNumbers(blockedNumbers.filter(item => item.id !== id))
  }
}
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
  imei_list: [],
      rib_station: '',
  rib_helper_number: '',
  email: '',
  franchisee: '',
  start_date: '',
  end_date: '',
  blocked_numbers: [],
  service_number: ''
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
      .select('id, fullname') // Updated to use fullname field
      .eq('status', 'active')
      .order('fullname')

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

  // Common validations
  if (!formData.full_names) newErrors.full_names = 'Full names are required'
  if (!formData.id_passport) newErrors.id_passport = 'ID/Passport is required'
  if (!formData.primary_contact) newErrors.primary_contact = 'Primary contact is required'

  // Service-specific validations
  switch (selectedService?.value) {
    case 'rib_followup':
      if (!formData.service_number) newErrors.service_number = 'Number is required'
      if (!formData.rib_station) newErrors.rib_station = 'RIB station is required'
      if (!formData.details) newErrors.details = 'Additional information is required'
      break;

    case 'call_history':
      if (!formData.service_number) newErrors.service_number = 'Number is required'
      if (!formData.start_date) newErrors.start_date = 'Start date is required'
      if (!formData.end_date) newErrors.end_date = 'End date is required'
      if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Invalid email format'
      }
      break;

    case 'momo_transaction':
      if (!formData.service_number) newErrors.service_number = 'Number is required'
      if (!formData.start_date) newErrors.start_date = 'Start date is required'
      if (!formData.end_date) newErrors.end_date = 'End date is required'
      if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Invalid email format'
      }
      break;

    case 'agent_commission':
      if (!formData.service_number) newErrors.service_number = 'Number is required'
      if (!formData.franchisee) newErrors.franchisee = 'Franchisee is required'
      if (!formData.details) newErrors.details = 'Additional information is required'
      break;

    case 'unblock_call':
      if (blockedNumbers.length === 0) {
        newErrors.blocked_numbers = 'At least one number is required'
      }
      if (!blockedNumbers.every(item => item.number)) {
        newErrors.blocked_numbers = 'All number fields must be filled'
      }
      if (!formData.details) newErrors.details = 'Additional information is required'
      break;

    case 'internet_issue':
      if (!formData.service_number) newErrors.service_number = 'Number is required'
      if (!formData.details) newErrors.details = 'Additional information is required'
      break;
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

  const ServiceCarousel = ({ services, onSelect }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const nextService = () => {
    if (!isAnimating) {
      setIsAnimating(true);
      setActiveIndex((prev) => (prev + 1) % services.length);
      setTimeout(() => setIsAnimating(false), 300);
    }
  };

  const prevService = () => {
    if (!isAnimating) {
      setIsAnimating(true);
      setActiveIndex((prev) => (prev - 1 + services.length) % services.length);
      setTimeout(() => setIsAnimating(false), 300);
    }
  };
    return (
    <div className="relative w-full max-w-xl mx-auto">
      <div className="overflow-hidden rounded-lg bg-white">
        <div className="relative h-[400px]">
          {/* Main Card */}
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="absolute inset-0 p-6"
          >
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6 bg-[#0A2647]/5 rounded-lg p-8">
              <div className="p-4 rounded-full bg-[#0A2647]/10">
                {services[activeIndex].icon}
              </div>
              <h3 className="text-xl font-semibold text-[#0A2647]">
                {services[activeIndex].label}
              </h3>
              <p className="text-gray-600">
                {services[activeIndex].description}
              </p>
              <Button 
                onClick={() => onSelect(services[activeIndex])}
                className="bg-[#0A2647] hover:bg-[#0A2647]/90 text-white mt-4"
              >
                Select Service
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Navigation Buttons */}
        <Button
          variant="ghost"
          onClick={prevService}
          className="absolute left-2 top-1/2 -translate-y-1/2"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <Button
          variant="ghost"
          onClick={nextService}
          className="absolute right-2 top-1/2 -translate-y-1/2"
        >
          <ChevronRight className="h-6 w-6" />
        </Button>

        {/* Dots Navigation */}
        <div className="absolute bottom-4 left-0 right-0">
          <div className="flex justify-center space-x-2">
            {services.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`h-2 w-2 rounded-full transition-colors ${
                  index === activeIndex 
                    ? 'bg-[#0A2647]' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};


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
{!showPersonalInfo && (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3 }}
  >
    <Card className="overflow-visible">
      <CardHeader>
        <CardTitle>Select Service Type</CardTitle>
        <p className="text-sm text-gray-500">Choose the service you need assistance with</p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          {services.map((service, index) => (
            <motion.div
              key={service.value}
              className="relative"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <button
                onClick={() => handleServiceSelect(service)}
                className="w-full group"
              >
                <div className="flex items-center relative">
                  {/* Connection Line */}
                  {index < services.length - 1 && (
                    <div className="absolute left-6 top-full w-0.5 h-4 bg-gray-200" />
                  )}
                  
                  {/* Service Button */}
                  <div className="flex items-center w-full p-4 rounded-lg border border-gray-200 
                    hover:border-[#0A2647] hover:bg-[#0A2647]/5 transition-all gap-4 group-hover:shadow-md">
                    
                    {/* Icon Circle */}
                    <div className="w-12 h-12 rounded-full bg-[#0A2647]/10 flex items-center 
                      justify-center group-hover:bg-[#0A2647] group-hover:text-white transition-colors">
                      {service.icon}
                    </div>

                    {/* Service Info */}
                    <div className="flex flex-col items-start">
                      <span className="font-medium text-gray-900">{service.label}</span>
                      <span className="text-sm text-gray-500">{service.description}</span>
                    </div>

                    {/* Arrow */}
                    <ChevronRight className="w-5 h-5 ml-auto text-gray-400 
                      group-hover:text-[#0A2647] group-hover:transform group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </button>
            </motion.div>
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
              <XCircle className="h-4 w-4" />
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

                  {/* RIB Followup */}
{selectedService?.value === 'rib_followup' && (
  <div className="space-y-4">
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium">
          Number <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          name="service_number"
          value={formData.service_number}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#0A2647] focus:ring-[#0A2647]"
          placeholder="Enter number"
          maxLength={10}
        />
      </div>

      <div>
        <label className="block text-sm font-medium">
          RIB Station <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="rib_station"
          value={formData.rib_station}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#0A2647] focus:ring-[#0A2647]"
          placeholder="Enter RIB station"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">
          RIB Helper Number
        </label>
        <input
          type="tel"
          name="rib_helper_number"
          value={formData.rib_helper_number}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#0A2647] focus:ring-[#0A2647]"
          placeholder="Enter RIB helper number (optional)"
          maxLength={10}
        />
      </div>
    </div>

    <div>
      <label className="block text-sm font-medium">
        Additional Information <span className="text-red-500">*</span>
      </label>
      <textarea
        name="details"
        value={formData.details}
        onChange={handleInputChange}
        rows={4}
        className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#0A2647] focus:ring-[#0A2647]"
        placeholder="Enter additional information"
      />
    </div>
  </div>
)}

{/* Call History */}
{selectedService?.value === 'call_history' && (
  <div className="space-y-4">
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium">
          Number <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          name="service_number"
          value={formData.service_number}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#0A2647] focus:ring-[#0A2647]"
          placeholder="Enter number"
          maxLength={10}
        />
      </div>

            <div>
        <label className="block text-sm font-medium">
          Email
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#0A2647] focus:ring-[#0A2647]"
          placeholder="Enter email (optional)"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">
          Start Date <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          name="start_date"
          value={formData.start_date}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#0A2647] focus:ring-[#0A2647]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">
          End Date <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          name="end_date"
          value={formData.end_date}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#0A2647] focus:ring-[#0A2647]"
        />
      </div>
    </div>

    <div>
      <label className="block text-sm font-medium">
        Additional Information
      </label>
      <textarea
        name="details"
        value={formData.details}
        onChange={handleInputChange}
        rows={4}
        className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#0A2647] focus:ring-[#0A2647]"
        placeholder="Enter additional information (optional)"
      />
    </div>
  </div>
)}

{/* MoMo Transaction */}
{selectedService?.value === 'momo_transaction' && (
  <div className="space-y-4">
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium">
          Number <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          name="service_number"
          value={formData.service_number}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#0A2647] focus:ring-[#0A2647]"
          placeholder="Enter number"
          maxLength={10}
        />
      </div>

      <div>
        <label className="block text-sm font-medium">
          Email
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#0A2647] focus:ring-[#0A2647]"
          placeholder="Enter email (optional)"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">
          Start Date <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          name="start_date"
          value={formData.start_date}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#0A2647] focus:ring-[#0A2647]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">
          End Date <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          name="end_date"
          value={formData.end_date}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#0A2647] focus:ring-[#0A2647]"
        />
      </div>
    </div>

    <div>
      <label className="block text-sm font-medium">
        Additional Information
      </label>
      <textarea
        name="details"
        value={formData.details}
        onChange={handleInputChange}
        rows={4}
        className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#0A2647] focus:ring-[#0A2647]"
        placeholder="Enter additional information (optional)"
      />
    </div>
  </div>
)}

{/* Agent Commission */}
{selectedService?.value === 'agent_commission' && (
  <div className="space-y-4">
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium">
          Number <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          name="service_number"
          value={formData.service_number}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#0A2647] focus:ring-[#0A2647]"
          placeholder="Enter number"
          maxLength={10}
        />
      </div>

      <div>
        <label className="block text-sm font-medium">
          Franchisee <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="franchisee"
          value={formData.franchisee}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#0A2647] focus:ring-[#0A2647]"
          placeholder="Enter franchisee"
        />
      </div>
    </div>

    <div>
      <label className="block text-sm font-medium">
        Additional Information <span className="text-red-500">*</span>
      </label>
      <textarea
        name="details"
        value={formData.details}
        onChange={handleInputChange}
        rows={4}
        className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#0A2647] focus:ring-[#0A2647]"
        placeholder="Enter additional information"
      />
    </div>
  </div>
)}

                  {/* Unblock Blocked Number for Calling */}
{selectedService?.value === 'unblock_call' && (
  <div className="space-y-4">
    <div className="space-y-4">
      {blockedNumbers.map((item, index) => (
        <div key={item.id} className="flex items-center space-x-2">
          <div className="flex-1">
            <label className="block text-sm font-medium">
              Number {index + 1} <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={item.number}
              onChange={(e) => handleNumberChange(item.id, e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#0A2647] focus:ring-[#0A2647]"
              placeholder="Enter number"
              maxLength={10}
            />
          </div>
          {blockedNumbers.length > 1 && (
            <Button
              type="button"
              variant="outline"
              className="mt-6"
              onClick={() => handleRemoveNumber(item.id)}
            >
              <XCircle className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={handleAddNumber}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Another Number
      </Button>
    </div>

    <div>
      <label className="block text-sm font-medium">
        Additional Information <span className="text-red-500">*</span>
      </label>
      <textarea
        name="details"
        value={formData.details}
        onChange={handleInputChange}
        rows={4}
        className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#0A2647] focus:ring-[#0A2647]"
        placeholder="Enter additional information"
      />
    </div>
  </div>
)}

{/* Internet Issue */}
{selectedService?.value === 'internet_issue' && (
  <div className="space-y-4">
    <div>
      <label className="block text-sm font-medium">
        Number <span className="text-red-500">*</span>
      </label>
      <input
        type="tel"
        name="service_number"
        value={formData.service_number}
        onChange={handleInputChange}
        className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#0A2647] focus:ring-[#0A2647]"
        placeholder="Enter number"
        maxLength={10}
      />
    </div>

    <div>
      <label className="block text-sm font-medium">
        Additional Information <span className="text-red-500">*</span>
      </label>
      <textarea
        name="details"
        value={formData.details}
        onChange={handleInputChange}
        rows={4}
        className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#0A2647] focus:ring-[#0A2647]"
        placeholder="Enter additional information about the internet issue"
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
