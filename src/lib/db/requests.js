// src/lib/db/requests.js
import { supabase } from '@/lib/supabase';

export async function createServiceRequest(formData, userId) {
  const reference = generateReference();
  
  try {
    const { data, error } = await supabase
      .from('service_requests')
      .insert([
        {
          reference,
          service_type: formData.service_type,
          status: 'pending',
          created_by: userId,
          full_names: formData.full_names,
          id_passport: formData.id_passport,
          primary_contact: formData.primary_contact,
          secondary_contact: formData.secondary_contact,
          details: formData.details,
          metadata: {
            phone_brand: formData.phone_brand,
            phone_number: formData.phone_number,
            date_range: formData.date_range,
            imei_numbers: formData.imei_numbers,
            service_number: formData.service_number,
            // Add other service-specific fields
          }
        }
      ])
      .select()
      .single();

    if (error) throw error;

    // Create notification for admin
    await supabase
      .from('notifications')
      .insert([
        {
          type: 'new_request',
          title: 'New Service Request',
          message: `New ${formData.service_type} request from ${formData.full_names}`,
          reference: data.reference,
          created_for: 'admin' // This could be specific admin IDs
        }
      ]);

    return { data, error: null };
  } catch (error) {
    console.error('Error creating service request:', error);
    return { data: null, error };
  }
}

export async function updateServiceRequest(id, updates) {
  try {
    const { data, error } = await supabase
      .from('service_requests')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function getServiceRequest(id) {
  try {
    const { data, error } = await supabase
      .from('service_requests')
      .select(`
        *,
        created_by (
          id,
          full_name,
          email
        ),
        assigned_to (
          id,
          full_name,
          email
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

// Helper function to generate unique reference numbers
function generateReference() {
  const prefix = 'SR';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}
