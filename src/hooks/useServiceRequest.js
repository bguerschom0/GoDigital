// src/hooks/useServiceRequest.js
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RequestService } from '@/lib/services/requestService';
import { useAuth } from '@/lib/auth';
import { getServiceSchema } from '@/lib/schemas/serviceSchemas';

export const useServiceRequest = (serviceType) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const schema = getServiceSchema(serviceType);
  const form = useForm({
    resolver: zodResolver(schema)
  });

  const handleSubmit = async (formData) => {
    setIsLoading(true);
    try {
      const { data, error } = await RequestService.createRequest({
        ...formData,
        service_type: serviceType,
        metadata: {
          phone_brand: formData.phone_brand,
          phone_number: formData.phone_number,
          date_range: formData.date_range,
          imei_numbers: formData.imei_numbers,
          service_number: formData.service_number,
          // Add other service-specific fields based on type
        }
      }, user.id);

      if (error) throw error;

      setMessage({
        type: 'success',
        text: `Request submitted successfully! Reference: ${data.reference}`
      });

      return { success: true, data };
    } catch (error) {
      console.error('Error submitting request:', error);
      setMessage({
        type: 'error',
        text: error.message || 'Failed to submit request. Please try again.'
      });
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  const clearMessage = () => setMessage({ type: '', text: '' });

  return {
    form,
    isLoading,
    message,
    handleSubmit: form.handleSubmit(handleSubmit),
    clearMessage
  };
};
