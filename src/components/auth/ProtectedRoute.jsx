// src/components/auth/ProtectedRoute.jsx
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Loader2 } from 'lucide-react'

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading } = useAuth()
  const location = useLocation()

  console.log('ProtectedRoute Check:', {
    isLoading: loading,
    path: location.pathname,
    requireAdmin,
    userRole: user?.role,
    username: user?.username
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  // Check if user is authenticated
  if (!user) {
    console.log('No authenticated user, redirecting to login')
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Check for admin routes
  if (requireAdmin && user.role !== 'admin') {
    console.log('Admin access required but user is not admin, redirecting to dashboard')
    return <Navigate to="/user/dashboard" replace />
  }

  // Check user status
  if (user.status !== 'active') {
    console.log('User account is inactive')
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Account Inactive</h2>
            <p className="text-gray-600 mb-4">
              Your account is currently inactive. Please contact your administrator for assistance.
            </p>
            <button
              onClick={() => window.location.href = '/login'}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Return to Login
            </button>
          </div>
        </div>
      </div>
    )
  }

  // All checks passed, allow access
  console.log('Access granted:', location.pathname)
  return children
}

export default ProtectedRoute
