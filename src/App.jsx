// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import AuthForm from './components/auth/AuthForm'
import Dashboard from './pages/admin/Dashboard'
import Users from './pages/admin/Users'
import NewRequest from './pages/stakeholder/NewRequest'
import PendingRequests from './pages/stakeholder/PendingRequests'
import UpdateRequest from './pages/stakeholder/UpdateRequest'
import { AlertTriangle } from 'lucide-react'

const ErrorPage = ({ title, message }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
      <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
      <p className="text-gray-600 mb-4">{message}</p>
      <Link to="/login" className="text-blue-500 hover:text-blue-600">
        Return to Login
      </Link>
    </div>
  </div>
)

const UnauthorizedPage = () => (
  <ErrorPage 
    title="Unauthorized Access" 
    message="You don't have permission to access this page." 
  />
)

const NotFoundPage = () => (
  <ErrorPage 
    title="Page Not Found" 
    message="The page you're looking for doesn't exist." 
  />
)

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<AuthForm />} />
          
          <Route 
            path="/admin/*" 
            element={
              <ProtectedRoute>
                <Routes>
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="users" element={<Users />} />
                  <Route path="stakeholder/new" element={<NewRequest />} />
                  <Route path="stakeholder/pending" element={<PendingRequests />} />
                  <Route path="stakeholder/update" element={<UpdateRequest />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </ProtectedRoute>
            }
          />

          <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
