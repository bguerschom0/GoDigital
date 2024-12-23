import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Loader2,
  Trash2,
  Settings,
  Power,
  Signal,
  RefreshCcw
} from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/components/ui/use-toast';
import { Toaster } from '@/components/ui/toaster';

import { supabase } from '@/config/supabase';
import { controllerStatusService } from '@/services/controllerStatus';
import { hikvisionService } from '@/services/hikvision';
import { useAuth } from '@/context/AuthContext';
import { usePageAccess } from '@/hooks/usePageAccess';

const ControllersManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { checkPermission } = usePageAccess();
  const [pageLoading, setPageLoading] = useState(true);
  const [controllers, setControllers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedController, setSelectedController] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    ip_address: '',
    port: '80',
    username: '',
    password: '',
    location: '',
    description: ''
  });


useEffect(() => {
  fetchControllers();
}, []);

  useEffect(() => {
    if (controllers?.length > 0) {
      controllerStatusService.startStatusMonitoring(controllers);
      return () => {
        controllerStatusService.stopStatusMonitoring();
      };
    }
  }, [controllers]);

  const fetchControllers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('access_controllers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setControllers(data || []);

      data?.forEach(controller => {
        controllerStatusService.checkControllerStatus(controller);
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch controllers',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddController = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('access_controllers')
        .insert([{
          ...formData,
          added_by: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      setControllers([data, ...controllers]);
      setShowAddDialog(false);
      setFormData({
        name: '',
        ip_address: '',
        port: '80',
        username: '',
        password: '',
        location: '',
        description: ''
      });

      toast({
        title: 'Success',
        description: 'Controller added successfully'
      });

      controllerStatusService.checkControllerStatus(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add controller',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteController = async () => {
    try {
      const { error } = await supabase
        .from('access_controllers')
        .delete()
        .eq('id', selectedController.id);

      if (error) throw error;

      setControllers(controllers.filter(c => c.id !== selectedController.id));
      setShowDeleteDialog(false);
      setSelectedController(null);

      toast({
        title: 'Success',
        description: 'Controller deleted successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete controller',
        variant: 'destructive'
      });
    }
  };

  const checkStatus = async (controller) => {
    try {
      const status = await hikvisionService.getDeviceStatus(controller.id);
      const updatedControllers = controllers.map(c => {
        if (c.id === controller.id) {
          return {
            ...c,
            status: 'online',
            cpuUsage: status.cpuUsage,
            memoryUsage: status.memoryUsage
          };
        }
        return c;
      });
      setControllers(updatedControllers);

      toast({
        title: 'Status Updated',
        description: `${controller.name} is online`,
      });
    } catch (error) {
      const updatedControllers = controllers.map(c => {
        if (c.id === controller.id) {
          return { ...c, status: 'offline' };
        }
        return c;
      });
      setControllers(updatedControllers);

      toast({
        title: 'Status Check Failed',
        description: `${controller.name} is offline`,
        variant: 'destructive'
      });
    }
  };

  if (pageLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Access Controllers</h1>
            <p className="text-gray-500">Manage and monitor access control devices</p>
          </div>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Controller
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {controllers.map((controller) => (
            <Card key={controller.id}>
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg font-medium">
                      {controller.name}
                    </CardTitle>
                    <p className="text-sm text-gray-500">{controller.location}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        controller.status === 'online'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {controller.status === 'online' ? (
                        <Signal className="w-3 h-3 mr-1" />
                      ) : (
                        <Power className="w-3 h-3 mr-1" />
                      )}
                      {controller.status}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => checkStatus(controller)}
                    >
                      <RefreshCcw className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">IP Address:</span>
                    <span className="font-medium">{controller.ip_address}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Port:</span>
                    <span className="font-medium">{controller.port}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Last Online:</span>
                    <span className="font-medium">
                      {controller.last_online
                        ? new Date(controller.last_online).toLocaleString()
                        : 'Never'}
                    </span>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/access-control/controllers/${controller.id}/settings`)}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setSelectedController(controller);
                        setShowDeleteDialog(true);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Controller</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddController} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ip_address">IP Address</Label>
                <Input
                  id="ip_address"
                  value={formData.ip_address}
                  onChange={(e) => setFormData({ ...formData, ip_address: e.target.value })}
                  placeholder="192.168.1.100"
                  pattern="^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="port">Port</Label>
                <Input
                  id="port"
                  type="number"
                  value={formData.port}
                  onChange={(e) => setFormData({ ...formData, port: e.target.value })}
                  placeholder="80"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Building A, Floor 1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Additional details about the controller"
                  rows={3}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddDialog(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Add Controller</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Controller</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete {selectedController?.name}? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteController}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Toaster />
      </div>
    </div>
  );
};

export default ControllersManagement;
