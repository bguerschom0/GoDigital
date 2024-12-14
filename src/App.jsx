// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import AuthForm from './components/auth/AuthForm'
import Dashboard from './pages/admin/Dashboard'
import Users from './pages/admin/Users'
import NewRequest from './pages/stakeholder/NewRequest'
import PendingRequests from './pages/stakeholder/PendingRequests'
import UpdateRequest from './pages/stakeholder/UpdateRequest'

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<AuthForm />} />
          
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="stakeholder/new" element={<NewRequest />} />
            <Route path="stakeholder/pending" element={<PendingRequests />} />
            <Route path="stakeholder/update" element={<UpdateRequest />} />
          </Route>

          <Route path="/" element={<Navigate to="/admin" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
