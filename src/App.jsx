// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import AuthForm from './components/auth/AuthForm'
import { AdminLayout, UserLayout } from './components/layout'
import { useAuth } from './context/AuthContext'
import UserRoutes from './components/routes/UserRoutes'


// Admin Pages
import Dashboard from './pages/admin/Dashboard'
import Users from './pages/admin/Users'
import PagePermissions from './pages/admin/PagePermissions'

// Stakeholder Pages (Admin)
import NewRequest from './pages/stakeholder/NewRequest'
import PendingRequests from './pages/stakeholder/PendingRequests'
import UpdateRequest from './pages/stakeholder/UpdateRequest'
import DeleteRequest from './pages/stakeholder/DeleteRequest'
import AllRequests from './pages/stakeholder/AllRequests'

// Background Check Pages (Admin)
import NewBackgroundCheck from './pages/background/NewBackgroundCheck'
import PendingBackgroundChecks from './pages/background/PendingBackgroundChecks'
import UpdateBackgroundCheck from './pages/background/UpdateBackgroundCheck'
import ExpiredDocuments from './pages/background/ExpiredDocuments'
import AllBackgroundChecks from './pages/background/AllBackgroundChecks'
import InternshipOverview from './pages/background/InternshipOverview'

// Report Pages (Admin)
import StakeholderReport from './pages/reports/StakeholderReport'
import BackgroundCheckReport from './pages/reports/BackgroundCheckReport'

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
const AdminRoutes = () => (
  <Routes>
    <Route path="/" element={<AdminLayout />}>
      <Route index element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="users" element={<Users />} />
      <Route path="permissions" element={<PagePermissions />} />

      {/* Admin Stakeholder Routes */}
      <Route path="stakeholder">
        <Route path="new" element={<NewRequest />} />
        <Route path="pending" element={<PendingRequests />} />
        <Route path="update" element={<UpdateRequest />} />
        <Route path="delete" element={<DeleteRequest />} />
        <Route path="all" element={<AllRequests />} />
      </Route>

      {/* Admin Background Check Routes */}
      <Route path="background">
        <Route path="new" element={<NewBackgroundCheck />} />
        <Route path="pending" element={<PendingBackgroundChecks />} />
        <Route path="update" element={<UpdateBackgroundCheck />} />
        <Route path="expired" element={<ExpiredDocuments />} />
        <Route path="all" element={<AllBackgroundChecks />} />
        <Route path="internship" element={<InternshipOverview />} />
      </Route>

      {/* Admin Report Routes */}
      <Route path="reports">
        <Route path="stakeholder" element={<StakeholderReport />} />
        <Route path="background" element={<BackgroundCheckReport />} />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
    </Route>
  </Routes>
)

function App() {

  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<AuthForm />} />
          
          {/* Root Route */}
          <Route path="/" element={<Root />} />

          {/* Protected Admin Routes */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute requireAdmin>
                <AdminRoutes />
              </ProtectedRoute>
            }
          />

          {/* Protected User Routes */}
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
