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
    if (!user) {
      setPermissions({})
      setLoading(false)
      return
    }

    try {
      // Admin has access to everything
      if (user.role === 'admin') {
        setPermissions({ '*': { canAccess: true } })
        setLoading(false)
        return
      }

      // Fetch user's page permissions
      const { data: permissionData, error } = await supabase
        .from('page_permissions')
        .select(`
          pages!inner (
            path,
            name,
            category
          )
        `)
        .eq('user_id', user.id)
        .eq('can_access', true)  // Only get pages they can access

      if (error) throw error

      // Convert to permission map
      const permMap = {}
      permissionData?.forEach(perm => {
        const path = perm.pages.path
        permMap[path] = {
          canAccess: true,
          pageName: perm.pages.name,
          category: perm.pages.category
        }
      })

      setPermissions(permMap)
    } catch (error) {
      console.error('Error fetching permissions:', error)
      setPermissions({})
    } finally {
      setLoading(false)
    }
  }

  const checkPermission = (path) => {
    // Dashboard is always accessible
    if (path === '/user/dashboard') {
      return { canAccess: true }
    }

    // Admin has access to everything
    if (user?.role === 'admin') {
      return { canAccess: true }
    }

    // Check if page is in permissions
    return {
      canAccess: !!permissions[path]
    }
  }

  return {
    permissions,
    loading,
    checkPermission,
    refreshPermissions: fetchUserPermissions
  }
}
