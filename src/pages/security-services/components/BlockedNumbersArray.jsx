// src/pages/security-services/components/BlockedNumbersArray.jsx
import React from 'react';
import { useFieldArray } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, XCircle } from 'lucide-react';

const BlockedNumbersArray = ({ control, register, errors }) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'blocked_numbers'
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
              Blocked Number {index + 1}
              <span className="text-red-500">*</span>
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <Input
                {...register(`blocked_numbers.${index}.number`)}
                placeholder="Enter phone number"
                maxLength={10}
                type="tel"
                className={errors.blocked_numbers?.[index]?.number ? 'border-red-500' : ''}
              />
            </div>
            {errors.blocked_numbers?.[index]?.number && (
              <p className="mt-1 text-sm text-red-500">
                {errors.blocked_numbers[index].number.message}
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
        Add Another Number
      </Button>

      {errors.blocked_numbers && (
        <p className="mt-1 text-sm text-red-500">
          {errors.blocked_numbers.message}
        </p>
      )}
    </div>
  );
};

export default BlockedNumbersArray;
