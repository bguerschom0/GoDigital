// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import AuthForm from './components/auth/AuthForm'
import { AdminLayout, UserLayout } from './components/layout'
import { useAuth } from './context/AuthContext'

// Admin-only Pages
import Users from './pages/admin/Users'
import PagePermissions from './pages/admin/PagePermissions'
import AdminDashboard from './pages/admin/Dashboard'

// Regular Pages
import UserDashboard from './pages/user/Dashboard'
import NewRequest from './pages/stakeholder/NewRequest'
import PendingRequests from './pages/stakeholder/PendingRequests'
import UpdateRequest from './pages/stakeholder/UpdateRequest'
import DeleteRequest from './pages/stakeholder/DeleteRequest'
import AllRequests from './pages/stakeholder/AllRequests'
// ... import other pages

// Root component to handle initial redirect
const Root = () => {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/user/dashboard'} replace />
}

// Admin routes component
const AdminRoutes = () => {
  const { user } = useAuth()

  if (user?.role !== 'admin') {
    return <Navigate to="/user/dashboard" replace />
  }

  return (
    <Routes>
      <Route path="/" element={<AdminLayout />}>
        {/* Admin Dashboard */}
        <Route index element={<AdminDashboard />} />
        <Route path="dashboard" element={<AdminDashboard />} />

        {/* Shared Routes */}
        <Route path="stakeholder">
          <Route path="new" element={<NewRequest />} />
          <Route path="pending" element={<PendingRequests />} />
          <Route path="update" element={<UpdateRequest />} />
          <Route path="delete" element={<DeleteRequest />} />
          <Route path="all" element={<AllRequests />} />
        </Route>

        {/* Other shared routes... */}
      </Route>
    </Routes>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<AuthForm />} />
          
          {/* Root Route */}
          <Route path="/" element={<Root />} />

          {/* Admin-only Routes */}
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute requireAdmin>
                <AdminLayout>
                  <Users />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/permissions"
            element={
              <ProtectedRoute requireAdmin>
                <AdminLayout>
                  <PagePermissions />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* Regular Admin Routes */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute>
                <AdminRoutes />
              </ProtectedRoute>
            }
          />

          {/* User Routes */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <UserRoutes />
              </ProtectedRoute>
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
