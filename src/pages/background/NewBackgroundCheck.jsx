import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  User, 
  Building, 
  Clock, 
  Loader2,
  RefreshCw,
  Save,
  AlertCircle
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/config/supabase';

const steps = [
  { 
    id: 1, 
    title: 'Basic Information', 
    description: 'Personal and identification details',
    requiredFields: ['full_names', 'citizenship', 'id_passport_number']
  },
  { 
    id: 2, 
    title: 'Department & Role', 
    description: 'Work placement information',
    requiredFields: ['department_id', 'role_type', 'role_id']
  },
  { 
    id: 3, 
    title: 'Additional Details', 
    description: 'Role specific information',
    requiredFields: [] // This will be dynamic based on role_type
  },
  { 
    id: 4, 
    title: 'Review', 
    description: 'Verify information',
    requiredFields: []
  }
];

const NewBackgroundCheck = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);
  const [filteredRoles, setFilteredRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const [formData, setFormData] = useState({
    full_names: '',
    citizenship: '',
    id_passport_number: '',
    passport_expiry_date: '',
    department_id: '',
    role_type: '',
    role_id: '',
    submitted_date: '',
    requested_by: '',
    from_company: '',
    duration: '',
    operating_country: '',
    date_start: '',
    date_end: '',
    work_with: '',
    status: 'pending'
  });

  // Fetch departments and roles
  useEffect(() => {
    const fetchDepartmentsAndRoles = async () => {
      try {
        const [deptResponse, rolesResponse] = await Promise.all([
          supabase.from('departments').select('*').eq('status', 'active'),
          supabase.from('roles').select('*').eq('status', 'active')
        ]);

        if (deptResponse.error) throw deptResponse.error;
        if (rolesResponse.error) throw rolesResponse.error;

        setDepartments(deptResponse.data);
        setRoles(rolesResponse.data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDepartmentsAndRoles();
  }, []);

  // Filter roles based on selected role_type
  useEffect(() => {
    if (formData.role_type) {
      const filtered = roles.filter(role => role.type === formData.role_type);
      setFilteredRoles(filtered);
    } else {
      setFilteredRoles([]);
    }
  }, [formData.role_type, roles]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear role_id when role_type changes
    if (name === 'role_type') {
      setFormData(prev => ({
        ...prev,
        role_id: ''
      }));
    }
  };

  const validateStep = (step) => {
    const currentStepData = steps[step - 1];
    const errors = [];
    
    // Add dynamic required fields for step 3 based on role_type
    if (step === 3) {
      if (['Staff', 'Apprentice', 'Expert'].includes(formData.role_type)) {
        currentStepData.requiredFields = ['submitted_date', 'requested_by'];
      } else if (['Contractor', 'Consultant'].includes(formData.role_type)) {
        currentStepData.requiredFields = ['duration', 'operating_country', 'from_company', 'submitted_date', 'requested_by'];
      } else if (formData.role_type === 'Internship') {
        currentStepData.requiredFields = ['date_start', 'date_end', 'work_with'];
      }
    }

    currentStepData.requiredFields.forEach(field => {
      if (!formData[field]) {
        errors.push(`${field.replace(/_/g, ' ').toUpperCase()} is required`);
      }
    });

    // Special validation for passport expiry date
    if (step === 1 && 
        formData.citizenship && 
        formData.citizenship.toLowerCase() !== 'rwanda' && 
        formData.citizenship.toLowerCase() !== 'rwandan' && 
        !formData.passport_expiry_date) {
      errors.push('Passport expiry date is required for non-Rwandan citizens');
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleReset = () => {
    setFormData({
      full_names: '',
      citizenship: '',
      id_passport_number: '',
      passport_expiry_date: '',
      department_id: '',
      role_type: '',
      role_id: '',
      submitted_date: '',
      requested_by: '',
      from_company: '',
      duration: '',
      operating_country: '',
      date_start: '',
      date_end: '',
      work_with: '',
      status: 'pending'
    });
    setCurrentStep(1);
    setValidationErrors([]);
  };

  const handleSubmit = async () => {
    if (currentStep < steps.length) {
      if (validateStep(currentStep)) {
        setCurrentStep(prev => prev + 1);
        setValidationErrors([]);
      }
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('background_checks')
        .insert([formData]);

      if (error) throw error;
      
      // Handle successful submission
      handleReset();
      // Add success notification here
    } catch (error) {
      console.error('Error submitting form:', error);
      setValidationErrors(['Failed to submit form. Please try again.']);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderValidationErrors = () => {
    if (validationErrors.length === 0) return null;

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
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Full Names *
              </label>
              <input
                type="text"
                name="full_names"
                value={formData.full_names}
                onChange={handleInputChange}
                className="mt-1 w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] dark:bg-gray-800 dark:border-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Citizenship *
              </label>
              <input
                type="text"
                name="citizenship"
                value={formData.citizenship}
                onChange={handleInputChange}
                className="mt-1 w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] dark:bg-gray-800 dark:border-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                ID/Passport Number *
              </label>
              <input
                type="text"
                name="id_passport_number"
                value={formData.id_passport_number}
                onChange={handleInputChange}
                className="mt-1 w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] dark:bg-gray-800 dark:border-gray-700"
              />
            </div>

            {(formData.citizenship.toLowerCase() !== 'rwanda' && 
              formData.citizenship.toLowerCase() !== 'rwandan') && formData.citizenship && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Passport Expiry Date *
                </label>
                <input
                  type="date"
                  name="passport_expiry_date"
                  value={formData.passport_expiry_date}
                  onChange={handleInputChange}
                  className="mt-1 w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] dark:bg-gray-800 dark:border-gray-700"
                />
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Department *
              </label>
              <select
                name="department_id"
                value={formData.department_id}
                onChange={handleInputChange}
                className="mt-1 w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] dark:bg-gray-800 dark:border-gray-700"
              >
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Role Type *
              </label>
              <select
                name="role_type"
                value={formData.role_type}
                onChange={handleInputChange}
                className="mt-1 w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] dark:bg-gray-800 dark:border-gray-700"
              >
                <option value="">Select Role Type</option>
                <option value="Staff">Staff</option>
                <option value="Expert">Expert</option>
                <option value="Contractor">Contractor</option>
                <option value="Consultant">Consultant</option>
                <option value="Internship">Internship</option>
                <option value="Apprentice">Apprentice</option>
              </select>
            </div>

            {formData.role_type && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Role *
                </label>
                <select
                  name="role_id"
                  value={formData.role_id}
                  onChange={handleInputChange}
                  className="mt-1 w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] dark:bg-gray-800 dark:border-gray-700"
                >
                  <option value="">Select Role</option>
                  {filteredRoles.map(role => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        );

      // ... rest of the renderStepContent cases remain the same ...

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#0A2647]" />
      </div>
    );
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
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
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
    </div>
  );
};

export default NewBackgroundCheck;
