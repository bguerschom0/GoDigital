// src/pages/admin/PagePermissions.jsx
import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/layout'
import { supabase } from '@/config/supabase'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const PagePermissions = () => {
  const [users, setUsers] = useState([])
  const [pages, setPages] = useState([])
  const [permissions, setPermissions] = useState({})
  const [selectedUser, setSelectedUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch users
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('status', 'active')
        .order('username')

      // Fetch pages
      const { data: pageData } = await supabase
        .from('pages')
        .select('*')
        .eq('is_active', true)
        .order('category', 'name')

      // Fetch permissions if a user is selected
      if (selectedUser) {
        const { data: permissionData } = await supabase
          .from('page_permissions')
          .select('*')
          .eq('user_id', selectedUser.id)

        const permissionMap = {}
        permissionData?.forEach(perm => {
          permissionMap[perm.page_id] = perm
        })
        setPermissions(permissionMap)
      }

      setUsers(userData || [])
      setPages(pageData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePermissionChange = async (pageId, permission, value) => {
    try {
      const existingPermission = permissions[pageId]
      
      if (existingPermission) {
        // Update existing permission
        const { error } = await supabase
          .from('page_permissions')
          .update({ [permission]: value, updated_at: new Date() })
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
            created_by: auth.user().id
          }])

        if (error) throw error
      }

      // Refresh permissions
      fetchData()
    } catch (error) {
      console.error('Error updating permission:', error)
    }
  }

  return (
    <AdminLayout>
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
                <TabsList>
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
                          <div key={page.id} className="flex items-center justify-between p-4 border rounded">
                            <div>
                              <h3 className="font-medium">{page.name}</h3>
                              <p className="text-sm text-gray-500">{page.description}</p>
                            </div>
                            <div className="flex space-x-4">
                              <label className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={permissions[page.id]?.can_view || false}
                                  onChange={(e) => handlePermissionChange(page.id, 'can_view', e.target.checked)}
                                  className="rounded"
                                />
                                <span>View</span>
                              </label>
                              <label className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={permissions[page.id]?.can_download || false}
                                  onChange={(e) => handlePermissionChange(page.id, 'can_download', e.target.checked)}
                                  className="rounded"
                                />
                                <span>Download</span>
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
    </AdminLayout>
  )
}

export default PagePermissions
