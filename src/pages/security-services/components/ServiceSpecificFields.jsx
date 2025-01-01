// src/pages/security-services/components/ServiceSpecificFields.jsx
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar, Printer, Plus, XCircle  } from 'lucide-react';
import IMEIFieldArray from './IMEIFieldArray';
import BlockedNumbersArray from './BlockedNumbersArray';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useForm, useFieldArray } from 'react-hook-form';

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
  errors,
  control // Make sure control is being passed from parent
}) => {
  // Only create the field array if we're on the serial number request
  const serialNumberArray = serviceType === 'request_serial_number' 
    ? useFieldArray({
        control,
        name: "phoneRequests"
      })
    : null;

  const fields = serialNumberArray?.fields || [];
  const append = serialNumberArray?.append || (() => {});
  const remove = serialNumberArray?.remove || (() => {});

  // Add initial field if empty and it's a serial number request
  React.useEffect(() => {
    if (serviceType === 'request_serial_number' && fields.length === 0) {
      append({
        phone_number: '',
        phone_brand: '',
        start_date: '',
        end_date: ''
      });
    }
  }, [serviceType]);

  // IMEI Numbers Array
  const imeiArray = serviceType === 'check_stolen_phone' 
    ? useFieldArray({
        control,
        name: "imeiNumbers"
      })
    : null;

  // Phone Numbers Array for Unblock
  const phoneArray = serviceType === 'unblock_call' 
    ? useFieldArray({
        control,
        name: "phoneNumbers"
      })
    : null;

  // MoMo Numbers Array
  const momoArray = serviceType === 'unblock_momo' 
    ? useFieldArray({
        control,
        name: "momoNumbers"
      })
    : null;

  // Refund Requests Array
  const refundArray = serviceType === 'money_refund' 
    ? useFieldArray({
        control,
        name: "refundRequests"
      })
    : null;

  // Initialize default entries
  React.useEffect(() => {
    switch (serviceType) {
      case 'check_stolen_phone':
        if (imeiArray && imeiArray.fields.length === 0) {
          imeiArray.append({ imei: '' });
        }
        break;
      case 'unblock_call':
        if (phoneArray && phoneArray.fields.length === 0) {
          phoneArray.append({ number: '' });
        }
        break;
      case 'unblock_momo':
        if (momoArray && momoArray.fields.length === 0) {
          momoArray.append({ number: '' });
        }
        break;
      case 'money_refund':
        if (refundArray && refundArray.fields.length === 0) {
          refundArray.append({ 
            phone_number: '',
            amount: '',
            transaction_date: ''
          });
        }
        break;
    }
  }, [serviceType]);

  const renderImportantNote = (message) => (
    <Alert className="bg-blue-50 border-blue-200">
      <AlertDescription className="text-sm text-blue-800">
        <strong>Important Note:</strong> {message}
      </AlertDescription>
    </Alert>
  );
  
  switch (serviceType) {
    case 'request_serial_number':
      return (
        <div className="space-y-6">
          {/* Phone Request Fields */}
          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="relative border rounded-lg p-4 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="form-field">
                    <label className="block text-sm font-medium text-gray-700">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <Input
                      {...register(`phoneRequests.${index}.phone_number`)}
                      type="tel"
                      maxLength={10}
                      placeholder="Enter phone number"
                      error={errors?.phoneRequests?.[index]?.phone_number?.message}
                    />
                  </div>

                  <div className="form-field">
                    <label className="block text-sm font-medium text-gray-700">
                      Phone Brand <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...register(`phoneRequests.${index}.phone_brand`)}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="">Select brand</option>
                      {['iPhone', 'Samsung', 'Techno', 'Infinix', 'Xiaomi', 'Itel', 'Nokia', 'Huawei'].map(brand => (
                        <option key={brand} value={brand.toLowerCase()}>
                          {brand}
                        </option>
                      ))}
                    </select>
                    {errors?.phoneRequests?.[index]?.phone_brand && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.phoneRequests[index].phone_brand.message}
                      </p>
                    )}
                  </div>

                  <div className="form-field">
                    <label className="block text-sm font-medium text-gray-700">
                      Start Period <span className="text-red-500">*</span>
                    </label>
                    <Input
                      {...register(`phoneRequests.${index}.start_date`)}
                      type="date"
                      error={errors?.phoneRequests?.[index]?.start_date?.message}
                    />
                  </div>

                  <div className="form-field">
                    <label className="block text-sm font-medium text-gray-700">
                      End Period <span className="text-red-500">*</span>
                    </label>
                    <Input
                      {...register(`phoneRequests.${index}.end_date`)}
                      type="date"
                      error={errors?.phoneRequests?.[index]?.end_date?.message}
                    />
                  </div>
                </div>

                {/* Remove button */}
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute -top-2 -right-2"
                    onClick={() => remove(index)}
                  >
                    <XCircle className="h-5 w-5 text-gray-500 hover:text-red-500" />
                  </Button>
                )}
              </div>
            ))}

            {/* Add another phone request button */}
            <Button
              type="button"
              variant="outline"
              onClick={() => append({
                phone_number: '',
                phone_brand: '',
                start_date: '',
                end_date: ''
              })}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Another Phone Request
            </Button>
          </div>

          {/* Details Field */}
          <div className="form-field">
            <label className="block text-sm font-medium text-gray-700">
              Additional Details
            </label>
            <textarea
              {...register('details')}
              rows={4}
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Any additional information (optional)"
            />
          </div>

          {/* Important Note */}
          <Alert className="bg-blue-50 border-blue-200">
            <AlertDescription className="text-sm text-blue-800">
              <strong>Important Note:</strong> Please ensure that the customer is requesting serial numbers for phone numbers registered under their name. 
              Whenever possible, verify that the provided phone numbers are registered to the customer's identity. 
              This is required for security purposes and to protect our customers' privacy.
            </AlertDescription>
          </Alert>
        </div>
      );

    case 'check_stolen_phone':
      return (
        <div className="space-y-6">
          <div className="space-y-4">
            {imeiArray.fields.map((field, index) => (
              <div key={field.id} className="relative border rounded-lg p-4 bg-gray-50">
                <div className="grid grid-cols-1 gap-4">
                  <div className="form-field">
                    <label className="block text-sm font-medium text-gray-700">
                      IMEI Number {index + 1} <span className="text-red-500">*</span>
                    </label>
                    <Input
                      {...register(`imeiNumbers.${index}.imei`)}
                      maxLength={15}
                      placeholder="Enter IMEI number"
                      error={errors?.imeiNumbers?.[index]?.imei?.message}
                    />
                  </div>
                </div>
                {imeiArray.fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute -top-2 -right-2"
                    onClick={() => imeiArray.remove(index)}
                  >
                    <XCircle className="h-5 w-5 text-gray-500 hover:text-red-500" />
                  </Button>
                )}
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={() => imeiArray.append({ imei: '' })}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Another IMEI Number
            </Button>
          </div>

          <div className="form-field">
            <label className="block text-sm font-medium text-gray-700">
              Additional Details
            </label>
            <textarea
              {...register('details')}
              rows={4}
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Any additional information (optional)"
            />
          </div>

          {renderImportantNote(
            "Please ensure that you are requesting this service for your own device. This service cannot be used to check IMEI numbers for devices that do not belong to you."
          )}
        </div>
      );

      case 'call_history':
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="form-field">
              <label className="block text-sm font-medium text-gray-700">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <Input
                {...register('phone_number')}
                type="tel"
                maxLength={10}
                placeholder="Enter phone number"
                error={errors?.phone_number?.message}
              />
            </div>

            <div className="form-field">
              <label className="block text-sm font-medium text-gray-700">
                Start Date <span className="text-red-500">*</span>
              </label>
              <Input
                {...register('start_date')}
                type="date"
                error={errors?.start_date?.message}
              />
            </div>

            <div className="form-field">
              <label className="block text-sm font-medium text-gray-700">
                End Date <span className="text-red-500">*</span>
              </label>
              <Input
                {...register('end_date')}
                type="date"
                error={errors?.end_date?.message}
              />
            </div>
          </div>

          <div className="form-field">
            <label className="block text-sm font-medium text-gray-700">
              Additional Details
            </label>
            <textarea
              {...register('details')}
              rows={4}
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Any additional information (optional)"
            />
          </div>

          {renderImportantNote(
            "Please ensure that you are requesting call history for a number registered under your name. Call history can only be provided for numbers that belong to the requestor."
          )}
        </div>
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
