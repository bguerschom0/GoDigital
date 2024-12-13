// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import AuthForm from './components/auth/AuthForm'
import Users from './pages/admin/Users'
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
          
          {/* Admin routes */}
          <Route path="/admin/users" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Users />
            </ProtectedRoute>
          } />
          
          {/* Redirect root to users for now */}
          <Route path="/" element={<Navigate to="/admin/users" replace />} />
          <Route path="/admin" element={<Navigate to="/admin/users" replace />} />
          
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
