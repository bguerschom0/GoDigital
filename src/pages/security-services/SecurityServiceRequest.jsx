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
  try {
    // Generate reference number
    const today = new Date();
    const dateStr = today.toISOString().slice(2,10).replace(/-/g,'');
    const { data: lastRequest } = await supabase
      .from('service_requests')
      .select('reference_number')
      .order('created_at', { ascending: false })
      .limit(1);
    
    const lastSeq = lastRequest?.[0] ? parseInt(lastRequest[0].reference_number.slice(-3)) : 0;
    const newSeq = (lastSeq + 1).toString().padStart(3, '0');
    const referenceNumber = `SR${dateStr}${newSeq}`;
    
    // Create main service request
    const { data: requestData, error: requestError } = await supabase
      .from('service_requests')
      .insert({
        reference_number: referenceNumber,
        service_type: selectedService.value,
        status: 'new',
        priority: 'normal',
        full_names: formData.full_names,
        id_passport: formData.id_passport,
        primary_contact: formData.primary_contact,
        secondary_contact: formData.secondary_contact || null,
        details: formData.details,
        created_by: user?.id
      })
      .select()
      .single();

    if (requestError) throw requestError;

    // Save service-specific data based on service type
    switch (selectedService.value) {
      case 'request_serial_number':
        if (formData.phoneRequests?.length) {
          const phoneRequests = formData.phoneRequests.map(request => ({
            request_id: requestData.id,
            phone_number: request.phone_number,
            phone_brand: request.phone_brand,
            start_date: request.start_date,
            end_date: request.end_date
          }));

          const { error: phonesError } = await supabase
            .from('request_phone_numbers')
            .insert(phoneRequests);

          if (phonesError) throw phonesError;
        }
        break;

      case 'check_stolen_phone':
        if (formData.imeiNumbers?.length) {
          const imeiNumbers = formData.imeiNumbers.map(item => ({
            request_id: requestData.id,
            imei_number: item.imei
          }));

          const { error: imeiError } = await supabase
            .from('request_imei_numbers')
            .insert(imeiNumbers);

          if (imeiError) throw imeiError;
        }
        break;

      case 'call_history':
        if (formData.callHistoryRequests?.length) {
          const callHistoryRequests = formData.callHistoryRequests.map(request => ({
            request_id: requestData.id,
            phone_number: request.phone_number,
            email: request.email || null,
            start_date: request.start_date,
            end_date: request.end_date
          }));

          const { error: callHistoryError } = await supabase
            .from('request_call_history')
            .insert(callHistoryRequests);

          if (callHistoryError) throw callHistoryError;
        }
        break;

      case 'unblock_call':
        if (formData.phoneNumbers?.length) {
          const blockedNumbers = formData.phoneNumbers.map(item => ({
            request_id: requestData.id,
            phone_number: item.number
          }));

          const { error: blockedError } = await supabase
            .from('request_blocked_numbers')
            .insert(blockedNumbers);

          if (blockedError) throw blockedError;
        }
        break;

      case 'unblock_momo':
        if (formData.momoNumbers?.length) {
          const momoNumbers = formData.momoNumbers.map(item => ({
            request_id: requestData.id,
            phone_number: item.number
          }));

          const { error: momoError } = await supabase
            .from('request_momo_numbers')
            .insert(momoNumbers);

          if (momoError) throw momoError;
        }
        break;

      case 'money_refund':
        if (formData.refundRequests?.length) {
          const refundRequests = formData.refundRequests.map(request => ({
            request_id: requestData.id,
            phone_number: request.phone_number,
            amount: request.amount,
            transaction_date: request.transaction_date
          }));

          const { error: refundError } = await supabase
            .from('request_refunds')
            .insert(refundRequests);

          if (refundError) throw refundError;
        }
        break;

      case 'momo_transaction':
        if (formData.momoTransactions?.length) {
          const momoTransactions = formData.momoTransactions.map(request => ({
            request_id: requestData.id,
            phone_number: request.phone_number,
            email: request.email || null,
            start_date: request.start_date,
            end_date: request.end_date
          }));

          const { error: momoTransError } = await supabase
            .from('request_momo_transactions')
            .insert(momoTransactions);

          if (momoTransError) throw momoTransError;
        }
        break;

      case 'agent_commission':
        if (formData.agentRequests?.length) {
          const agentRequests = formData.agentRequests.map(request => ({
            request_id: requestData.id,
            phone_number: request.number,
            franchisee: request.franchisee
          }));

          const { error: agentError } = await supabase
            .from('request_agent_commission')
            .insert(agentRequests);

          if (agentError) throw agentError;
        }
        break;

      case 'internet_issue':
        if (formData.internetIssues?.length) {
          const internetIssues = formData.internetIssues.map(issue => ({
            request_id: requestData.id,
            phone_number: issue.number
          }));

          const { error: internetError } = await supabase
            .from('request_internet_issues')
            .insert(internetIssues);

          if (internetError) throw internetError;
        }
        break;

      case 'rib_followup':
        const { error: ribError } = await supabase
          .from('request_rib_followup')
          .insert({
            request_id: requestData.id,
            rib_number: formData.rib_number,
            rib_station: formData.rib_station
          });

        if (ribError) throw ribError;
        break;

      case 'backoffice_appointment':
        const { error: backofficeError } = await supabase
          .from('request_backoffice_appointments')
          .insert({
            request_id: requestData.id,
            backoffice_user_id: formData.backoffice_user
          });

        if (backofficeError) throw backofficeError;
        break;
    }

    // Create initial history record
    await supabase
      .from('request_history')
      .insert({
        request_id: requestData.id,
        action: 'created',
        status_from: null,
        status_to: 'new',
        performed_by: user.id,
        details: 'Request created'
      });

    setMessage({
      type: 'success',
      text: `Service request submitted successfully! Reference: ${referenceNumber}`
    });

    // Reset form and state
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
