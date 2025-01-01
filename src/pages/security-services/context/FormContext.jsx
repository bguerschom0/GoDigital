// src/pages/security-services/context/FormContext.jsx
import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { validateServiceRequest } from '../schemas/serviceSchemas';

const FormContext = createContext(null);

// Initial state for the form
const initialState = {
  formData: {
    full_names: '',
    id_passport: '',
    primary_contact: '',
    secondary_contact: '',
    service_type: '',
    details: '',
    // Service specific fields
    phone_number: '',
    date_range: '',
    phone_model: '',
    imei_numbers: [],
    service_number: '',
    rib_station: '',
    rib_helper_number: '',
    email: '',
    franchisee: '',
    start_date: '',
    end_date: '',
    blocked_numbers: [],
    amount: '',
    storage_number: '',
    backoffice_user: ''
  },
  errors: {},
  isSubmitting: false,
  currentStep: 1,
  totalSteps: 1,
  serviceType: null,
};

// Action types
const ACTIONS = {
  SET_FIELD: 'SET_FIELD',
  SET_ERRORS: 'SET_ERRORS',
  SET_SUBMITTING: 'SET_SUBMITTING',
  RESET_FORM: 'RESET_FORM',
  SET_STEP: 'SET_STEP',
  SET_SERVICE_TYPE: 'SET_SERVICE_TYPE',
  SET_FORM_DATA: 'SET_FORM_DATA',
  CLEAR_ERRORS: 'CLEAR_ERRORS',
  ADD_ARRAY_FIELD: 'ADD_ARRAY_FIELD',
  REMOVE_ARRAY_FIELD: 'REMOVE_ARRAY_FIELD',
  UPDATE_ARRAY_FIELD: 'UPDATE_ARRAY_FIELD'
};

// Reducer function to handle state updates
const formReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_FIELD:
      return {
        ...state,
        formData: {
          ...state.formData,
          [action.field]: action.value
        },
        errors: {
          ...state.errors,
          [action.field]: ''
        }
      };

    case ACTIONS.SET_ERRORS:
      return {
        ...state,
        errors: action.errors
      };

    case ACTIONS.SET_SUBMITTING:
      return {
        ...state,
        isSubmitting: action.isSubmitting
      };

    case ACTIONS.RESET_FORM:
      return {
        ...initialState,
        serviceType: state.serviceType
      };

    case ACTIONS.SET_STEP:
      return {
        ...state,
        currentStep: action.step
      };

    case ACTIONS.SET_SERVICE_TYPE:
      return {
        ...state,
        serviceType: action.serviceType,
        formData: {
          ...state.formData,
          service_type: action.serviceType
        }
      };

    case ACTIONS.SET_FORM_DATA:
      return {
        ...state,
        formData: {
          ...state.formData,
          ...action.data
        }
      };

    case ACTIONS.CLEAR_ERRORS:
      return {
        ...state,
        errors: {}
      };

    case ACTIONS.ADD_ARRAY_FIELD:
      return {
        ...state,
        formData: {
          ...state.formData,
          [action.fieldName]: [
            ...(state.formData[action.fieldName] || []),
            action.value
          ]
        }
      };

    case ACTIONS.REMOVE_ARRAY_FIELD:
      return {
        ...state,
        formData: {
          ...state.formData,
          [action.fieldName]: state.formData[action.fieldName].filter(
            (_, index) => index !== action.index
          )
        }
      };

    case ACTIONS.UPDATE_ARRAY_FIELD:
      return {
        ...state,
        formData: {
          ...state.formData,
          [action.fieldName]: state.formData[action.fieldName].map(
            (item, index) => index === action.index ? action.value : item
          )
        }
      };

    default:
      return state;
  }
};

export const FormProvider = ({ children }) => {
  const [state, dispatch] = useReducer(formReducer, initialState);

  const setField = useCallback((field, value) => {
    dispatch({ type: ACTIONS.SET_FIELD, field, value });
  }, []);

  const setErrors = useCallback((errors) => {
    dispatch({ type: ACTIONS.SET_ERRORS, errors });
  }, []);

  const setSubmitting = useCallback((isSubmitting) => {
    dispatch({ type: ACTIONS.SET_SUBMITTING, isSubmitting });
  }, []);

  const resetForm = useCallback(() => {
    dispatch({ type: ACTIONS.RESET_FORM });
  }, []);

  const setStep = useCallback((step) => {
    dispatch({ type: ACTIONS.SET_STEP, step });
  }, []);

  const setServiceType = useCallback((serviceType) => {
    dispatch({ type: ACTIONS.SET_SERVICE_TYPE, serviceType });
  }, []);

  const setFormData = useCallback((data) => {
    dispatch({ type: ACTIONS.SET_FORM_DATA, data });
  }, []);

  const clearErrors = useCallback(() => {
    dispatch({ type: ACTIONS.CLEAR_ERRORS });
  }, []);

  const addArrayField = useCallback((fieldName, value) => {
    dispatch({ type: ACTIONS.ADD_ARRAY_FIELD, fieldName, value });
  }, []);

  const removeArrayField = useCallback((fieldName, index) => {
    dispatch({ type: ACTIONS.REMOVE_ARRAY_FIELD, fieldName, index });
  }, []);

  const updateArrayField = useCallback((fieldName, index, value) => {
    dispatch({ type: ACTIONS.UPDATE_ARRAY_FIELD, fieldName, index, value });
  }, []);

  // Validate form data
  const validateForm = useCallback(() => {
    if (!state.serviceType) return false;
    const result = validateServiceRequest(state.formData, state.serviceType);
    if (!result.success) {
      setErrors(result.error.format());
      return false;
    }
    return true;
  }, [state.formData, state.serviceType, setErrors]);

  const value = {
    ...state,
    setField,
    setErrors,
    setSubmitting,
    resetForm,
    setStep,
    setServiceType,
    setFormData,
    clearErrors,
    validateForm,
    addArrayField,
    removeArrayField,
    updateArrayField
  };

  return (
    <FormContext.Provider value={value}>
      {children}
    </FormContext.Provider>
  );
};

// Custom hook to use the form context
export const useFormContext = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext must be used within a FormProvider');
  }
  return context;
};

// Hook for form fields
export const useFormField = (name) => {
  const { formData, setField, errors } = useFormContext();
  return {
    value: formData[name],
    onChange: (e) => setField(name, e.target.value),
    error: errors[name]
  };
};

// Hook for array fields
export const useFormArray = (name) => {
  const { formData, addArrayField, removeArrayField, updateArrayField } = useFormContext();
  return {
    fields: formData[name] || [],
    addField: (value) => addArrayField(name, value),
    removeField: (index) => removeArrayField(name, index),
    updateField: (index, value) => updateArrayField(name, index, value)
  };
};
