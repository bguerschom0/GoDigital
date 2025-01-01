// src/pages/security-services/components/ServiceSpecificFields.jsx
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar, Printer } from 'lucide-react';
import IMEIFieldArray from './IMEIFieldArray';
import BlockedNumbersArray from './BlockedNumbersArray';

                                      
const ServiceSpecificFields = ({ 
  serviceType, 
  register, 
  control, 
  errors,
  phoneModels,
  watch 
}) => {
  const [selectedBrand, setSelectedBrand] = useState('');
  const watchPhoneBrand = watch?.('phone_brand');

  const handlePrint = () => {
    window.print();
  };

  const getBrandModels = (brand) => {
    const brandData = phoneModels.find(p => p.value === brand);
    return brandData ? brandData.makes : [];
  };

  const renderPrintButton = () => (
    <div className="mt-6 border-t pt-4">
      <Button
        type="button"
        variant="outline"
        onClick={handlePrint}
        className="w-full sm:w-auto"
      >
        <Printer className="w-4 h-4 mr-2" />
        Print Request
      </Button>
    </div>
  );

  switch (serviceType) {
    case 'request_serial_number':
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <Input
                {...register('phone_number')}
                type="tel"
                maxLength={10}
                error={errors.phone_number?.message}
                className="mt-1"
                placeholder="Enter phone number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Phone Brand
              </label>
              <Select
                {...register('phone_brand')}
                onChange={(e) => setSelectedBrand(e.target.value)}
                error={errors.phone_brand?.message}
                className="mt-1"
              >
                <option value="">Select phone brand</option>
                {phoneModels.map(model => (
                  <option key={model.value} value={model.value}>
                    {model.label}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Phone Model
              </label>
              <Select
                {...register('phone_model')}
                error={errors.phone_model?.message}
                className="mt-1"
                disabled={!watchPhoneBrand}
              >
                <option value="">Select phone model</option>
                {getBrandModels(watchPhoneBrand).map(model => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Date Range
              </label>
              <Input
                {...register('date_range')}
                type="date"
                error={errors.date_range?.message}
                className="mt-1"
              />
            </div>
          </div>
          {renderPrintButton()}
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
