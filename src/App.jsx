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
import { AdminLayout } from './components/layout'
import StakeholderReport from './pages/reports/StakeholderReport'

import NewBackgroundCheck from './pages/background/NewBackgroundCheck'
import PendingBackgroundChecks from './pages/background/PendingBackgroundChecks'
import UpdateBackgroundCheck from './pages/background/UpdateBackgroundCheck'
import ExpiredDocuments from './pages/background/ExpiredDocuments'
import AllBackgroundChecks from './pages/background/AllBackgroundChecks'
import BackgroundCheckReport from './pages/reports/BackgroundCheckReport'

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<AuthForm />} />
          
          <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="stakeholder/new" element={<NewRequest />} />
            <Route path="stakeholder/pending" element={<PendingRequests />} />
            <Route path="stakeholder/update" element={<UpdateRequest />} />
            <Route path="reports/stakeholder" element={<StakeholderReport />} />
                      {/* Background Check Routes */}
            <Route path="background/new" element={<NewBackgroundCheck />} />
            <Route path="background/pending" element={<PendingBackgroundChecks />} />
            <Route path="background/update" element={<UpdateBackgroundCheck />} />
            <Route path="background/expired" element={<ExpiredDocuments />} />
            <Route path="background/all" element={<AllBackgroundChecks />} />
            <Route path="background/report" element={<BackgroundCheckReport />} />
          </Route>

          <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
