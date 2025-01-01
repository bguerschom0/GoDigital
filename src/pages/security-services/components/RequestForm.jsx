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

      // For request_serial_number
      phoneRequests: [{ 
        phone_number: '', 
        phone_brand: '', 
        start_date: '', 
        end_date: '' 
      }],

      // For call_history
      callHistoryRequests: [{
        phone_number: '',
        start_date: '',
        end_date: ''
      }],

      // For momo_transaction
      momoTransactions: [{
        phone_number: '',
        start_date: '',
        end_date: ''
      }],

      // For agent_commission
      agentRequests: [{
        number: '',
        franchisee: ''
      }],

      // Other service specific fields...
    }
  });

  const handlePrint = () => {
    window.print();
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

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          {/* Common Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="form-field">
              <label className="block text-sm font-medium text-gray-700">
                Full Names <span className="text-red-500">*</span>
              </label>
              <Input
                {...register('full_names')}
                placeholder="Enter full names"
                error={errors.full_names?.message}
              />
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
            </div>

            <div className="form-field">
              <label className="block text-sm font-medium text-gray-700">
                Secondary Contact
              </label>
              <Input
                {...register('secondary_contact')}
                type="tel"
                maxLength={10}
                placeholder="Enter secondary contact (optional)"
                error={errors.secondary_contact?.message}
              />
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

        <CardFooter className="flex justify-between pt-6">
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
              className="min-w-[120px] bg-primary"
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
