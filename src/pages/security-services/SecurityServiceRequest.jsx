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
import { RequestForm } from './components/RequestForm';
import { SuccessPopup } from './components/SuccessPopup';
import { FormProvider } from './context/FormContext';
import '@/styles/serviceGrid.css';

const services = [
  { 
    value: 'request_serial_number', 
    label: 'Request Serial Number',
    description: 'Retrieve stolen phone serial number',
    icon: <Phone className="w-5 h-5" />,
    color: 'blue'
  },
  { 
    value: 'check_stolen_phone',
    label: 'Check Stolen Phone Status',
    description: 'Check status of stolen phones by IMEI',
    icon: <Shield className="w-5 h-5" />,
    color: 'indigo'
  },
  { 
    value: 'unblock_momo', 
    label: 'Unblock MoMo Account',
    description: 'Get assistance with unblocking MoMo',
    icon: <Wallet className="w-5 h-5" />,
    color: 'green'
  },
  { 
    value: 'money_refund', 
    label: 'Money Refund',
    description: 'Request money refund for failed transactions',
    icon: <Save className="w-5 h-5" />,
    color: 'yellow'
  },
  { 
    value: 'backoffice_appointment', 
    label: 'Backoffice Appointment',
    description: 'Schedule a meeting with backoffice team',
    icon: <Calendar className="w-5 h-5" />,
    color: 'purple'
  },
  { 
    value: 'rib_followup', 
    label: 'RIB Request Followup',
    description: 'Track the status of your RIB request',
    icon: <BadgeHelp className="w-5 h-5" />,
    color: 'red'
  },
  { 
    value: 'call_history', 
    label: 'Call History',
    description: 'Request detailed call history records',
    icon: <History className="w-5 h-5" />,
    color: 'orange'
  },
  { 
    value: 'momo_transaction', 
    label: 'MoMo Transaction',
    description: 'View MoMo transaction details',
    icon: <Wallet className="w-5 h-5" />,
    color: 'emerald'
  },
  { 
    value: 'agent_commission', 
    label: 'Agent Commission',
    description: 'Request agent commission details',
    icon: <Users className="w-5 h-5" />,
    color: 'cyan'
  },
  { 
    value: 'unblock_call', 
    label: 'Unblock Number',
    description: 'Request to unblock numbers for calling',
    icon: <PhoneCall className="w-5 h-5" />,
    color: 'teal'
  },
  { 
    value: 'internet_issue', 
    label: 'Internet Issues',
    description: 'Report and resolve internet connectivity problems',
    icon: <Wifi className="w-5 h-5" />,
    color: 'sky'
  }
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
    try {
      const { data, error } = await supabase
        .from('service_requests')
        .insert([{
          ...formData,
          service_type: selectedService.value,
          created_by: user.id,
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      // Create notifications for assigned user if any
      if (data.assigned_to) {
        await supabase
          .from('notifications')
          .insert([{
            user_id: data.assigned_to,
            request_id: data.id,
            title: 'New Service Request Assigned',
            message: `A new ${selectedService.label} request has been assigned to you.`
          }]);
      }

      setMessage({
        type: 'success',
        text: 'Service request submitted successfully!'
      });

      // Reset form after successful submission
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
    : services.filter(service => {
        switch(activeTab) {
          case 'phone':
            return ['request_serial_number', 'check_stolen_phone'].includes(service.value);
          case 'financial':
            return ['unblock_momo', 'money_refund', 'momo_transaction', 'agent_commission'].includes(service.value);
          case 'other':
            return ['backoffice_appointment', 'rib_followup', 'call_history', 'unblock_call', 'internet_issue'].includes(service.value);
          default:
            return true;
        }
      });

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
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">Security Services</h1>
                  <p className="mt-1 text-sm text-gray-500">
                    Select a service to submit a new request
                  </p>
                </div>
                
                <div className="mt-4 sm:mt-0">
                  <Badge variant="outline" className="text-primary">
                    {user?.role === 'admin' ? 'Admin View' : 'User View'}
                  </Badge>
                </div>
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
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <RequestForm
                service={selectedService}
                onBack={handleBack}
                onSubmit={handleSubmit}
                isLoading={isLoading}
              />
            </motion.div>
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
