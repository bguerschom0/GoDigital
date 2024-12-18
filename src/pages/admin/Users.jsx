// src/pages/admin/Users.jsx
import { useState, useEffect } from 'react'
import { supabase } from '@/config/supabase'
import { useAuth } from '@/context/AuthContext'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { 
  Trash2, 
  Edit, 
  Plus, 
  Key, 
  Loader2,
  Shield,
  CheckCircle2,
  XCircle
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const Users = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState(null)
  const [showUserModal, setShowUserModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    fullname: '',
    password: '',
    role: 'user',
    status: 'active'
  })
  const [passwordData, setPasswordData] = useState({
    password: '',
    confirmPassword: ''
  })
  const { toast } = useToast()
  const { user: currentUser } = useAuth()

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    if (selectedUser && showUserModal) {
      setFormData({
        username: selectedUser.username,
        fullname: selectedUser.fullname,
        password: '',
        role: selectedUser.role,
        status: selectedUser.status
      })
    }
  }, [selectedUser, showUserModal])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch users',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (selectedUser) {
        // Update user
        const { error } = await supabase
          .from('users')
          .update({
            username: formData.username,
            fullname: formData.fullname,
            role: formData.role,
            status: formData.status,
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedUser.id)

        if (error) throw error

        toast({
          title: 'Success',
          description: 'User updated successfully'
        })
      } else {
        // Create new user
        const { error } = await supabase
          .from('users')
          .insert([{
            username: formData.username,
            fullname: formData.fullname,
            password: formData.password,
            role: formData.role,
            status: formData.status,
            created_by: currentUser.id
          }])

        if (error) throw error

        toast({
          title: 'Success',
          description: 'User created successfully'
        })
      }

      setShowUserModal(false)
      setSelectedUser(null)
      fetchUsers()
    } catch (error) {
      console.error('Error saving user:', error)
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    }
  }

  const handlePasswordUpdate = async (e) => {
    e.preventDefault()
    if (passwordData.password !== passwordData.confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        variant: 'destructive'
      })
      return
    }

    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          password: passwordData.password,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedUser.id)

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Password updated successfully'
      })
      setShowPasswordModal(false)
      setSelectedUser(null)
      setPasswordData({ password: '', confirmPassword: '' })
    } catch (error) {
      console.error('Error updating password:', error)
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    }
  }

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', selectedUser.id)

      if (error) throw error

      toast({
        title: 'Success',
        description: 'User deleted successfully'
      })
      setShowDeleteDialog(false)
      setSelectedUser(null)
      fetchUsers()
    } catch (error) {
      console.error('Error deleting user:', error)
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    }
  }



  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
          <p className="text-gray-500">Manage system users and their permissions</p>
        </div>
        <Button onClick={() => {
          setSelectedUser(null)
          setFormData({
            username: '',
            fullname: '',
            password: '',
            role: 'user',
            status: 'active'
          })
          setShowUserModal(true)
        }}>
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
          </div>
        ) : (
         <Table>
  <TableHeader>
    <TableRow>
      <TableHead className="w-[50px]">Username</TableHead>
      <TableHead className="w-[100px]">Full Name</TableHead>
      <TableHead className="w-[500px]">Role</TableHead>
      <TableHead className="w-[500px]">Status</TableHead>
      <TableHead className="w-[100px] text-right">Actions</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {users.map((user) => (
      <TableRow key={user.id}>
        <TableCell className="py-2">{user.username}</TableCell>
        <TableCell className="py-2">{user.fullname}</TableCell>
        <TableCell className="py-2">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
            ${user.role === 'admin' 
              ? 'bg-purple-100 text-purple-800' 
              : user.role === 'supervisor'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-gray-100 text-gray-800'
            }`}>
            {user.role}
          </span>
        </TableCell>
        <TableCell className="py-2">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
            ${user.status === 'active' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
            }`}>
            {user.status === 'active' ? (
              <CheckCircle2 className="w-3 h-3 mr-1" />
            ) : (
              <XCircle className="w-3 h-3 mr-1" />
            )}
            {user.status}
          </span>
        </TableCell>
        <TableCell className="py-2 text-right">
          <div className="flex justify-end space-x-1">
            <Button
              variant="ghost"
              size="sm"
              className="p-1 h-8 w-8"
              onClick={() => {
                setSelectedUser(user)
                setShowPasswordModal(true)
              }}
            >
              <Key className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="p-1 h-8 w-8"
              onClick={() => {
                setSelectedUser(user)
                setShowUserModal(true)
              }}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="p-1 h-8 w-8"
              onClick={() => {
                setSelectedUser(user)
                setShowDeleteDialog(true)
              }}
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
        )}
      </div>

      {/* Create/Edit User Modal */}
      <Dialog open={showUserModal} onOpenChange={() => setShowUserModal(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedUser ? 'Edit User' : 'Create New User'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
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
              <Label htmlFor="fullname">Full Name</Label>
              <Input
                id="fullname"
                value={formData.fullname}
                onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
                required
              />
            </div>
            {!selectedUser && (
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
            )}
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="supervisor">Supervisor</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowUserModal(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {selectedUser ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Password Modal */}
      <Dialog open={showPasswordModal} onOpenChange={() => setShowPasswordModal(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
          </DialogHeader>
          <form onSubmit={handlePasswordUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={passwordData.password}
                onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowPasswordModal(false)}>
                Cancel
              </Button>
              <Button type="submit">Update Password</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={() => setShowDeleteDialog(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user
              account and remove their data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default Users
