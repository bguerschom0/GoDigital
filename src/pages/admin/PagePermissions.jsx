// src/pages/admin/PagePermissions.jsx
import { useState, useEffect } from 'react'
import { supabase } from '@/config/supabase'
import { useAuth } from '@/context/AuthContext'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2 } from 'lucide-react'

const PagePermissions = () => {
  const [users, setUsers] = useState([])
  const [pages, setPages] = useState([])
  const [permissions, setPermissions] = useState({})
  const [selectedUser, setSelectedUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const { user: currentUser } = useAuth()

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
      // Fetch users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('status', 'active')
        .order('username')

      if (userError) throw userError

      // Fetch pages
      const { data: pageData, error: pageError } = await supabase
        .from('pages')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true })
        .order('name', { ascending: true })

      if (pageError) throw pageError

      setUsers(userData || [])
      setPages(pageData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserPermissions = async (userId) => {
    try {
      const { data: permissionData, error } = await supabase
        .from('page_permissions')
        .select('*')
        .eq('user_id', userId)

      if (error) throw error

      const permissionMap = {}
      permissionData?.forEach(perm => {
        permissionMap[perm.page_id] = perm
      })
      setPermissions(permissionMap)
    } catch (error) {
      console.error('Error fetching permissions:', error)
    }
  }

  const handlePermissionChange = async (pageId, permission, value) => {
    try {
      const existingPermission = permissions[pageId]
      
      if (existingPermission) {
        // Update existing permission
        const { error } = await supabase
          .from('page_permissions')
          .update({ 
            [permission]: value, 
            updated_at: new Date().toISOString() 
          })
          .eq('id', existingPermission.id)

        if (error) throw error
      } else {
        // Create new permission
        const { error } = await supabase
          .from('page_permissions')
          .insert([{
            user_id: selectedUser.id,
            page_id: pageId,
            [permission]: value,
            created_by: currentUser.id,
            created_at: new Date().toISOString()
          }])

        if (error) throw error
      }

      // Refresh permissions for the selected user
      await fetchUserPermissions(selectedUser.id)
    } catch (error) {
      console.error('Error updating permission:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Page Permissions Management</CardTitle>
        </CardHeader>
        <CardContent>
          {/* User Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Select User</label>
            <select
              value={selectedUser?.id || ''}
              onChange={(e) => {
                const user = users.find(u => u.id === e.target.value)
                setSelectedUser(user)
              }}
              className="w-full p-2 border rounded"
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
            <Tabs defaultValue="stakeholder">
              <TabsList className="mb-4">
                <TabsTrigger value="stakeholder">Stakeholder</TabsTrigger>
                <TabsTrigger value="background">Background Check</TabsTrigger>
                <TabsTrigger value="report">Reports</TabsTrigger>
              </TabsList>

              {['stakeholder', 'background', 'report'].map(category => (
                <TabsContent key={category} value={category}>
                  <div className="space-y-4">
                    {pages
                      .filter(page => page.category === category)
                      .map(page => (
                        <div key={page.id} className="flex items-center justify-between p-4 border rounded hover:bg-gray-50">
                          <div>
                            <h3 className="font-medium">{page.name}</h3>
                            <p className="text-sm text-gray-500">{page.description}</p>
                          </div>
                          <div className="flex space-x-4">
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={permissions[page.id]?.can_access || false}
                                onChange={(e) => handlePermissionChange(page.id, 'can_access', e.target.checked)}
                                className="rounded"
                              />
                              <span>Access Page</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={permissions[page.id]?.can_export || false}
                                onChange={(e) => handlePermissionChange(page.id, 'can_export', e.target.checked)}
                                className="rounded"
                              />
                              <span>Export Data</span>
                            </label>
                          </div>
                        </div>
                      ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default PagePermissions
