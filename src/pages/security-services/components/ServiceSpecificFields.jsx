// src/pages/security-services/components/ServiceSpecificFields.jsx
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar, Printer } from 'lucide-react';
import IMEIFieldArray from './IMEIFieldArray';
import BlockedNumbersArray from './BlockedNumbersArray';

import { 
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage 
} from '@/components/ui/form';

                                      
const ServiceSpecificFields = ({ 
  serviceType, 
  register, 
  control, 
  errors,
  phoneModels 
}) => {
  switch (serviceType) {
    case 'request_serial_number':
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-field">
            <label className="block text-sm font-medium text-gray-700">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <Input
              {...register('phone_number')}
              type="tel"
              maxLength={10}
              placeholder="Enter phone number"
              error={errors.phone_number?.message}
            />
          </div>

          <div className="form-field">
            <label className="block text-sm font-medium text-gray-700">
              Phone Brand <span className="text-red-500">*</span>
            </label>
            <select
              {...register('phone_brand')}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">Select phone brand</option>
              {['iPhone', 'Samsung', 'Techno', 'Infinix', 'Xiaomi', 'Itel', 'Nokia', 'Huawei'].map(brand => (
                <option key={brand} value={brand.toLowerCase()}>
                  {brand}
                </option>
              ))}
            </select>
            {errors.phone_brand && (
              <p className="mt-1 text-sm text-red-500">{errors.phone_brand.message}</p>
            )}
          </div>

          <div className="form-field">
            <label className="block text-sm font-medium text-gray-700">
              Date Range <span className="text-red-500">*</span>
            </label>
            <Input
              {...register('date_range')}
              type="date"
              error={errors.date_range?.message}
            />
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

    case 'unblock_momo':
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Blocked MoMo/MoMoPay Number
            </label>
            <Input
              {...register('service_number')}
              type="tel"
              maxLength={10}
              error={errors.service_number?.message}
              className="mt-1"
              placeholder="Enter blocked number"
            />
          </div>
        </div>
      );

    case 'money_refund':
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Amount
            </label>
            <Input
              {...register('amount')}
              type="number"
              error={errors.amount?.message}
              className="mt-1"
              placeholder="Enter amount"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Storage Number
            </label>
            <Input
              {...register('storage_number')}
              type="tel"
              maxLength={10}
              error={errors.storage_number?.message}
              className="mt-1"
              placeholder="Enter storage number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Transaction Date
            </label>
            <Input
              {...register('date_range')}
              type="date"
              error={errors.date_range?.message}
              className="mt-1"
            />
          </div>
        </div>
      );

    case 'backoffice_appointment':
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Preferred Date and Time
            </label>
            <Input
              {...register('appointment_date')}
              type="datetime-local"
              error={errors.appointment_date?.message}
              className="mt-1"
            />
          </div>
        </div>
      );

    case 'rib_followup':
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Number
            </label>
            <Input
              {...register('service_number')}
              type="tel"
              maxLength={10}
              error={errors.service_number?.message}
              className="mt-1"
              placeholder="Enter number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              RIB Station
            </label>
            <Input
              {...register('rib_station')}
              error={errors.rib_station?.message}
              className="mt-1"
              placeholder="Enter RIB station"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              RIB Helper Number
            </label>
            <Input
              {...register('rib_helper_number')}
              type="tel"
              maxLength={10}
              error={errors.rib_helper_number?.message}
              className="mt-1"
              placeholder="Enter RIB helper number (optional)"
            />
          </div>
        </div>
      );

    case 'call_history':
    case 'momo_transaction':
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Number
            </label>
            <Input
              {...register('service_number')}
              type="tel"
              maxLength={10}
              error={errors.service_number?.message}
              className="mt-1"
              placeholder="Enter number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Start Date
            </label>
            <Input
              {...register('start_date')}
              type="date"
              error={errors.start_date?.message}
              className="mt-1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              End Date
            </label>
            <Input
              {...register('end_date')}
              type="date"
              error={errors.end_date?.message}
              className="mt-1"
            />
          </div>

          <div className="lg:col-span-3">
            <label className="block text-sm font-medium text-gray-700">
              Email (Optional)
            </label>
            <Input
              {...register('email')}
              type="email"
              error={errors.email?.message}
              className="mt-1"
              placeholder="Enter email for report delivery"
            />
          </div>
        </div>
      );

    case 'agent_commission':
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Number
            </label>
            <Input
              {...register('service_number')}
              type="tel"
              maxLength={10}
              error={errors.service_number?.message}
              className="mt-1"
              placeholder="Enter number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Franchisee
            </label>
            <Input
              {...register('franchisee')}
              error={errors.franchisee?.message}
              className="mt-1"
              placeholder="Enter franchisee"
            />
          </div>
        </div>
      );

    case 'unblock_call':
      return (
        <BlockedNumbersArray
          control={control}
          register={register}
          errors={errors}
        />
      );

    case 'internet_issue':
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Number
          </label>
          <Input
            {...register('service_number')}
            type="tel"
            maxLength={10}
            error={errors.service_number?.message}
            className="mt-1"
            placeholder="Enter number"
          />
        </div>
      );

    default:
      return null;
  }
};

export default ServiceSpecificFields;
