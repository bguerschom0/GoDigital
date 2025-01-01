// src/pages/security-services/components/ServiceCard.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { ChevronRight } from 'lucide-react';

const ServiceCard = ({ service, onSelect }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600',
    red: 'bg-red-50 text-red-600',
    orange: 'bg-orange-50 text-orange-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    cyan: 'bg-cyan-50 text-cyan-600',
    teal: 'bg-teal-50 text-teal-600',
    sky: 'bg-sky-50 text-sky-600'
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card 
        onClick={onSelect}
        className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:border-primary/20"
      >
        <div className="p-6">
          <div className="flex items-start space-x-4">
            <div className={`p-3 rounded-xl ${colorClasses[service.color]}`}>
              {service.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-gray-900 truncate">
                {service.label}
              </h3>
              <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                {service.description}
              </p>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-end text-sm text-primary">
            <span className="font-medium">Request Service</span>
            <ChevronRight className="ml-1 h-4 w-4" />
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

// src/pages/security-services/components/SuccessPopup.jsx
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

export const SuccessPopup = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  // Continuing SuccessPopup component
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md mx-4"
      >
        <div className="flex items-center space-x-4">
          <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded-full">
            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Success</h3>
            <p className="text-gray-500 dark:text-gray-400">{message}</p>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <Button onClick={onClose}>
            Close
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

// src/pages/security-services/components/RequestForm.jsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { getServiceSchema } from '../schemas/serviceSchemas';

export const RequestForm = ({ service, onBack, onSubmit, isLoading }) => {
  const schema = getServiceSchema(service.value);
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema)
  });

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader className="flex flex-row items-center space-x-4">
        <Button 
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

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Common Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Full Names
              </label>
              <Input
                {...register('full_names')}
                error={errors.full_names?.message}
                className="mt-1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                ID/Passport
              </label>
              <Input
                {...register('id_passport')}
                error={errors.id_passport?.message}
                className="mt-1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Primary Contact
              </label>
              <Input
                {...register('primary_contact')}
                type="tel"
                maxLength={10}
                error={errors.primary_contact?.message}
                className="mt-1"
              />
            </div>
          </div>

          {/* Service Specific Fields */}
          <ServiceSpecificFields
            serviceType={service.value}
            register={register}
            errors={errors}
          />

          {/* Form Actions */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
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
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

// src/pages/security-services/components/ServiceSpecificFields.jsx
const ServiceSpecificFields = ({ serviceType, register, errors }) => {
  switch (serviceType) {
    case 'request_serial_number':
      return (
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
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Phone Model
            </label>
            <select
              {...register('phone_model')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            >
              <option value="">Select model</option>
              {phoneModels.map(model => (
                <option key={model} value={model}>{model}</option>
              ))}
            </select>
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
      );

    case 'check_stolen_phone':
      return (
        <IMEIFieldArray register={register} errors={errors} />
      );

    // Add other service-specific fields...

    default:
      return null;
  }
};

// src/pages/security-services/components/IMEIFieldArray.jsx
import { useFieldArray } from 'react-hook-form';

const IMEIFieldArray = ({ control, register, errors }) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "imei_numbers"
  });

  return (
    <div className="space-y-4">
      {fields.map((field, index) => (
        <div key={field.id} className="flex items-center space-x-2">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">
              IMEI {index + 1}
            </label>
            <Input
              {...register(`imei_numbers.${index}.number`)}
              maxLength={15}
              error={errors.imei_numbers?.[index]?.number?.message}
              className="mt-1"
            />
          </div>
          {fields.length > 1 && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="mt-6"
              onClick={() => remove(index)}
            >
              <XCircle className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={() => append({ number: '' })}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Another IMEI
      </Button>
    </div>
  );
};

export { ServiceCard, IMEIFieldArray };
