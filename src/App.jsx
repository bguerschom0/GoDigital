// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useContext } from 'react'
import { AuthProvider, AuthContext } from './context/AuthContext'
import AuthForm from './components/auth/AuthForm'
import AdminDashboard from './pages/admin/Dashboard'
import AdminUsers from './pages/admin/Users'
import UserDashboard from './pages/user/Dashboard'
import NotFoundPage from './pages/error/NotFoundPage'

function App() {
  // Helper to determine redirection based on role
  const RequireAuth = ({ children }) => {
    const { user } = useContext(AuthContext)
    if (!user) {
      return <Navigate to="/" replace />
    }
    return children
  }

  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public route for login */}
          <Route path="/" element={<AuthForm />} />

          {/* Admin routes */}
          <Route
            path="/admin/*"
            element={
              <RequireAuth>
                {user?.role === 'admin' ? (
                  <>
                    <Routes>
                      <Route path="dashboard" element={<AdminDashboard />} />
                      <Route path="users" element={<AdminUsers />} />
                    </Routes>
                  </>
                ) : (
                  <Navigate to="/dashboard" replace />
                )}
              </RequireAuth>
            }
          />

          {/* User routes */}
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                {user?.role === 'user' ? (
                  <UserDashboard />
                ) : (
                  <Navigate to="/admin/dashboard" replace />
                )}
              </RequireAuth>
            }
          />

          {/* Catch-all for undefined routes */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
