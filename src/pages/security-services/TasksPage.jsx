// src/pages/tasks/TasksPage.jsx
import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Clock,
  Calendar,
  User,
  Phone,
  FileText,
  Timer,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/config/supabase';

const statusColors = {
  new: 'bg-blue-500',
  'in_progress': 'bg-yellow-500',
  'pending_investigation': 'bg-purple-500',
  'unable_to_handle': 'bg-red-500',
  completed: 'bg-green-500',
};

const TasksPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('available');
  const [availableRequests, setAvailableRequests] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequests();
    // Set up real-time subscription for new requests
    const subscription = supabase
      .channel('service_requests')
      .on('*', (payload) => {
        if (payload.new) {
          loadRequests();
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    try {
      // Load available requests
      const { data: available, error: availableError } = await supabase
        .from('service_requests')
        .select(\`
          *,
          created_by (fullname),
          service_details:service_metadata (*)
        \`)
        .eq('status', 'new')
        .order('created_at', { ascending: false });

      if (availableError) throw availableError;

      // Load my assigned requests
      const { data: assigned, error: assignedError } = await supabase
        .from('service_requests')
        .select(\`
          *,
          created_by (fullname),
          service_details:service_metadata (*)
        \`)
        .eq('assigned_to', user.id)
        .in('status', ['in_progress', 'pending_investigation'])
        .order('created_at', { ascending: false });

      if (assignedError) throw assignedError;

      setAvailableRequests(available || []);
      setMyRequests(assigned || []);
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestClick = async (request) => {
    try {
      const { data, error } = await supabase
        .from('service_requests')
        .update({
          status: 'in_progress',
          assigned_to: user.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', request.id)
        .select()
        .single();

      if (error) throw error;

      // Add to history
      await supabase
        .from('request_history')
        .insert({
          request_id: request.id,
          action: 'assigned',
          performed_by: user.id,
          details: `Request assigned to ${user.fullname}`
        });

      // Start timeout timer
      startTimeoutTimer(request.id);

      // Refresh requests
      loadRequests();
    } catch (error) {
      console.error('Error assigning request:', error);
    }
  };

  const startTimeoutTimer = (requestId) => {
    setTimeout(async () => {
      // Check if request is still in progress and not updated
      const { data: request } = await supabase
        .from('service_requests')
        .select('status, updated_at')
        .eq('id', requestId)
        .single();

      if (request?.status === 'in_progress') {
        const lastUpdate = new Date(request.updated_at);
        const now = new Date();
        const timeDiff = (now - lastUpdate) / 1000 / 60; // minutes

        if (timeDiff >= 30) {
          // Reset request to available
          await supabase
            .from('service_requests')
            .update({
              status: 'new',
              assigned_to: null,
              updated_at: new Date().toISOString()
            })
            .eq('id', requestId);

          // Add to history
          await supabase
            .from('request_history')
            .insert({
              request_id: requestId,
              action: 'timeout',
              performed_by: user.id,
              details: 'Request timed out and returned to available pool'
            });

          loadRequests();
        }
      }
    }, 30 * 60 * 1000); // 30 minutes
  };

  const RequestCard = ({ request, isAssigned = false }) => (
    <Card 
      className={`hover:shadow-lg transition-shadow cursor-pointer ${
        request.status === 'new' ? 'border-l-4 border-l-blue-500' : ''
      }`}
      onClick={() => !isAssigned && handleRequestClick(request)}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {request.reference_number}
            </h3>
            <p className="text-sm text-gray-500">
              {request.service_type.replace(/_/g, ' ').toUpperCase()}
            </p>
          </div>
          <Badge className={statusColors[request.status]}>
            {request.status.replace(/_/g, ' ')}
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <User className="w-4 h-4 mr-2" />
            {request.created_by.fullname}
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <Phone className="w-4 h-4 mr-2" />
            {request.primary_contact}
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="w-4 h-4 mr-2" />
            {new Date(request.created_at).toLocaleString()}
          </div>

          {request.status === 'in_progress' && (
            <div className="flex items-center text-sm text-yellow-600">
              <Timer className="w-4 h-4 mr-2" />
              Time remaining: {/* Add countdown timer here */}
            </div>
          )}
        </div>

        {isAssigned && (
          <div className="mt-4 flex justify-end space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="text-yellow-600"
              onClick={() => handleStatusChange(request.id, 'pending_investigation')}
            >
              <AlertCircle className="w-4 h-4 mr-2" />
              Pending Investigation
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-red-600"
              onClick={() => handleStatusChange(request.id, 'unable_to_handle')}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Unable to Handle
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-green-600"
              onClick={() => handleStatusChange(request.id, 'completed')}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Complete
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="available">
            Available Requests ({availableRequests.length})
          </TabsTrigger>
          <TabsTrigger value="my_requests">
            My Requests ({myRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-4">
          {availableRequests.map(request => (
            <RequestCard 
              key={request.id} 
              request={request} 
            />
          ))}
          {availableRequests.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              No available requests
            </div>
          )}
        </TabsContent>

        <TabsContent value="my_requests" className="space-y-4">
          {myRequests.map(request => (
            <RequestCard 
              key={request.id} 
              request={request}
              isAssigned={true}
            />
          ))}
          {myRequests.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              No assigned requests
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TasksPage;
