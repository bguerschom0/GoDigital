import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/config/supabase'

// In usePageAccess.js
export const usePageAccess = () => {
  const [permissions, setPermissions] = useState({})
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    fetchUserPermissions()
  }, [user])

  const fetchUserPermissions = async () => {
    console.log('=== Fetching User Permissions ===')
    console.log('Current User:', user)

    if (!user) {
      console.log('No user found - clearing permissions')
      setPermissions({})
      setLoading(false)
      return
    }

    // If user is admin, we don't need to fetch permissions
    if (user.role === 'admin') {
      console.log('User is admin - granting all permissions')
      setPermissions({})
      setLoading(false)
      return
    }

    try {
      console.log('Fetching permissions from database...')
      const { data: permissionData, error } = await supabase
        .from('page_permissions')
        .select(`
          page_id,
          can_access,
          can_export,
          pages (
            path,
            category,
            name
          )
        `)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error fetching permissions:', error)
        throw error
      }

      console.log('Retrieved permissions:', permissionData)

      const permMap = {}
      permissionData?.forEach(perm => {
        permMap[perm.pages.path] = {
          canAccess: perm.can_access,
          canExport: perm.can_export,
          name: perm.pages.name,
          category: perm.pages.category
        }
      })

      console.log('Processed permission map:', permMap)
      setPermissions(permMap)
    } catch (error) {
      console.error('Error in permission fetch:', error)
      setPermissions({})
    } finally {
      setLoading(false)
    }
  }

  const checkPermission = (path) => {
    console.log('=== Checking Permission ===')
    console.log('Path:', path)
    console.log('User Role:', user?.role)
    
    // Admin check
    if (user?.role === 'admin') {
      console.log('Admin access granted automatically')
      return { canAccess: true, canExport: true }
    }

    // Regular user permission check
    const permission = permissions[path]
    console.log('Found permissions:', permission)
    
    const result = {
      canAccess: permissions[path]?.canAccess || false,
      canExport: permissions[path]?.canExport || false
    }
    
    console.log('Permission check result:', result)
    return result
  }

  return { 
    permissions, 
    loading, 
    checkPermission, 
    refreshPermissions: fetchUserPermissions,
    isAdmin: user?.role === 'admin'
  }
}
