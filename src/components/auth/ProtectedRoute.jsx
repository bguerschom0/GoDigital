// src/components/auth/ProtectedRoute.jsx
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Loader2 } from 'lucide-react'

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading } = useAuth()
  const location = useLocation()

  
  console.log('ProtectedRoute Check:', {
    isLoading: loading,
    user: user?.username,
    requireAdmin,
    path: location.pathname
  })
  

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Check for admin requirement
  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/user/dashboard" replace />
  }

    // For non-admin routes, allow normal users and admins
  if (!requireAdmin && user.role === 'user') {
    // This is a user route, allow access
    return children
  }

  // Check if user is inactive
  if (user.status !== 'active') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Account Inactive</h2>
            <p className="text-gray-600 mb-4">
              Your account is currently inactive. Please contact your administrator for assistance.
            </p>
            <button
              onClick={() => {
                // You can add a signOut function here if needed
                window.location.href = '/login'
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Return to Login
            </button>
          </div>
        </div>
      </div>
    )
  }

  // All checks passed, render the protected content
  return children
}

export default ProtectedRoute
