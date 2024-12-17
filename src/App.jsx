// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import AuthForm from './components/auth/AuthForm'
import Dashboard from './pages/admin/Dashboard'
import UserDashboard from './pages/user/Dashboard' // You'll need to create this
import Users from './pages/admin/Users'
import PagePermissions from './pages/admin/PagePermissions'
import NewRequest from './pages/stakeholder/NewRequest'
import PendingRequests from './pages/stakeholder/PendingRequests'
import UpdateRequest from './pages/stakeholder/UpdateRequest'
import { AdminLayout, UserLayout } from './components/layout' // You'll need to create UserLayout
import StakeholderReport from './pages/reports/StakeholderReport'
import NewBackgroundCheck from './pages/background/NewBackgroundCheck'
import PendingBackgroundChecks from './pages/background/PendingBackgroundChecks'
import UpdateBackgroundCheck from './pages/background/UpdateBackgroundCheck'
import ExpiredDocuments from './pages/background/ExpiredDocuments'
import AllBackgroundChecks from './pages/background/AllBackgroundChecks'
import BackgroundCheckReport from './pages/reports/BackgroundCheckReport'
import InternshipOverview from './pages/background/InternshipOverview'

// Root component to handle initial redirect
const RootRedirect = () => {
  const { user, loading } = useAuth()

  if (loading) return null

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} replace />
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<AuthForm />} />
          <Route path="/" element={<RootRedirect />} />

          {/* User routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <UserLayout>
                <UserDashboard />
              </UserLayout>
            </ProtectedRoute>
          } />

          {/* Admin routes */}
          <Route path="/admin" element={
            <ProtectedRoute requireAdmin>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="permissions" element={<PagePermissions />} />
            <Route path="stakeholder">
              <Route path="new" element={<NewRequest />} />
              <Route path="pending" element={<PendingRequests />} />
              <Route path="update" element={<UpdateRequest />} />
            </Route>
            <Route path="background">
              <Route path="new" element={<NewBackgroundCheck />} />
              <Route path="pending" element={<PendingBackgroundChecks />} />
              <Route path="update" element={<UpdateBackgroundCheck />} />
              <Route path="expired" element={<ExpiredDocuments />} />
              <Route path="all" element={<AllBackgroundChecks />} />
              <Route path="InternshipOverview" element={<InternshipOverview />} />
            </Route>
            <Route path="reports">
              <Route path="stakeholder" element={<StakeholderReport />} />
              <Route path="BackgroundCheckReport" element={<BackgroundCheckReport />} />
            </Route>
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
