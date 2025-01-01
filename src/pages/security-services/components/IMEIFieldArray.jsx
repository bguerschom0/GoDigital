// src/pages/security-services/components/IMEIFieldArray.jsx
import React from 'react';
import { useFieldArray } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, XCircle } from 'lucide-react';

const IMEIFieldArray = ({ control, register, errors }) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'imei_numbers'
  });

  return (
    <div className="space-y-4">
      {fields.map((field, index) => (
        <div 
          key={field.id} 
          className="relative flex items-center space-x-2 animate-in fade-in slide-in-from-left-5"
        >
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">
              IMEI Number {index + 1}
              <span className="text-red-500">*</span>
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <Input
                {...register(`imei_numbers.${index}.number`)}
                placeholder="Enter IMEI number"
                maxLength={15}
                className={errors.imei_numbers?.[index]?.number ? 'border-red-500' : ''}
              />
            </div>
            {errors.imei_numbers?.[index]?.number && (
              <p className="mt-1 text-sm text-red-500">
                {errors.imei_numbers[index].number.message}
              </p>
            )}
          </div>

          {fields.length > 1 && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="mt-6"
              onClick={() => remove(index)}
            >
              <XCircle className="h-4 w-4 text-red-500" />
            </Button>
          )}
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={() => append({ number: '' })}
        className="w-full mt-2"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Another IMEI Number
      </Button>

      {errors.imei_numbers && (
        <p className="mt-1 text-sm text-red-500">
          {errors.imei_numbers.message}
        </p>
      )}
    </div>
  );
};

export default IMEIFieldArray;
