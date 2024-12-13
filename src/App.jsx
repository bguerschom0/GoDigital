// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import AuthForm from './components/auth/AuthForm'
import { AdminLayout } from './components/layout'
import AdminDashboard from './pages/admin/Dashboard'
import AdminUsers from './pages/admin/Users'
import UserDashboard from './pages/user/Dashboard'
import UnauthorizedPage from './pages/error/UnauthorizedPage'
import SuspendedPage from './pages/error/SuspendedPage'
import NotFoundPage from './pages/error/NotFoundPage'

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<AuthForm />} />
          
          {/* Protected routes - Admin only */}
          <Route path="/admin/*" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout>
                <Routes>
                  <Route path="AdminDashboard" element={<AdminDashboard />} />
                  <Route path="AdminUsers" element={<AdminUsers />} />
                </Routes>
              </AdminLayout>
            </ProtectedRoute>
          } />
          
          {/* Protected routes - All authenticated users */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          } />
          
          {/* Redirect root to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Error pages */}
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="/account-suspended" element={<SuspendedPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
