import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Check, ChevronRight, ChevronLeft, User, Building, Clock, Loader2 } from 'lucide-react';
import { supabase } from '@/config/supabase';

const steps = [
  { id: 1, title: 'Basic Information', description: 'Personal and identification details' },
  { id: 2, title: 'Department & Role', description: 'Work placement information' },
  { id: 3, title: 'Additional Details', description: 'Role specific information' },
  { id: 4, title: 'Review', description: 'Verify information' }
];

const NewBackgroundCheck = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    full_names: '',
    citizenship: '',
    id_passport_number: '',
    passport_expiry_date: '',
    department_id: '',
    role_type: '',
    submitted_date: '',
    requested_by: '',
    from_company: '',
    duration: '',
    operating_country: '',
    date_start: '',
    date_end: '',
    work_with: ''
  });

  // Fetch departments and roles
  useEffect(() => {
    const fetchDepartmentsAndRoles = async () => {
      try {
        const { data: deptData, error: deptError } = await supabase
          .from('departments')
          .select('*')
          .eq('status', 'active');

        if (deptError) throw deptError;
        setDepartments(deptData);

        const { data: roleData, error: roleError } = await supabase
          .from('roles')
          .select('*')
          .eq('status', 'active');

        if (roleError) throw roleError;
        setRoles(roleData);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDepartmentsAndRoles();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

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
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Citizenship
              </label>
              <input
                type="text"
                name="citizenship"
                value={formData.citizenship}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] dark:bg-gray-800 dark:border-gray-700"
              />
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
            </div>

            {(formData.citizenship.toLowerCase() !== 'rwanda' && 
              formData.citizenship.toLowerCase() !== 'rwandan') && formData.citizenship && (
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
              </div>
            )}
          </div>
        );

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
                disabled={isLoading}
              >
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
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
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            {['Staff', 'Apprentice'].includes(formData.role_type) && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Submitted Date *
                  </label>
                  <input
                    type="date"
                    name="submitted_date"
                    value={formData.submitted_date}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] dark:bg-gray-800 dark:border-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Requested By *
                  </label>
                  <input
                    type="text"
                    name="requested_by"
                    value={formData.requested_by}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] dark:bg-gray-800 dark:border-gray-700"
                  />
                </div>
              </>
            )}

            {formData.role_type === 'Expert' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    From Company *
                  </label>
                  <input
                    type="text"
                    name="from_company"
                    value={formData.from_company}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] dark:bg-gray-800 dark:border-gray-700"
                  />
                </div>
              </>
            )}

            {['Contractor', 'Consultant'].includes(formData.role_type) && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Duration *
                  </label>
                  <input
                    type="text"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] dark:bg-gray-800 dark:border-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Operating Country *
                  </label>
                  <input
                    type="text"
                    name="operating_country"
                    value={formData.operating_country}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] dark:bg-gray-800 dark:border-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    From Company *
                  </label>
                  <input
                    type="text"
                    name="from_company"
                    value={formData.from_company}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] dark:bg-gray-800 dark:border-gray-700"
                  />
                </div>
              </>
            )}

            {formData.role_type === 'Internship' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    name="date_start"
                    value={formData.date_start}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] dark:bg-gray-800 dark:border-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    End Date *
                  </label>
                  <input
                    type="date"
                    name="date_end"
                    value={formData.date_end}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] dark:bg-gray-800 dark:border-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Will Work With *
                  </label>
                  <input
                    type="text"
                    name="work_with"
                    value={formData.work_with}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] dark:bg-gray-800 dark:border-gray-700"
                  />
                </div>
              </>
            )}
          </div>
        );

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
                  {formData.passport_expiry_date && (
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
        );

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
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex gap-8">
        {/* Left Sidebar - Vertical Stepper */}
        <div className="w-64 shrink-0">
          <div className="space-y-8">
            {steps.map((step, index) => (
              <div key={step.id} className="relative">
                <div className="flex items-start group">
                  <div className="relative flex h-10 w-10 shrink-0 items-center justify-center">
                    <div className={`h-full w-full rounded-full flex items-center justify-center ${
                      step.id === currentStep 
                        ? 'bg-[#0A2647] text-white'
                        : step.id < currentStep
                        ? 'bg-[#0A2647]/20 text-[#0A2647]'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {step.id < currentStep ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <span>{step.id}</span>
                      )}
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`absolute left-4 top-10 h-16 w-0.5 ${
                        step.id < currentStep ? 'bg-[#0A2647]' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                  <div className="ml-4 mt-1">
                    <h3 className={`text-sm font-medium ${
                      step.id === currentStep ? 'text-[#0A2647]' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <Card className="flex-1 p-6">
          {renderStepContent()}

          <div className="flex justify-between pt-6 border-t mt-6">
            <Button
              type="button"
              onClick={() => setCurrentStep(prev => prev - 1)}
              disabled={currentStep === 1}
              className="bg-gray-100 text-gray-900 hover:bg-gray-200"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            
            <Button
              type="button"
              onClick={() => setCurrentStep(prev => prev + 1)}
              disabled={currentStep === steps.length}
              className="bg-[#0A2647] text-white hover:bg-[#0A2647]/90"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default NewBackgroundCheck
