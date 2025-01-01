// src/lib/services/requestService.js
import { supabase } from '@/lib/supabase';

export class RequestService {
  // Create a new service request
  static async createRequest(data, userId) {
    try {
      const reference = this.generateReference();
      
      const { data: request, error } = await supabase
        .from('service_requests')
        .insert({
          ...data,
          reference,
          created_by: userId,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      
      // Create history record
      await this.addHistory(request.id, userId, 'created', 'Request created');

      return { data: request, error: null };
    } catch (error) {
      console.error('Error creating request:', error);
      return { data: null, error };
    }
  }

  // Update a service request
  static async updateRequest(id, updates, userId) {
    try {
      const { data: request, error } = await supabase
        .from('service_requests')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Add history record
      await this.addHistory(id, userId, 'updated', 'Request updated');

      return { data: request, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Add a comment to a request
  static async addComment(requestId, userId, comment, isInternal = false) {
    try {
      const { data, error } = await supabase
        .from('request_comments')
        .insert({
          request_id: requestId,
          user_id: userId,
          comment,
          is_internal: isInternal
        })
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Add an attachment to a request
  static async addAttachment(requestId, userId, file) {
    try {
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `attachments/${requestId}/${fileName}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('request-attachments')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('request-attachments')
        .getPublicUrl(filePath);

      // Save attachment record
      const { data, error } = await supabase
        .from('request_attachments')
        .insert({
          request_id: requestId,
          file_name: fileName,
          file_url: publicUrl,
          file_type: file.type,
          file_size: file.size,
          uploaded_by: userId
        })
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Add a history record
  static async addHistory(requestId, userId, action, details) {
    try {
      const { data, error } = await supabase
        .from('request_history')
        .insert({
          request_id: requestId,
          performed_by: userId,
          action,
          details
        })
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Get request details with related data
  static async getRequest(id) {
    try {
      const { data, error } = await supabase
        .from('service_requests')
        .select(`
          *,
          comments: request_comments (
            id,
            comment,
            is_internal,
            created_at,
            user: auth.users ( id, full_name, email )
          ),
          attachments: request_attachments (
            id,
            file_name,
            file_url,
            file_type,
            created_at,
            uploaded_by
          ),
          history: request_history (
            id,
            action,
            details,
            created_at,
            performed_by
          ),
          created_by: auth.users!created_by ( id, full_name, email ),
          assigned_to: auth.users!assigned_to ( id, full_name, email )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Generate a unique reference number
  static generateReference() {
    const prefix = 'REQ';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  }

  // Get requests for a user
  static async getUserRequests(userId, { status, page = 1, limit = 10 } = {}) {
    try {
      let query = supabase
        .from('service_requests')
        .select('*', { count: 'exact' });

      if (status) {
        query = query.eq('status', status);
      }

      query = query
        .eq('created_by', userId)
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      return { data, count, error: null };
    } catch (error) {
      return { data: null, count: 0, error };
    }
  }

  // Get assigned requests
  static async getAssignedRequests(userId, { status, page = 1, limit = 10 } = {}) {
    try {
      let query = supabase
        .from('service_requests')
        .select('*', { count: 'exact' });

      if (status) {
        query = query.eq('status', status);
      }

      query = query
        .eq('assigned_to', userId)
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      return { data, count, error: null };
    } catch (error) {
      return { data: null, count: 0, error };
    }
  }
}

// Additional utility functions
export const getStatusBadgeColor = (status) => {
  const colors = {
    pending: 'yellow',
    assigned: 'blue',
    in_progress: 'indigo',
    completed: 'green',
    rejected: 'red'
  };
  return colors[status] || 'gray';
};

export const formatRequestReference = (reference) => {
  return reference.replace(/^REQ-/, '').replace(/-/g, ' ');
};
