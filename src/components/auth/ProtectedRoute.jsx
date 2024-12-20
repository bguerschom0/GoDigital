// src/components/auth/ProtectedRoute.jsx
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { usePageAccess } from '@/hooks/usePageAccess'

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading } = useAuth()
  const { checkPermission } = usePageAccess()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/user/dashboard" replace />
  }

  if (!requireAdmin && user.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />
  }

  // Check page permission if not admin
  if (!requireAdmin && user.role !== 'admin') {
    const path = location.pathname
    const { canAccess } = checkPermission(path)
    
    if (!canAccess) {
      return <Navigate to="/user/dashboard" replace />
    }
  }

  return children
}

export default ProtectedRoute
