import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import AuthForm from './components/auth/AuthForm'
import { AdminLayout, UserLayout } from './components/layout'
import { useAuth } from './context/AuthContext'

// Admin Pages
import Dashboard from './pages/admin/Dashboard'
import Users from './pages/admin/Users'
import PagePermissions from './pages/admin/PagePermissions'

// User Pages
import UserDashboard from './pages/user/Dashboard'

// Root component to handle initial redirect
const Root = () => {
  const { user, loading } = useAuth()
  
  console.log('Root component - User:', user, 'Loading:', loading)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    console.log('No user found, redirecting to login')
    return <Navigate to="/login" replace />
  }

  console.log('User found, redirecting to dashboard')
  return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/user/dashboard'} replace />
}

// User routes component
const UserRoutes = () => {
  console.log('UserRoutes component rendered')
  return (
    <Routes>
      <Route path="/" element={<UserLayout />}>
        <Route index element={<Navigate to="/user/dashboard" replace />} />
        <Route path="user/dashboard" element={<UserDashboard />} />
        
         {/* User Stakeholder Routes */}
      <Route path="stakeholder">
        <Route path="new" element={<NewRequest />} />
        <Route path="pending" element={<PendingRequests />} />
        <Route path="update" element={<UpdateRequest />} />
        <Route path="DeleteRequest" element={<DeleteRequest />} />
        <Route path="AllRequests" element={<AllRequests />} />
      </Route>

      {/* User Background Check Routes */}
      <Route path="background">
        <Route path="new" element={<NewBackgroundCheck />} />
        <Route path="pending" element={<PendingBackgroundChecks />} />
        <Route path="update" element={<UpdateBackgroundCheck />} />
        <Route path="expired" element={<ExpiredDocuments />} />
        <Route path="all" element={<AllBackgroundChecks />} />
        <Route path="internship" element={<InternshipOverview />} />
      </Route>

      {/* User Report Routes */}
      <Route path="reports">
        <Route path="stakeholder" element={<StakeholderReport />} />
        <Route path="background" element={<BackgroundCheckReport />} />
      </Route>
      </Route>
    </Routes>
  )
}

// Protected route wrapper with debug
const DebugProtectedRoute = ({ children, requireAdmin = false }) => {
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

function App() {
  console.log('App component rendered')
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<AuthForm />} />
          
          {/* Root Route */}
          <Route path="/" element={<Root />} />

          {/* Protected User Routes */}
          <Route
            path="/*"
            element={
              <DebugProtectedRoute>
                <UserRoutes />
              </DebugProtectedRoute>
            }
          />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
