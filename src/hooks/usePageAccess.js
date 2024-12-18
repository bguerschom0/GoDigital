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
    console.log('=== Fetching User Permissions ===')
    console.log('Current user:', user)

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

      if (error) throw error

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
      console.error('Error fetching permissions:', error)
      setPermissions({})
    } finally {
      setLoading(false)
    }
  }

  const checkPermission = (path) => {
    console.log('=== Checking Permission ===', {
      path,
      userRole: user?.role,
      hasPermissions: !!permissions[path]
    })

    // Admin has access to everything
    if (user?.role === 'admin') {
      console.log('Admin access granted')
      return { canAccess: true, canExport: true }
    }

    // Regular users need explicit permissions
    const hasAccess = permissions[path]?.canAccess || false
    console.log(`Permission result for ${path}: ${hasAccess}`)
    
    return {
      canAccess: hasAccess,
      canExport: permissions[path]?.canExport || false
    }
  }

  return { 
    permissions, 
    loading, 
    checkPermission, 
    refreshPermissions: fetchUserPermissions,
    isAdmin: user?.role === 'admin'
  }
}
