import React from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Card, 
  CardHeader, 
  CardContent, 
  CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowLeft,
  Save,
  Loader2,
  Printer
} from 'lucide-react';
import { getServiceSchema } from '../schemas/serviceSchemas';
import ServiceSpecificFields from './ServiceSpecificFields';

const RequestForm = ({ service, onBack, onSubmit, isLoading }) => {
  const schema = getServiceSchema(service.value);
  const { 
    register, 
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors } 
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      // Common fields
      full_names: '',
      id_passport: '',
      primary_contact: '',
      secondary_contact: '',
      details: '',

      // For request_serial_number
      phoneRequests: [{ 
        phone_number: '', 
        phone_brand: '', 
        start_date: '', 
        end_date: '' 
      }],

      // For call_history
      callHistoryRequests: [{
        phone_number: '',
        start_date: '',
        end_date: ''
      }],

      // For momo_transaction
      momoTransactions: [{
        phone_number: '',
        start_date: '',
        end_date: ''
      }],

      // For agent_commission
      agentRequests: [{
        number: '',
        franchisee: ''
      }]
    }
  });

const handlePrint = (formData) => {
  if (!formData) {
    console.error("Form data is required for printing.");
    return;
  }

  if (!service || !service.label || !service.value) {
    console.error("Service details are missing or incomplete.");
    return;
  }

  const printDate = new Date().toLocaleDateString();
  const requestType = service.label;

  // Generate print content
  const printContent = generatePrintContent(service.value, formData, printDate);
  if (!printContent) {
    console.error("Failed to generate print content.");
    return;
  }

  // Open a new window for printing
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    console.error("Unable to open a new window. Check for pop-up blockers.");
    return;
  }

  // Prepare HTML content for the print window
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Service Request - ${requestType}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            padding: 20px;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #ccc;
            padding-bottom: 20px;
          }
          .logo {
            max-width: 150px;
            margin-bottom: 10px;
          }
          .request-details {
            margin-bottom: 30px;
          }
          .section {
            margin-bottom: 20px;
          }
          .field {
            margin-bottom: 10px;
          }
          .label {
            font-weight: bold;
            color: #666;
          }
          .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 12px;
            color: #666;
          }
          @media print {
            @page {
              margin: 20mm;
            }
          }
        </style>
      </head>
      <body>
        ${printContent}
      </body>
    </html>
  `;

  // Write the content to the print window
  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();

  // Trigger the print
  printWindow.print();
};

  const generatePrintContent = (serviceType, formData, printDate) => {
  return `
    <div class="header">
      <img src="/mtn-logo.png" alt="MTN Logo" class="logo" />
      <h1>Service Request</h1>
      <p>Date: ${printDate}</p>
    </div>
    <div class="section">
      <h2>Personal Information</h2>
      <div class="field">
        <span class="label">Full Names:</span> ${formData.full_names}
      </div>
      <div class="field">
        <span class="label">ID/Passport:</span> ${formData.id_passport}
      </div>
      <div class="field">
        <span class="label">Primary Contact:</span> ${formData.primary_contact}
      </div>
      ${
        formData.secondary_contact
          ? `<div class="field">
               <span class="label">Secondary Contact:</span> ${formData.secondary_contact}
             </div>`
          : ""
      }
    </div>
    <div class="footer">
      <p>Thank you for your request.</p>
    </div>
  `;
};



  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader className="flex flex-row items-center space-x-4">
        <Button
          type="button"
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

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          {/* Common Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="form-field">
              <label className="block text-sm font-medium text-gray-700">
                Full Names <span className="text-red-500">*</span>
              </label>
              <Input
                {...register('full_names')}
                placeholder="Enter full names"
                error={errors.full_names?.message}
              />
            </div>

            <div className="form-field">
              <label className="block text-sm font-medium text-gray-700">
                ID/Passport <span className="text-red-500">*</span>
              </label>
              <Input
                {...register('id_passport')}
                placeholder="Enter ID/Passport number"
                error={errors.id_passport?.message}
              />
            </div>

            <div className="form-field">
              <label className="block text-sm font-medium text-gray-700">
                Primary Contact <span className="text-red-500">*</span>
              </label>
              <Input
                {...register('primary_contact')}
                type="tel"
                maxLength={10}
                placeholder="Enter primary contact"
                error={errors.primary_contact?.message}
              />
            </div>

            <div className="form-field">
              <label className="block text-sm font-medium text-gray-700">
                Secondary Contact
              </label>
              <Input
                {...register('secondary_contact')}
                placeholder="Enter phone number or email address"
                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {errors.secondary_contact && (
                <p className="mt-1 text-sm text-red-500">{errors.secondary_contact.message}</p>
              )}
            </div>
          </div>

          {/* Service Specific Fields */}
          <ServiceSpecificFields
            serviceType={service.value}
            register={register}
            control={control}
            errors={errors}
            watch={watch}
          />
        </CardContent>

        <CardFooter className="flex justify-between pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrint}
            className="text-gray-600 hover:text-gray-900"
          >
            <Printer className="w-4 h-4 mr-2" />
            Print Request
          </Button>

          <div className="space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                onBack();
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="min-w-[120px] bg-primary"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Submit
                </>
              )}
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
};

export default RequestForm;
