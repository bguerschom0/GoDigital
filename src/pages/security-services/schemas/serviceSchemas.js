// src/pages/security-services/schemas/serviceSchemas.js
import { z } from 'zod';

const commonFields = {
  full_names: z.string().min(1, 'Full names are required'),
  id_passport: z.string().min(1, 'ID/Passport is required'),
  primary_contact: z.string()
    .min(1, 'Primary contact is required')
    .length(10, 'Contact number must be 10 digits')
    .regex(/^[0-9]+$/, 'Must contain only numbers'),
  secondary_contact: z.string()
    .length(10, 'Contact number must be 10 digits')
    .regex(/^[0-9]+$/, 'Must contain only numbers')
    .optional(),
  details: z.string().optional()
};

const serialNumberSchema = z.object({
  ...commonFields,
  phoneRequests: z.array(
    z.object({
      phone_number: z.string()
        .min(1, 'Phone number is required')
        .length(10, 'Phone number must be 10 digits')
        .regex(/^[0-9]+$/, 'Must contain only numbers'),
      phone_brand: z.string().min(1, 'Phone brand is required'),
      start_date: z.string().min(1, 'Start date is required'),
      end_date: z.string().min(1, 'End date is required')
    })
  ).min(1, 'At least one phone request is required'),
  details: z.string().optional()
});

const stolenPhoneSchema = z.object({
  ...commonFields,
  imei_numbers: z.array(
    z.object({
      number: z.string()
        .min(1, 'IMEI number is required')
        .length(15, 'IMEI must be 15 digits')
        .regex(/^[0-9]+$/, 'Must contain only numbers')
    })
  ).min(1, 'At least one IMEI number is required')
});

const unblockMomoSchema = z.object({
  ...commonFields,
  service_number: z.string()
    .min(1, 'Service number is required')
    .length(10, 'Number must be 10 digits')
    .regex(/^[0-9]+$/, 'Must contain only numbers'),
  details: z.string().min(1, 'Additional details are required')
});

const moneyRefundSchema = z.object({
  ...commonFields,
  amount: z.string().min(1, 'Amount is required'),
  storage_number: z.string()
    .min(1, 'Storage number is required')
    .length(10, 'Number must be 10 digits')
    .regex(/^[0-9]+$/, 'Must contain only numbers'),
  date_range: z.string().min(1, 'Date range is required'),
  details: z.string().min(1, 'Additional details are required')
});

const backofficeAppointmentSchema = z.object({
  ...commonFields,
  backoffice_user: z.string().min(1, 'Please select a backoffice user'),
  details: z.string().min(1, 'Additional details are required')
});

const ribFollowupSchema = z.object({
  ...commonFields,
  service_number: z.string()
    .min(1, 'Service number is required')
    .length(10, 'Number must be 10 digits')
    .regex(/^[0-9]+$/, 'Must contain only numbers'),
  rib_station: z.string().min(1, 'RIB station is required'),
  rib_helper_number: z.string()
    .length(10, 'Number must be 10 digits')
    .regex(/^[0-9]+$/, 'Must contain only numbers')
    .optional(),
  details: z.string().min(1, 'Additional details are required')
});

const callHistorySchema = z.object({
  ...commonFields,
  service_number: z.string()
    .min(1, 'Service number is required')
    .length(10, 'Number must be 10 digits')
    .regex(/^[0-9]+$/, 'Must contain only numbers'),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  email: z.string().email('Invalid email format').optional()
});

const momoTransactionSchema = z.object({
  ...commonFields,
  service_number: z.string()
    .min(1, 'Service number is required')
    .length(10, 'Number must be 10 digits')
    .regex(/^[0-9]+$/, 'Must contain only numbers'),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  email: z.string().email('Invalid email format').optional()
});

const agentCommissionSchema = z.object({
  ...commonFields,
  service_number: z.string()
    .min(1, 'Service number is required')
    .length(10, 'Number must be 10 digits')
    .regex(/^[0-9]+$/, 'Must contain only numbers'),
  franchisee: z.string().min(1, 'Franchisee is required'),
  details: z.string().min(1, 'Additional details are required')
});

const unblockCallSchema = z.object({
  ...commonFields,
  blocked_numbers: z.array(
    z.object({
      number: z.string()
        .min(1, 'Number is required')
        .length(10, 'Number must be 10 digits')
        .regex(/^[0-9]+$/, 'Must contain only numbers')
    })
  ).min(1, 'At least one number is required'),
  details: z.string().min(1, 'Additional details are required')
});

const internetIssueSchema = z.object({
  ...commonFields,
  service_number: z.string()
    .min(1, 'Service number is required')
    .length(10, 'Number must be 10 digits')
    .regex(/^[0-9]+$/, 'Must contain only numbers'),
  details: z.string().min(1, 'Additional details are required')
});

export const getServiceSchema = (serviceType) => {
  const schemas = {
    request_serial_number: serialNumberSchema,
    check_stolen_phone: stolenPhoneSchema,
    unblock_momo: unblockMomoSchema,
    money_refund: moneyRefundSchema,
    backoffice_appointment: backofficeAppointmentSchema,
    rib_followup: ribFollowupSchema,
    call_history: callHistorySchema,
    momo_transaction: momoTransactionSchema,
    agent_commission: agentCommissionSchema,
    unblock_call: unblockCallSchema,
    internet_issue: internetIssueSchema
  };

  return schemas[serviceType] || commonSchema;
};

// Add a default schema for services that don't need specific validation
const commonSchema = z.object({
  ...commonFields,
  details: z.string().min(1, 'Additional details are required')
});

export const validateServiceRequest = (data, serviceType) => {
  const schema = getServiceSchema(serviceType);
  return schema.safeParse(data);
};

// Helper function to format validation errors
export const formatValidationErrors = (result) => {
  if (result.success) return {};

  return result.error.issues.reduce((acc, issue) => {
    acc[issue.path.join('.')] = issue.message;
    return acc;
  }, {});
};
