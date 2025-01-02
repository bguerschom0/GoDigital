// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { usePageAccess } from '@/hooks/usePageAccess'

export const ProtectedRoute = ({ children, path }) => {
  const { user } = useAuth()
  const { checkPermission } = usePageAccess()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  const permission = checkPermission(path)
  if (!permission.canAccess) {
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/user/dashboard'} replace />
  }

  return children
}
