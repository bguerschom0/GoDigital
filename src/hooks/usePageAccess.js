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

      const permMap = {}
      permissionData?.forEach(perm => {
        permMap[perm.pages.path] = {
          canAccess: perm.can_access,
          canExport: perm.can_export,
          name: perm.pages.name,
          category: perm.pages.category
        }
      })
      setPermissions(permMap)
    } catch (error) {
      console.error('Error fetching permissions:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkPermission = (path) => {
    if (user?.role === 'admin') return { canAccess: true, canExport: true }
    return {
      canAccess: permissions[path]?.canAccess || false,
      canExport: permissions[path]?.canExport || false
    }
  }

  return { permissions, loading, checkPermission, refreshPermissions: fetchUserPermissions }
}
