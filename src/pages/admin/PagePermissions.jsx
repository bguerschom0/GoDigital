// src/pages/admin/PagePermissions.jsx
import { useState, useEffect } from 'react'
import { supabase } from '@/config/supabase'
import { useAuth } from '@/context/AuthContext'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { 
  Loader2, 
  Save,
  RefreshCcw,
  AlertTriangle
} from 'lucide-react'

const PagePermissions = () => {
  const [users, setUsers] = useState([])
  const [pages, setPages] = useState([])
  const [permissions, setPermissions] = useState({})
  const [selectedUser, setSelectedUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { user: currentUser } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (selectedUser) {
      fetchUserPermissions(selectedUser.id)
    }
  }, [selectedUser])

  const fetchData = async () => {
    try {
      setLoading(true)
      // Fetch non-admin users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('status', 'active')
        .neq('role', 'admin')
        .order('username')

      if (userError) throw userError

      // Fetch active pages
      const { data: pageData, error: pageError } = await supabase
        .from('pages')
        .select('*')
        .eq('is_active', true)
        .order('category')
        .order('name')

      if (pageError) throw pageError

      setUsers(userData || [])
      setPages(pageData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      toast({
        title: 'Error',
        description: 'Failed to load users and pages',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchUserPermissions = async (userId) => {
    try {
      const { data: permissionData, error } = await supabase
        .from('page_permissions')
        .select('*, pages!inner(*)')
        .eq('user_id', userId)

      if (error) throw error

      const permissionMap = {}
      permissionData?.forEach(perm => {
        permissionMap[perm.page_id] = {
          id: perm.id,
          can_view: perm.can_view,
          can_edit: perm.can_edit,
          can_delete: perm.can_delete,
          can_download: perm.can_download
        }
      })
      setPermissions(permissionMap)
    } catch (error) {
      console.error('Error fetching permissions:', error)
      toast({
        title: 'Error',
        description: 'Failed to load user permissions',
        variant: 'destructive'
      })
    }
  }

  const handlePermissionChange = (pageId, field, value) => {
    setPermissions(prev => ({
      ...prev,
      [pageId]: {
        ...prev[pageId],
        [field]: value,
        // If can_view is being set to false, reset other permissions
        ...(field === 'can_view' && !value && {
          can_edit: false,
          can_delete: false,
          can_download: false
        })
      }
    }))
  }

  const savePermissions = async () => {
    if (!selectedUser) return

    try {
      setSaving(true)
      
      // Prepare batch operations
      const updates = []
      const inserts = []

      Object.entries(permissions).forEach(([pageId, perms]) => {
        const permData = {
          user_id: selectedUser.id,
          page_id: pageId,
          can_view: perms.can_view || false,
          can_edit: perms.can_edit || false,
          can_delete: perms.can_delete || false,
          can_download: perms.can_download || false,
          updated_at: new Date().toISOString()
        }

        if (perms.id) {
          updates.push({
            ...permData,
            id: perms.id
          })
        } else {
          inserts.push({
            ...permData,
            created_by: currentUser.id
          })
        }
      })

      // Perform batch operations
      if (updates.length > 0) {
        const { error: updateError } = await supabase
          .from('page_permissions')
          .upsert(updates)
        if (updateError) throw updateError
      }

      if (inserts.length > 0) {
        const { error: insertError } = await supabase
          .from('page_permissions')
          .insert(inserts)
        if (insertError) throw insertError
      }

      toast({
        title: 'Success',
        description: 'Permissions updated successfully'
      })

      // Refresh permissions
      await fetchUserPermissions(selectedUser.id)
    } catch (error) {
      console.error('Error saving permissions:', error)
      toast({
        title: 'Error',
        description: 'Failed to save permissions',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  const categories = ['dashboard', 'stakeholder', 'background', 'security_services', 'reports']

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Page Permissions Management</span>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchData}
              className="ml-2"
            >
              <RefreshCcw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* User Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select User
            </label>
            <select
              value={selectedUser?.id || ''}
              onChange={(e) => {
                const user = users.find(u => u.id === e.target.value)
                setSelectedUser(user)
              }}
              className="w-full p-2 border rounded-md bg-white dark:bg-gray-800"
            >
              <option value="">Select a user...</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.fullname} ({user.username})
                </option>
              ))}
            </select>
          </div>

          {selectedUser && (
            <>
              <Tabs defaultValue={categories[0]}>
                <TabsList className="mb-4">
                  {categories.map(category => (
                    <TabsTrigger key={category} value={category} className="capitalize">
                      {category.replace('_', ' ')}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {categories.map(category => (
                  <TabsContent key={category} value={category}>
                    <div className="space-y-4">
                      {pages
                        .filter(page => page.category === category)
                        .map(page => {
                          const pagePerms = permissions[page.id] || {}
                          const hasAccess = pagePerms.can_view
                          
                          return (
                            <div 
                              key={page.id} 
                              className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <h3 className="font-medium">{page.name}</h3>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {page.description}
                                  </p>
                                </div>
                                <div className="flex space-x-6">
                                  {/* View Permission */}
                                  <label className="flex items-center space-x-2">
                                    <input
                                      type="checkbox"
                                      checked={pagePerms.can_view || false}
                                      onChange={(e) => handlePermissionChange(page.id, 'can_view', e.target.checked)}
                                      className="rounded border-gray-300"
                                    />
                                    <span>View</span>
                                  </label>

                                  {/* Additional permissions - only enabled if can_view is true */}
                                  <label className="flex items-center space-x-2">
                                    <input
                                      type="checkbox"
                                      checked={pagePerms.can_download || false}
                                      onChange={(e) => handlePermissionChange(page.id, 'can_download', e.target.checked)}
                                      disabled={!hasAccess}
                                      className="rounded border-gray-300"
                                    />
                                    <span>Export</span>
                                  </label>

                                  <label className="flex items-center space-x-2">
                                    <input
                                      type="checkbox"
                                      checked={pagePerms.can_edit || false}
                                      onChange={(e) => handlePermissionChange(page.id, 'can_edit', e.target.checked)}
                                      disabled={!hasAccess}
                                      className="rounded border-gray-300"
                                    />
                                    <span>Edit</span>
                                  </label>

                                  <label className="flex items-center space-x-2">
                                    <input
                                      type="checkbox"
                                      checked={pagePerms.can_delete || false}
                                      onChange={(e) => handlePermissionChange(page.id, 'can_delete', e.target.checked)}
                                      disabled={!hasAccess}
                                      className="rounded border-gray-300"
                                    />
                                    <span>Delete</span>
                                  </label>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>

              {/* Save Button */}
              <div className="mt-6 flex justify-end">
                <Button 
                  onClick={savePermissions} 
                  disabled={saving}
                  className="w-full sm:w-auto"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save Permissions
                </Button>
              </div>
            </>
          )}

          {!selectedUser && (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
              <AlertTriangle className="w-12 h-12 mb-4 opacity-50" />
              <p className="text-lg font-medium">No User Selected</p>
              <p className="text-sm text-center mt-1">
                Please select a user to manage their permissions
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default PagePermissions
