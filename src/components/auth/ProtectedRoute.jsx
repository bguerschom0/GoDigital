// src/components/auth/ProtectedRoute.jsx
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

const ProtectedRoute = ({ children, allowedRoles = ['user', 'supervisor', 'admin'] }) => {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  if (user.status !== 'active') {
    return <Navigate to="/account-suspended" replace />
  }

  return children
}

export default ProtectedRoute
