// src/pages/security-services/components/RequestForm.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { useForm, useFieldArray } from 'react-hook-form';
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
import { Select } from '@/components/ui/select';
import {
  ArrowLeft,
  Save,
  Loader2,
  Plus,
  XCircle,
  Calendar
} from 'lucide-react';
import { getServiceSchema } from '../schemas/serviceSchemas';
import { IMEIFieldArray } from './IMEIFieldArray';
import { BlockedNumbersArray } from './BlockedNumbersArray';

const phoneModels = [
  'iPhone',
  'Samsung',
  'Techno',
  'Infinix',
  'Xiaomi',
  'Itel',
  'Nokia',
  'Huawei'
];

const RequestForm = ({ service, onBack, onSubmit, isLoading }) => {
  const schema = getServiceSchema(service.value);
  const { 
    register, 
    control,
    handleSubmit, 
    formState: { errors },
    watch 
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      full_names: '',
      id_passport: '',
      primary_contact: '',
      secondary_contact: '',
      details: '',
      imei_numbers: [{ number: '' }],
      blocked_numbers: [{ number: '' }]
    }
  });

  const renderServiceSpecificFields = () => {
    switch (service.value) {
      case 'request_serial_number':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="form-field">
              <label className="form-label">Phone Number</label>
              <Input
                {...register('phone_number')}
                type="tel"
                maxLength={10}
                placeholder="Enter phone number"
                error={errors.phone_number?.message}
              />
            </div>

            <div className="form-field">
              <label className="form-label">Phone Model</label>
              <Select
                {...register('phone_model')}
                error={errors.phone_model?.message}
              >
                <option value="">Select phone model</option>
                {phoneModels.map(model => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </Select>
            </div>

            <div className="form-field">
              <label className="form-label">Date Range</label>
              <div className="relative">
                <Input
                  {...register('date_range')}
                  type="date"
                  error={errors.date_range?.message}
                />
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        );

      case 'check_stolen_phone':
        return (
          <IMEIFieldArray
            control={control}
            register={register}
            errors={errors}
          />
        );

      case 'unblock_call':
        return (
          <BlockedNumbersArray
            control={control}
            register={register}
            errors={errors}
          />
        );

      case 'money_refund':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="form-field">
              <label className="form-label">Amount</label>
              <Input
                {...register('amount')}
                type="number"
                placeholder="Enter amount"
                error={errors.amount?.message}
              />
            </div>

            <div className="form-field">
              <label className="form-label">Storage Number</label>
              <Input
                {...register('storage_number')}
                type="tel"
                maxLength={10}
                placeholder="Enter storage number"
                error={errors.storage_number?.message}
              />
            </div>

            <div className="form-field">
              <label className="form-label">Transaction Date</label>
              <Input
                {...register('date_range')}
                type="date"
                error={errors.date_range?.message}
              />
            </div>
          </div>
        );

      // Add cases for other service types...
    }
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
              <label className="form-label">
                Full Names <span className="text-red-500">*</span>
              </label>
              <Input
                {...register('full_names')}
                placeholder="Enter full names"
                error={errors.full_names?.message}
              />
            </div>

            <div className="form-field">
              <label className="form-label">
                ID/Passport <span className="text-red-500">*</span>
              </label>
              <Input
                {...register('id_passport')}
                placeholder="Enter ID/Passport number"
                error={errors.id_passport?.message}
              />
            </div>

            <div className="form-field">
              <label className="form-label">
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
              <label className="form-label">Secondary Contact</label>
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
          {renderServiceSpecificFields()}

          {/* Additional Details */}
          <div className="form-field">
            <label className="form-label">
              Additional Details
              {service.value !== 'backoffice_appointment' && (
                <span className="text-red-500">*</span>
              )}
            </label>
            <Textarea
              {...register('details')}
              rows={4}
              placeholder="Enter additional details"
              error={errors.details?.message}
            />
          </div>
        </CardContent>

        <CardFooter className="flex justify-end space-x-4 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="min-w-[120px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Submit
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default RequestForm;
