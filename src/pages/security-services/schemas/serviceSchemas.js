// src/schemas/serviceSchemas.js
import * as z from 'zod';

const isValidPhoneNumber = (value) => /^\d{10}$/.test(value);
const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

// Common fields that all services share
const commonFields = {
  full_names: z.string().min(1, 'Full names are required'),
  id_passport: z.string().min(1, 'ID/Passport is required'),
  primary_contact: z.string()
    .min(1, 'Primary contact is required')
    .length(10, 'Contact number must be 10 digits')
    .regex(/^[0-9]+$/, 'Must contain only numbers'),
  secondary_contact: z.string()
    .optional()
    .refine(val => {
      if (!val) return true;
      return isValidPhoneNumber(val) || isValidEmail(val);
    }, 'Must be a valid phone number or email address'),
  details: z.string().optional()
};

// Phone Serial Number Request
const serialNumberSchema = z.object({
  ...commonFields,
  phoneRequests: z.array(
    z.object({
      phone_number: z.string()
        .min(1, 'Phone number is required')
        .length(10, 'Phone number must be 10 digits'),
      phone_brand: z.string().min(1, 'Phone brand is required'),
      start_date: z.string().min(1, 'Start date is required'),
      end_date: z.string().min(1, 'End date is required')
    })
  ).min(1, 'At least one phone request is required')
});

// IMEI Check
const imeiSchema = z.object({
  ...commonFields,
  imeiNumbers: z.array(
    z.object({
      imei: z.string()
        .min(1, 'IMEI number is required')
        .length(15, 'IMEI must be 15 digits')
        .regex(/^[0-9]+$/, 'Must contain only numbers')
    })
  ).min(1, 'At least one IMEI number is required')
});

// Call History
const callHistorySchema = z.object({
  ...commonFields,
  callHistoryRequests: z.array(
    z.object({
      phone_number: z.string()
        .min(1, 'Phone number is required')
        .length(10, 'Phone number must be 10 digits'),
      email: z.string().email('Invalid email format').optional(),
      start_date: z.string().min(1, 'Start date is required'),
      end_date: z.string().min(1, 'End date is required')
    })
  ).min(1, 'At least one call history request is required')
});

// Unblock Call
const unblockCallSchema = z.object({
  ...commonFields,
  phoneNumbers: z.array(
    z.object({
      number: z.string()
        .min(1, 'Phone number is required')
        .length(10, 'Phone number must be 10 digits')
    })
  ).min(1, 'At least one phone number is required')
});

// Unblock MoMo
const unblockMomoSchema = z.object({
  ...commonFields,
  momoNumbers: z.array(
    z.object({
      number: z.string()
        .min(1, 'MoMo number is required')
        .length(10, 'MoMo number must be 10 digits')
    })
  ).min(1, 'At least one MoMo number is required')
});

// Money Refund
const moneyRefundSchema = z.object({
  ...commonFields,
  refundRequests: z.array(
    z.object({
      phone_number: z.string()
        .min(1, 'Phone number is required')
        .length(10, 'Phone number must be 10 digits'),
      amount: z.string().min(1, 'Amount is required'),
      transaction_date: z.string().min(1, 'Transaction date is required')
    })
  ).min(1, 'At least one refund request is required')
});

// MoMo Transaction
const momoTransactionSchema = z.object({
  ...commonFields,
  momoTransactions: z.array(
    z.object({
      phone_number: z.string()
        .min(1, 'Phone number is required')
        .length(10, 'Phone number must be 10 digits'),
      email: z.string().email('Invalid email format').optional(),
      start_date: z.string().min(1, 'Start date is required'),
      end_date: z.string().min(1, 'End date is required')
    })
  ).min(1, 'At least one transaction request is required')
});

// Agent Commission
const agentCommissionSchema = z.object({
  ...commonFields,
  agentRequests: z.array(
    z.object({
      number: z.string()
        .min(1, 'Number is required')
        .length(10, 'Number must be 10 digits'),
      franchisee: z.string().min(1, 'Franchisee is required')
    })
  ).min(1, 'At least one agent commission request is required')
});

// Internet Issue
const internetIssueSchema = z.object({
  ...commonFields,
  internetIssues: z.array(
    z.object({
      number: z.string()
        .min(1, 'Number is required')
        .length(10, 'Number must be 10 digits')
    })
  ).min(1, 'At least one number is required')
});

// RIB Followup
const ribFollowupSchema = z.object({
  ...commonFields,
  rib_number: z.string()
    .min(1, 'RIB number is required')
    .length(10, 'RIB number must be 10 digits'),
  rib_station: z.string().min(1, 'RIB station is required')
});

// Backoffice Appointment
const backofficeAppointmentSchema = z.object({
  ...commonFields,
  backoffice_user: z.string().min(1, 'Please select a backoffice user')
});

// Get the appropriate schema based on service type
export const getServiceSchema = (serviceType) => {
  const schemas = {
    'request_serial_number': serialNumberSchema,
    'check_stolen_phone': imeiSchema,
    'call_history': callHistorySchema,
    'unblock_call': unblockCallSchema,
    'unblock_momo': unblockMomoSchema,
    'money_refund': moneyRefundSchema,
    'momo_transaction': momoTransactionSchema,
    'agent_commission': agentCommissionSchema,
    'internet_issue': internetIssueSchema,
    'rib_followup': ribFollowupSchema,
    'backoffice_appointment': backofficeAppointmentSchema
  };

  return schemas[serviceType] || z.object({ ...commonFields });
};

// Function to validate form data
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

// Helper function to get default values based on service type
export const getDefaultValues = (serviceType) => {
  const defaultValues = {
    full_names: '',
    id_passport: '',
    primary_contact: '',
    secondary_contact: '',
    details: ''
  };

  const serviceDefaults = {
    'request_serial_number': {
      phoneRequests: [{ 
        phone_number: '', 
        phone_brand: '', 
        start_date: '', 
        end_date: '' 
      }]
    },
    'check_stolen_phone': {
      imeiNumbers: [{ imei: '' }]
    },
    'call_history': {
      callHistoryRequests: [{
        phone_number: '',
        email: '',
        start_date: '',
        end_date: ''
      }]
    },
    'unblock_call': {
      phoneNumbers: [{ number: '' }]
    },
    'unblock_momo': {
      momoNumbers: [{ number: '' }]
    },
    'money_refund': {
      refundRequests: [{
        phone_number: '',
        amount: '',
        transaction_date: ''
      }]
    },
    'momo_transaction': {
      momoTransactions: [{
        phone_number: '',
        email: '',
        start_date: '',
        end_date: ''
      }]
    },
    'agent_commission': {
      agentRequests: [{
        number: '',
        franchisee: ''
      }]
    },
    'internet_issue': {
      internetIssues: [{ number: '' }]
    },
    'rib_followup': {
      rib_number: '',
      rib_station: ''
    },
    'backoffice_appointment': {
      backoffice_user: ''
    }
  };

  return {
    ...defaultValues,
    ...(serviceDefaults[serviceType] || {})
  };
};

// Helper function to transform data before submission
export const transformFormData = (data, serviceType) => {
  // Remove any empty fields or convert them to null
  const cleaned = Object.entries(data).reduce((acc, [key, value]) => {
    if (value === '') {
      acc[key] = null;
    } else if (Array.isArray(value)) {
      acc[key] = value.filter(item => Object.values(item).some(v => v !== ''));
    } else {
      acc[key] = value;
    }
    return acc;
  }, {});

  // Add any service-specific transformations
  switch (serviceType) {
    case 'money_refund':
      // Convert amount strings to numbers
      if (cleaned.refundRequests) {
        cleaned.refundRequests = cleaned.refundRequests.map(req => ({
          ...req,
          amount: parseFloat(req.amount)
        }));
      }
      break;

    case 'call_history':
    case 'momo_transaction':
      // Convert dates to ISO format
      const requestKey = serviceType === 'call_history' ? 'callHistoryRequests' : 'momoTransactions';
      if (cleaned[requestKey]) {
        cleaned[requestKey] = cleaned[requestKey].map(req => ({
          ...req,
          start_date: new Date(req.start_date).toISOString(),
          end_date: new Date(req.end_date).toISOString()
        }));
      }
      break;
  }

  return cleaned;
};

export {
  commonFields,
  serialNumberSchema,
  imeiSchema,
  callHistorySchema,
  unblockCallSchema,
  unblockMomoSchema,
  moneyRefundSchema,
  momoTransactionSchema,
  agentCommissionSchema,
  internetIssueSchema,
  ribFollowupSchema,
  backofficeAppointmentSchema
};
