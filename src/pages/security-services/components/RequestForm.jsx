// src/pages/security-services/components/RequestForm.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Card, 
  CardHeader, 
  CardContent, 
  CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowLeft,
  Save,
  Loader2,
  Printer
} from 'lucide-react';
import { getServiceSchema } from '../schemas/serviceSchemas';
import ServiceSpecificFields from './ServiceSpecificFields';

const RequestForm = ({ service, onBack, onSubmit, isLoading }) => {
  const schema = getServiceSchema(service.value);
  const { 
    register, 
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors } 
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      // Common fields
      full_names: '',
      id_passport: '',
      primary_contact: '',
      secondary_contact: '',
      details: '',

      // Phone Serial Number Requests
      phoneRequests: [{ 
        phone_number: '', 
        phone_brand: '', 
        start_date: '', 
        end_date: '' 
      }],

      // IMEI Numbers
      imeiNumbers: [{
        imei: ''
      }],

      // Call History
      callHistoryRequests: [{
        phone_number: '',
        email: '',
        start_date: '',
        end_date: ''
      }],

      // Blocked Numbers
      phoneNumbers: [{
        number: ''
      }],

      // MoMo Numbers
      momoNumbers: [{
        number: ''
      }],

      // Refund Requests
      refundRequests: [{
        phone_number: '',
        amount: '',
        transaction_date: ''
      }],

      // MoMo Transactions
      momoTransactions: [{
        phone_number: '',
        email: '',
        start_date: '',
        end_date: ''
      }],

      // Agent Commission
      agentRequests: [{
        number: '',
        franchisee: ''
      }],

      // Internet Issues
      internetIssues: [{
        number: ''
      }],

      // RIB Followup
      rib_number: '',
      rib_station: '',

      // Backoffice Appointment
      backoffice_user: ''
    }
  });

  const handlePrint = () => {
    window.print();
  };

  const onFormSubmit = (data) => {
    // Transform data before submitting if needed
    let transformedData = { ...data };

    // Add any service-specific transformations here if needed
    switch (service.value) {
      case 'request_serial_number':
        // Data is already in correct format
        break;
      case 'check_stolen_phone':
        // IMEI numbers are already in correct format
        break;
      case 'call_history':
        // Call history data is already in correct format
        break;
      // Add other cases if needed
    }

    onSubmit(transformedData);
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader className="flex flex-row items-center space-x-4">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="h-8 w-8"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {service.label}
          </h2>
          <p className="text-sm text-gray-500">{service.description}</p>
        </div>
      </CardHeader>

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
        <CardContent className="space-y-6">
          {/* Common Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-field">
              <label className="block text-sm font-medium text-gray-700">
                Full Names <span className="text-red-500">*</span>
              </label>
              <Input
                {...register('full_names')}
                placeholder="Enter full names"
                error={errors.full_names?.message}
              />
              {errors.full_names && (
                <p className="mt-1 text-sm text-red-500">{errors.full_names.message}</p>
              )}
            </div>

            <div className="form-field">
              <label className="block text-sm font-medium text-gray-700">
                ID/Passport <span className="text-red-500">*</span>
              </label>
              <Input
                {...register('id_passport')}
                placeholder="Enter ID/Passport number"
                error={errors.id_passport?.message}
              />
              {errors.id_passport && (
                <p className="mt-1 text-sm text-red-500">{errors.id_passport.message}</p>
              )}
            </div>

            <div className="form-field">
              <label className="block text-sm font-medium text-gray-700">
                Primary Contact <span className="text-red-500">*</span>
              </label>
              <Input
                {...register('primary_contact')}
                type="tel"
                maxLength={10}
                placeholder="Enter primary contact"
                error={errors.primary_contact?.message}
              />
              {errors.primary_contact && (
                <p className="mt-1 text-sm text-red-500">{errors.primary_contact.message}</p>
              )}
            </div>

            <div className="form-field">
              <label className="block text-sm font-medium text-gray-700">
                Secondary Contact
              </label>
              <Input
                {...register('secondary_contact')}
                placeholder="Enter phone number or email address"
                error={errors.secondary_contact?.message}
              />
              {errors.secondary_contact && (
                <p className="mt-1 text-sm text-red-500">{errors.secondary_contact.message}</p>
              )}
            </div>
          </div>

          {/* Service Specific Fields */}
          <ServiceSpecificFields
            serviceType={service.value}
            register={register}
            control={control}
            errors={errors}
            watch={watch}
          />
        </CardContent>

        <CardFooter className="flex justify-between pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrint}
            className="text-gray-600 hover:text-gray-900"
          >
            <Printer className="w-4 h-4 mr-2" />
            Print Request
          </Button>

          <div className="space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                onBack();
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="min-w-[120px] bg-primary hover:bg-primary/90"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Submit
                </>
              )}
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
};

export default RequestForm;
