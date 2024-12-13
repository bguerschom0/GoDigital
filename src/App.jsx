// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import AuthForm from './components/auth/AuthForm'
import { AdminLayout, UserLayout } from './components/layout'

// Admin Pages
import Dashboard from './pages/admin/Dashboard'
import Users from './pages/admin/Users'
import PagePermissions from './pages/admin/PagePermissions'

// Stakeholder Pages
import NewRequest from './pages/stakeholder/NewRequest'
import PendingRequests from './pages/stakeholder/PendingRequests'
import UpdateRequest from './pages/stakeholder/UpdateRequest'

// Background Check Pages
import NewBackgroundCheck from './pages/background/NewBackgroundCheck'
import PendingBackgroundChecks from './pages/background/PendingBackgroundChecks'
import UpdateBackgroundCheck from './pages/background/UpdateBackgroundCheck'
import ExpiredDocuments from './pages/background/ExpiredDocuments'
import AllBackgroundChecks from './pages/background/AllBackgroundChecks'
import InternshipOverview from './pages/background/InternshipOverview'

// Report Pages
import StakeholderReport from './pages/reports/StakeholderReport'
import BackgroundCheckReport from './pages/reports/BackgroundCheckReport'

// User Pages
import UserDashboard from './pages/user/Dashboard'

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<AuthForm />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute requireAdmin>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="permissions" element={<PagePermissions />} />
            
            {/* Stakeholder Routes */}
            <Route path="stakeholder/new" element={<NewRequest />} />
            <Route path="stakeholder/pending" element={<PendingRequests />} />
            <Route path="stakeholder/update" element={<UpdateRequest />} />

            {/* Background Check Routes */}
            <Route path="background/new" element={<NewBackgroundCheck />} />
            <Route path="background/pending" element={<PendingBackgroundChecks />} />
            <Route path="background/update" element={<UpdateBackgroundCheck />} />
            <Route path="background/expired" element={<ExpiredDocuments />} />
            <Route path="background/all" element={<AllBackgroundChecks />} />
            <Route path="background/InternshipOverview" element={<InternshipOverview />} />

            {/* Report Routes */}
            <Route path="reports/stakeholder" element={<StakeholderReport />} />
            <Route path="reports/BackgroundCheckReport" element={<BackgroundCheckReport />} />
          </Route>

          {/* User Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <UserLayout>
                <UserDashboard />
              </UserLayout>
            </ProtectedRoute>
          } />

          {/* Root redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
