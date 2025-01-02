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
        setPermissions({ 
          '*': { 
            canAccess: true,
            canExport: true
          } 
        })
        setLoading(false)
        return
      }

      // Fetch user's page permissions
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

      // Convert to permission map
      const permMap = {}
      permissionData?.forEach(perm => {
        const path = perm.pages.path
        permMap[path] = {
          canAccess: perm.can_access,
          canExport: perm.can_export,
          pageName: perm.pages.name,
          category: perm.pages.category
        }
      })

      // Always allow access to user dashboard for authenticated users
      permMap['/user/dashboard'] = {
        canAccess: true,
        canExport: false,
        pageName: 'Dashboard',
        category: 'dashboard'
      }

      console.log('Fetched permissions:', permMap) // Debug log
      setPermissions(permMap)
    } catch (error) {
      console.error('Error fetching permissions:', error)
      setPermissions({})
    } finally {
      setLoading(false)
    }
  }

  const checkPermission = (path) => {
    console.log('Checking permission for path:', path) // Debug log

    // Admin has full access to everything
    if (user?.role === 'admin') {
      console.log('User is admin - full access granted')
      return {
        canAccess: true,
        canExport: true
      }
    }

    // User dashboard is always accessible to authenticated users
    if (path === '/user/dashboard') {
      console.log('User dashboard path - access granted')
      return {
        canAccess: true,
        canExport: false
      }
    }

    // Check specific page permissions
    const permission = permissions[path] || {}
    console.log('Permission found for path:', path, permission) // Debug log
    return {
      canAccess: permission.canAccess || false,
      canExport: permission.canExport || false
    }
  }

  const getAccessiblePaths = () => {
    if (user?.role === 'admin') return ['*']
    
    return Object.entries(permissions)
      .filter(([_, permission]) => permission.canAccess)
      .map(([path]) => path)
  }

  const hasExportPermission = (path) => {
    if (user?.role === 'admin') return true
    return permissions[path]?.canExport || false
  }

  return {
    permissions,
    loading,
    checkPermission,
    getAccessiblePaths,
    hasExportPermission,
    refreshPermissions: fetchUserPermissions
  }
}
