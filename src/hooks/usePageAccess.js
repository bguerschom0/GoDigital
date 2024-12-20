// src/hooks/usePageAccess.js
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/config/supabase'

export const usePageAccess = () => {
  const [permissions, setPermissions] = useState({})
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    fetchUserPermissions()
  }, [user])

  const fetchUserPermissions = async () => {
    console.log('Fetching user permissions for user:', user)
    
    if (!user) {
      console.log('No user found, clearing permissions')
      setPermissions({})
      setLoading(false)
      return
    }

    try {
      // Always grant access to admin users
      if (user.role === 'admin') {
        console.log('Admin user detected, granting all permissions')
        setPermissions({
          '*': { canAccess: true, canExport: true }
        })
        setLoading(false)
        return
      }

      console.log('Fetching permissions from database for user:', user.id)
      
      const { data: permissionData, error } = await supabase
        .from('page_permissions')
        .select(`
          id,
          can_access,
          can_export,
          pages!inner (
            id,
            path,
            name,
            category
          )
        `)
        .eq('user_id', user.id)

      if (error) throw error

      console.log('Raw permission data:', permissionData)

      const permMap = {}
      permissionData?.forEach(perm => {
        const path = perm.pages.path
        permMap[path] = {
          canAccess: perm.can_access,
          canExport: perm.can_export,
          pageName: perm.pages.name,
          category: perm.pages.category
        }
        console.log(`Setting permission for path ${path}:`, permMap[path])
      })

      setPermissions(permMap)
      console.log('Final permissions map:', permMap)
    } catch (error) {
      console.error('Error fetching permissions:', error)
      setPermissions({})
    } finally {
      setLoading(false)
    }
  }

  const checkPermission = (path) => {
    console.log('Checking permission for path:', path)
    console.log('Current user:', user)
    console.log('Current permissions:', permissions)

    // Admin has all permissions
    if (user?.role === 'admin') {
      console.log('Admin user, granting access')
      return { canAccess: true, canExport: true }
    }

    // Check for exact path match
    if (permissions[path]) {
      console.log(`Found exact permission match for ${path}:`, permissions[path])
      return {
        canAccess: permissions[path].canAccess,
        canExport: permissions[path].canExport
      }
    }

    // No permission found
    console.log('No permission found for path:', path)
    return {
      canAccess: false,
      canExport: false
    }
  }

  return {
    permissions,
    loading,
    checkPermission,
    refreshPermissions: fetchUserPermissions
  }
}
