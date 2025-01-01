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
