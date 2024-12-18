// src/components/auth/ProtectedRoute.jsx
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { usePageAccess } from '@/hooks/usePageAccess'
import { Loader2 } from 'lucide-react'

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  const location = useLocation()
  const { checkPermission } = usePageAccess()

  console.log('=== Protected Route Check ===', {
    path: location.pathname,
    userRole: user?.role,
    isLoggedIn: !!user,
    isLoading: loading
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    console.log('No user - redirecting to login')
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Check if user has access to this path
  const path = location.pathname.replace('/admin', '')
  const { canAccess } = checkPermission(path)

  console.log('Permission check result:', {
    path,
    canAccess,
    isAdmin: user.role === 'admin'
  })

  if (!canAccess && user.role !== 'admin') {
    console.log('Access denied - redirecting to dashboard')
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default ProtectedRoute
