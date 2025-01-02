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

      setPermissions(permMap)
    } catch (error) {
      console.error('Error fetching permissions:', error)
      setPermissions({})
    } finally {
      setLoading(false)
    }
  }

  const checkPermission = (path) => {
    // Admin has full access to everything
    if (user?.role === 'admin') {
      return {
        canAccess: true,
        canExport: true
      }
    }

    // User dashboard is always accessible to authenticated users
    if (path === '/user/dashboard') {
      return {
        canAccess: true,
        canExport: false
      }
    }

    // Check specific page permissions
    const permission = permissions[path] || {}
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

// Example usage in a protected route component:
export const ProtectedRoute = ({ children, path }) => {
  const { user } = useAuth()
  const { checkPermission, loading } = usePageAccess()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/login')
        return
      }

      const { canAccess } = checkPermission(path)
      if (!canAccess) {
        navigate(user.role === 'admin' ? '/admin/dashboard' : '/user/dashboard')
      }
    }
  }, [user, path, loading, navigate])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return children
}

// Example usage in a component that needs export functionality
export const ExampleComponent = () => {
  const { checkPermission } = usePageAccess()
  const currentPath = window.location.pathname
  const { canAccess, canExport } = checkPermission(currentPath)

  if (!canAccess) return null

  return (
    <div>
      {/* Regular content */}
      <h1>Content Title</h1>
      
      {/* Export button only shown if user has export permission */}
      {canExport && (
        <Button onClick={handleExport}>
          Export Data
        </Button>
      )}
    </div>
  )
}
