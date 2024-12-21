// src/components/auth/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

const ProtectedRoute = ({ children, requireAdmin }) => {
  const { user, loading } = useAuth()
  console.log('ProtectedRoute - User:', user, 'Loading:', loading, 'RequireAdmin:', requireAdmin)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    console.log('ProtectedRoute - No user, redirecting to login')
    return <Navigate to="/login" replace />
  }

  if (requireAdmin && user.role !== 'admin') {
    console.log('ProtectedRoute - User is not admin, redirecting to user dashboard')
    return <Navigate to="/user/dashboard" replace />
  }

  console.log('ProtectedRoute - Rendering protected content')
  return children
}
