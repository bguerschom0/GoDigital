// src/components/ProtectedRoute.jsx
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { usePageAccess } from '@/hooks/usePageAccess'
import { Loader2 } from 'lucide-react'

export const ProtectedRoute = ({ children, path }) => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { checkPermission, loading } = usePageAccess()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/login')
        return
      }

      const { canAccess } = checkPermission(path)
      console.log('Protected route check:', path, canAccess) // Debug log
      
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
