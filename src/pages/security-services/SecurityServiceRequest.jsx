// src/pages/security-services/SecurityServiceRequest.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/config/supabase';
import { useAuth } from '@/context/AuthContext';
import { usePageAccess } from '@/hooks/usePageAccess';
import { 
  Card,
  CardHeader, 
  CardTitle, 
  CardContent,
  CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Save, 
  Printer,
  RefreshCw,
  AlertCircle,
  Loader2,
  CheckCircle,
  User,
  Phone,
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
  PhoneCall,
  ArrowLeft,
  ChevronRight
} from 'lucide-react';
import ServiceCard from './components/ServiceCard';
import RequestForm  from './components/RequestForm';
import { SuccessPopup } from './components/SuccessPopup';
import { FormProvider } from './context/FormContext';
import '@/styles/serviceGrid.css';
import { useFieldArray } from 'react-hook-form';
import { Input } from '@/components/ui/input';

const services = [
  // Phone Services Category
  { 
    value: 'request_serial_number', 
    label: 'Request Serial Number',
    description: 'Retrieve stolen phone serial number',
    icon: <Phone className="w-5 h-5" />,
    color: 'blue',
    category: 'phone'
  },
  { 
    value: 'check_stolen_phone',
    label: 'Check Stolen Phone Status',
    description: 'Check status of stolen phones by IMEI',
    icon: <Shield className="w-5 h-5" />,
    color: 'indigo',
    category: 'phone'
  },
  { 
    value: 'call_history', 
    label: 'Call History',
    description: 'Request detailed call history records',
    icon: <History className="w-5 h-5" />,
    color: 'orange',
    category: 'phone'
  },
  { 
    value: 'unblock_call', 
    label: 'Unblock Number',
    description: 'Request to unblock numbers for calling',
    icon: <PhoneCall className="w-5 h-5" />,
    color: 'teal',
    category: 'phone'
  },

  // Financial Services Category
  { 
    value: 'unblock_momo', 
    label: 'Unblock MoMo Account',
    description: 'Get assistance with unblocking MoMo',
    icon: <Wallet className="w-5 h-5" />,
    color: 'green',
    category: 'financial'
  },
  { 
    value: 'money_refund', 
    label: 'Money Refund',
    description: 'Request money refund for failed transactions',
    icon: <Save className="w-5 h-5" />,
    color: 'yellow',
    category: 'financial'
  },
  { 
    value: 'momo_transaction', 
    label: 'MoMo Transaction',
    description: 'View MoMo transaction details',
    icon: <Wallet className="w-5 h-5" />,
    color: 'emerald',
    category: 'financial'
  },
  { 
    value: 'agent_commission', 
    label: 'Agent Commission',
    description: 'Request agent commission details',
    icon: <Users className="w-5 h-5" />,
    color: 'cyan',
    category: 'financial'
  },

  // Other Services Category
  { 
    value: 'backoffice_appointment', 
    label: 'Backoffice Appointment',
    description: 'Schedule a meeting with backoffice team',
    icon: <Calendar className="w-5 h-5" />,
    color: 'purple',
    category: 'other'
  },
  { 
    value: 'rib_followup', 
    label: 'RIB Request Followup',
    description: 'Track the status of your RIB request',
    icon: <BadgeHelp className="w-5 h-5" />,
    color: 'red',
    category: 'other'
  },
  { 
    value: 'internet_issue', 
    label: 'Internet Issues',
    description: 'Report and resolve internet connectivity problems',
    icon: <Wifi className="w-5 h-5" />,
    color: 'sky',
    category: 'other'
  }
];

const phoneModels = [
  { value: 'iphone', label: 'iPhone', makes: ['iPhone 11', 'iPhone 12', 'iPhone 13', 'iPhone 14', 'iPhone 15'] },
  { value: 'samsung', label: 'Samsung', makes: ['Galaxy S21', 'Galaxy S22', 'Galaxy S23', 'Galaxy A52', 'Galaxy A53'] },
  { value: 'techno', label: 'Techno', makes: ['Camon 19', 'Camon 20', 'Spark 10', 'Phantom X2'] },
  { value: 'infinix', label: 'Infinix', makes: ['Note 12', 'Note 13', 'Hot 12', 'Hot 13'] },
  { value: 'xiaomi', label: 'Xiaomi', makes: ['Redmi Note 12', 'Redmi Note 13', 'POCO X5', 'POCO F5'] },
  { value: 'itel', label: 'Itel', makes: ['A58', 'A59', 'P40', 'Vision 3'] },
  { value: 'nokia', label: 'Nokia', makes: ['G20', 'G21', 'C21', 'C22'] },
  { value: 'huawei', label: 'Huawei', makes: ['P40', 'P50', 'Nova 9', 'Nova 10'] }
];

const SecurityServiceRequest = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { checkPermission } = usePageAccess();
  
  const [selectedService, setSelectedService] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const checkAccess = async () => {
      const permissionPath = user?.role === 'admin' 
        ? '/admin/security_services/security_service_request'
        : '/security_services/security_service_request';
      
      const { canAccess } = checkPermission(permissionPath);
      
      if (!canAccess) {
        navigate(user?.role === 'admin' ? '/admin/dashboard' : '/user/dashboard');
        return;
      }
      setPageLoading(false);
    };
    
    checkAccess();
  }, []);

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    setShowForm(true);
  };

  const handleBack = () => {
    setShowForm(false);
    setSelectedService(null);
  };

const handleSubmit = async (formData) => {
  setIsLoading(true);
  
  // Log the current user state
  console.log('Current User Object:', user);
  console.log('User Role:', user?.role);
  
  // Log the session information
  const { data: { session } } = await supabase.auth.getSession();
  console.log('Session Details:', session);
  console.log('Session User:', session?.user);
  
  // Log the form data being submitted
  console.log('Form Data:', formData);
  console.log('Selected Service:', selectedService);
  
  try {
    const referenceNumber = `SR${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 100)}`;
    console.log('Generated Reference Number:', referenceNumber);
    
    // Log the exact data being sent to Supabase
    const insertData = {
      reference_number: referenceNumber,
      service_type: selectedService.value,
      status: 'new',
      priority: 'normal',
      full_names: formData.full_names,
      id_passport: formData.id_passport,
      primary_contact: formData.primary_contact,
      secondary_contact: formData.secondary_contact || null,
      details: formData.details
    };
    console.log('Data being inserted:', insertData);

    // Attempt the insert
    const { data, error } = await supabase
      .from('service_requests')
      .insert([insertData])
      .select()
      .single();
      
    console.log('Supabase Response Data:', data);
    console.log('Supabase Error if any:', error);

    if (error) {
      console.log('Error Details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      throw error;
    }

    // Save additional metadata if needed
    if (formData.metadata) {
      await supabase
        .from('service_request_metadata')
        .insert([{
          request_id: data.id,
          metadata: formData.metadata
        }]);
    }

    // Create initial history record
    await supabase
      .from('request_history')
      .insert([{
        request_id: data.id,
        action: 'created',
        status_from: null,
        status_to: 'new',
        performed_by: user.id,
        details: 'Request created'
      }]);

    setMessage({
      type: 'success',
      text: `Service request submitted successfully! Reference: ${referenceNumber}`
    });

    setShowForm(false);
    setSelectedService(null);

  } catch (error) {
    console.error('Submission error:', error);
    setMessage({
      type: 'error',
      text: 'Failed to submit request. Please try again.'
    });
  } finally {
    setIsLoading(false);
  }
};


const filteredServices = activeTab === 'all' 
    ? services 
    : services.filter(service => service.category === activeTab);


  if (pageLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
      <FormProvider>
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <AnimatePresence mode="wait">
          {!showForm ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Security Services</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Select a service to submit a new request
                </p>
              </div>

              <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4 rounded-lg bg-muted">
                  <TabsTrigger value="all">All Services</TabsTrigger>
                  <TabsTrigger value="phone">Phone Services</TabsTrigger>
                  <TabsTrigger value="financial">Financial</TabsTrigger>
                  <TabsTrigger value="other">Other Services</TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredServices.map((service) => (
                      <ServiceCard
                        key={service.value}
                        service={service}
                        onSelect={() => handleServiceSelect(service)}
                      />
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </motion.div>
          ) : (
            <RequestForm
              service={selectedService}
              onBack={handleBack}
              onSubmit={handleSubmit}
              isLoading={isLoading}
              phoneModels={phoneModels}
            />
          )}
        </AnimatePresence>

        {message.type === 'success' && (
          <SuccessPopup
            message={message.text}
            onClose={() => setMessage({ type: '', text: '' })}
          />
        )}

        {message.type === 'error' && (
          <Alert variant="destructive" className="mt-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}
      </div>
    </FormProvider>
  );
};

export default SecurityServiceRequest;
