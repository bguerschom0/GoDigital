// src/pages/stakeholder/NewRequest.jsx
import { AdminLayout } from '@/components/layout'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Save, RefreshCw, AlertCircle, CheckCircle, ChevronRight, ChevronLeft } from 'lucide-react'
import { useState } from 'react'
import { supabase } from '@/config/supabase'

const steps = [
  { id: 1, title: 'Basic Information', description: 'Reference and date details' },
  { id: 2, title: 'Request Details', description: 'Sender and subject information' },
  { id: 3, title: 'Description', description: 'Detailed request information' },
  { id: 4, title: 'Response', description: 'Status and response details' }
]

const senderOptions = ["NPPA", "RIB", "MPG", "Private Advocate", "Other"]
const subjectOptions = [
  "Account Unblock", "MoMo Transaction", "Call History", "Reversal",
  "MoMo Transaction & Call History", "Account Information", "Account Status",
  "Balance", "Other"
]
const statusOptions = ["Pending", "Answered"]
const answeredByOptions = ["bigirig", "isimbie", "niragit", "nkomatm", "tuyisec"]

// Rest of your NewRequest component code remains the same, just wrap the return with AdminLayout

const NewRequest = () => {
    const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    dateReceived: '',
    referenceNumber: '',
    sender: '',
    otherSender: '',
    subject: '',
    otherSubject: '',
    status: 'Pending',
    responseDate: '',
    answeredBy: '',
    description: ''
  });
  const [errors, setErrors] = useState({});
  const [showOtherSender, setShowOtherSender] = useState(false);
  const [showOtherSubject, setShowOtherSubject] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'sender') {
      setShowOtherSender(value === 'Other');
    }
    if (name === 'subject') {
      setShowOtherSubject(value === 'Other');
    }

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep = (step) => {
    const stepErrors = {};
    
    switch (step) {
      case 1:
        if (!formData.dateReceived) stepErrors.dateReceived = 'Date is required';
        if (!formData.referenceNumber) stepErrors.referenceNumber = 'Reference number is required';
        break;
      case 2:
        if (!formData.sender) stepErrors.sender = 'Sender is required';
        if (formData.sender === 'Other' && !formData.otherSender) {
          stepErrors.otherSender = 'Please specify other sender';
        }
        if (!formData.subject) stepErrors.subject = 'Subject is required';
        if (formData.subject === 'Other' && !formData.otherSubject) {
          stepErrors.otherSubject = 'Please specify other subject';
        }
        break;
      case 3:
        if (!formData.description || formData.description.length < 10) {
          stepErrors.description = 'Description must be at least 10 characters';
        }
        break;
      default:
        break;
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(currentStep)) return;

    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1);
      return;
    }

  setIsLoading(true);
  try {
    const requestData = {
      reference_number: formData.referenceNumber,
      date_received: formData.dateReceived,
      sender: formData.sender === 'Other' ? formData.otherSender : formData.sender,
      subject: formData.subject === 'Other' ? formData.otherSubject : formData.subject,
      description: formData.description,
      status: 'Pending', // Default to Pending for new requests
      created_at: new Date().toISOString()
    };

const { data, error } = await supabase
      .from('stakeholder_requests')
      .insert([requestData])
      .select();

    if (error) throw error;

    setMessage({
      type: 'success',
      text: 'Request saved successfully!'
    });
    
    handleReset();
  } catch (error) {
    console.error('Submission error:', error);
    setMessage({
      type: 'error',
      text: `Error: ${error.message || 'Failed to save request'}`
    });
  } finally {
    setIsLoading(false);
  }
};

  const handleReset = () => {
    setFormData({
      dateReceived: '',
      referenceNumber: '',
      sender: '',
      otherSender: '',
      subject: '',
      otherSubject: '',
      status: 'Pending',
      responseDate: '',
      answeredBy: '',
      description: ''
    });
    setShowOtherSender(false);
    setShowOtherSubject(false);
    setErrors({});
    setMessage({ type: '', text: '' });
    setCurrentStep(1);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <motion.div className="space-y-2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <label className="block text-sm font-medium text-gray-700">Date Received *</label>
              <div className="relative">
                <input
                  type="date"
                  name="dateReceived"
                  value={formData.dateReceived}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500
                            ${errors.dateReceived ? 'border-red-300' : 'border-gray-200'}`}
                  required
                />
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
              {errors.dateReceived && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-500 mt-1">
                  {errors.dateReceived}
                </motion.p>
              )}
            </motion.div>

            <motion.div className="space-y-2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <label className="block text-sm font-medium text-gray-700">Reference Number *</label>
              <input
                type="text"
                name="referenceNumber"
                value={formData.referenceNumber}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500
                          ${errors.referenceNumber ? 'border-red-300' : 'border-gray-200'}`}
                required
              />
              {errors.referenceNumber && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-500 mt-1">
                  {errors.referenceNumber}
                </motion.p>
              )}
            </motion.div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <motion.div className="space-y-2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <label className="block text-sm font-medium text-gray-700">Sender *</label>
              <select
                name="sender"
                value={formData.sender}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500
                          ${errors.sender ? 'border-red-300' : 'border-gray-200'}`}
                required
              >
                <option value="">Select Sender</option>
                {senderOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              {errors.sender && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-500 mt-1">
                  {errors.sender}
                </motion.p>
              )}
            </motion.div>

            {showOtherSender && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                <label className="block text-sm font-medium text-gray-700">Other Sender *</label>
                <input
                  type="text"
                  name="otherSender"
                  value={formData.otherSender}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500
                            ${errors.otherSender ? 'border-red-300' : 'border-gray-200'}`}
                  required={showOtherSender}
                />
                {errors.otherSender && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-500 mt-1">
                    {errors.otherSender}
                  </motion.p>
                )}
              </motion.div>
            )}

            <motion.div className="space-y-2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <label className="block text-sm font-medium text-gray-700">Subject *</label>
              <select
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500
                          ${errors.subject ? 'border-red-300' : 'border-gray-200'}`}
                required
              >
                <option value="">Select Subject</option>
                {subjectOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              {errors.subject && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-500 mt-1">
                  {errors.subject}
                </motion.p>
              )}
            </motion.div>

            {showOtherSubject && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                <label className="block text-sm font-medium text-gray-700">Other Subject *</label>
                <input
                  type="text"
                  name="otherSubject"
                  value={formData.otherSubject}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500
                            ${errors.otherSubject ? 'border-red-300' : 'border-gray-200'}`}
                  required={showOtherSubject}
                />
                {errors.otherSubject && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-500 mt-1">
                    {errors.otherSubject}
                  </motion.p>
                )}
              </motion.div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <motion.div className="space-y-2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <label className="block text-sm font-medium text-gray-700">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={6}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500
                          ${errors.description ? 'border-red-300' : 'border-gray-200'}`}
                required
              />
              {errors.description && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-500 mt-1">
                  {errors.description}
                </motion.p>
              )}
            </motion.div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <motion.div className="space-y-2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <label className="block text-sm font-medium text-gray-700">Response Date</label>
              <div className="relative">
                <input
                  type="date"
                  name="responseDate"
                  value={formData.responseDate}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </motion.div>

            <motion.div className="space-y-2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <label className="block text-sm font-medium text-gray-700">Status *</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              >
                {statusOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </motion.div>

            <motion.div className="space-y-2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <label className="block text-sm font-medium text-gray-700">Answered By</label>
              <select
                name="answeredBy"
                value={formData.answeredBy}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Select Person</option>
                {answeredByOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </motion.div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex flex-col items-center ${index !== steps.length - 1 ? 'w-full' : ''}`}>
                <div className={`flex items-center justify-center w-10 h-10 rounded-full 
                  ${currentStep >= step.id ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-600'}
                  transition-colors duration-200`}>
                  {currentStep > step.id ? (
                    <CheckCircle className="h-6 w-6" />
                  ) : (
                    <span>{step.id}</span>
                  )}
                </div>
                <div className="mt-2 text-center">
                  <div className="text-sm font-medium text-gray-900">{step.title}</div>
                  <div className="text-xs text-gray-500">{step.description}</div>
                </div>
              </div>
              {index !== steps.length - 1 && (
                <div className={`w-full h-1 mx-4 ${currentStep > step.id ? 'bg-emerald-500' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800">
            {steps[currentStep - 1].title}
          </h2>
          <p className="text-sm text-gray-500">
            {steps[currentStep - 1].description}
          </p>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit}>
            {renderStepContent()}

            <AnimatePresence>
              {message.text && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`p-4 rounded-lg flex items-center space-x-2 mt-6 ${
                    message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                  }`}
                >
                  <AlertCircle className="h-5 w-5" />
                  <span>{message.text}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex justify-between mt-8">
              <button
                type="button"
                onClick={() => currentStep > 1 && setCurrentStep(prev => prev - 1)}
                className={`px-6 py-2 flex items-center space-x-2 rounded-lg transition-colors ${
                  currentStep === 1
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50'
                }`}
                disabled={currentStep === 1}
              >
                <ChevronLeft className="h-5 w-5" />
                <span>Previous</span>
              </button>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-6 py-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 
                           rounded-lg transition-colors flex items-center space-x-2"
                >
                  <RefreshCw className="h-5 w-5" />
                  <span>Reset</span>
                </button>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 
                            transition-colors flex items-center space-x-2 ${
                              isLoading ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                >
                  {currentStep === steps.length ? (
                    <>
                      <Save className="h-5 w-5" />
                      <span>{isLoading ? 'Saving...' : 'Submit'}</span>
                    </>
                  ) : (
                    <>
                      <span>Next</span>
                      <ChevronRight className="h-5 w-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
      </AdminLayout>
  );
};
    
export default NewRequest
