// src/hooks/usePagePermission.js
import { useState, useEffect } from 'react'
import { supabase } from '@/config/supabase'
import { useAuth } from '@/context/AuthContext'

export const usePagePermission = (pagePath) => {
  const { user } = useAuth()
  const [permissions, setPermissions] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const { data: pageData } = await supabase
          .from('pages')
          .select('id')
          .eq('path', pagePath)
          .single()

        if (pageData) {
          const { data: permissionData } = await supabase
            .from('page_permissions')
            .select('*')
            .eq('user_id', user.id)
            .eq('page_id', pageData.id)
            .single()

          setPermissions(permissionData || null)
        }
      } catch (error) {
        console.error('Error fetching permissions:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchPermissions()
    }
  }, [user, pagePath])

  return {
    loading,
    canView: permissions?.can_view || false,
    canDownload: permissions?.can_download || false
  }
}
