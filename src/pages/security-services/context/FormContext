// src/pages/security-services/context/FormContext.jsx
import React, { createContext, useContext, useReducer } from 'react';

const FormContext = createContext(null);

const initialState = {
  formData: {
    full_names: '',
    id_passport: '',
    primary_contact: '',
    secondary_contact: '',
    details: '',
    // Service specific fields will be added dynamically
  },
  errors: {},
  isSubmitting: false,
  currentStep: 1,
  totalSteps: 1,
};

const formReducer = (state, action) => {
  switch (action.type) {
    case 'SET_FIELD':
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

    case 'SET_ERRORS':
      return {
        ...state,
        errors: action.errors
      };

    case 'SET_SUBMITTING':
      return {
        ...state,
        isSubmitting: action.isSubmitting
      };

    case 'RESET_FORM':
      return {
        ...initialState,
        formData: {
          ...initialState.formData,
          ...action.serviceSpecificFields
        }
      };

    case 'SET_STEP':
      return {
        ...state,
        currentStep: action.step
      };

    case 'SET_TOTAL_STEPS':
      return {
        ...state,
        totalSteps: action.totalSteps
      };

    case 'SET_SERVICE_FIELDS':
      return {
        ...state,
        formData: {
          ...state.formData,
          ...action.fields
        }
      };

    default:
      return state;
  }
};

export const FormProvider = ({ children }) => {
  const [state, dispatch] = useReducer(formReducer, initialState);

  const setField = (field, value) => {
    dispatch({ type: 'SET_FIELD', field, value });
  };

  const setErrors = (errors) => {
    dispatch({ type: 'SET_ERRORS', errors });
  };

  const setSubmitting = (isSubmitting) => {
    dispatch({ type: 'SET_SUBMITTING', isSubmitting });
  };

  const resetForm = (serviceSpecificFields = {}) => {
    dispatch({ type: 'RESET_FORM', serviceSpecificFields });
  };

  const setStep = (step) => {
    dispatch({ type: 'SET_STEP', step });
  };

  const setTotalSteps = (totalSteps) => {
    dispatch({ type: 'SET_TOTAL_STEPS', totalSteps });
  };

  const setServiceFields = (fields) => {
    dispatch({ type: 'SET_SERVICE_FIELDS', fields });
  };

  const value = {
    ...state,
    setField,
    setErrors,
    setSubmitting,
    resetForm,
    setStep,
    setTotalSteps,
    setServiceFields
  };

  return (
    <FormContext.Provider value={value}>
      {children}
    </FormContext.Provider>
  );
};

export const useForm = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useForm must be used within a FormProvider');
  }
  return context;
};

// Custom hook for form validation
export const useFormValidation = (serviceType) => {
  const { formData, setErrors } = useForm();
  
  const validate = () => {
    const result = validateServiceRequest(formData, serviceType);
    if (!result.success) {
      const formattedErrors = formatValidationErrors(result);
      setErrors(formattedErrors);
      return false;
    }
    return true;
  };

  return { validate };
};
