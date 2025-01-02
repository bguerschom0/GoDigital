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
      // Admin has access to everything with all permissions
      if (user.role === 'admin') {
        setPermissions({
          '*': {
            canAccess: true,
            canExport: true,
            canEdit: true,
            canDelete: true,
            isVisible: true
          }
        })
        setLoading(false)
        return
      }

      // Fetch user's page permissions with page details
      const { data: permissionData, error } = await supabase
        .from('page_permissions')
        .select(`
          id,
          can_view,
          can_edit,
          can_delete,
          can_download,
          pages (
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
          canAccess: perm.can_view,
          canExport: perm.can_download,
          canEdit: perm.can_edit,
          canDelete: perm.can_delete,
          isVisible: perm.can_view,
          pageName: perm.pages.name,
          category: perm.pages.category
        }
      })

      // Always allow access to user dashboard
      permMap['/user/dashboard'] = {
        canAccess: true,
        canExport: false,
        canEdit: false,
        canDelete: false,
        isVisible: true,
        pageName: 'Dashboard',
        category: 'dashboard'
      }

      setPermissions(permMap)
    } catch (error) {
      console.error('Error fetching permissions:', error)
      setPermissions({})
    } finally {
      setLoading(false)
    }
  }

  const checkPermission = (path) => {
    // Admin has full access
    if (user?.role === 'admin') {
      return {
        canAccess: true,
        canExport: true,
        canEdit: true,
        canDelete: true,
        isVisible: true
      }
    }

    // User dashboard is always accessible to logged-in users
    if (path === '/user/dashboard') {
      return {
        canAccess: true,
        canExport: false,
        canEdit: false,
        canDelete: false,
        isVisible: true
      }
    }

    const permission = permissions[path] || {}
    return {
      canAccess: !!permission.canAccess,
      canExport: !!permission.canExport,
      canEdit: !!permission.canEdit,
      canDelete: !!permission.canDelete,
      isVisible: !!permission.isVisible
    }
  }

  return {
    permissions,
    loading,
    checkPermission,
    refreshPermissions: fetchUserPermissions
  }
}
