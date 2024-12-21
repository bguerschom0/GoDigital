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

// Dashboard Pages
import AdminDashboard from './pages/admin/Dashboard'
import UserDashboard from './pages/user/Dashboard'

// Stakeholder Pages
import NewRequest from './pages/stakeholder/NewRequest'
import PendingRequests from './pages/stakeholder/PendingRequests'
import UpdateRequest from './pages/stakeholder/UpdateRequest'
import DeleteRequest from './pages/stakeholder/DeleteRequest'
import AllRequests from './pages/stakeholder/AllRequests'

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

  // Redirect based on role
  return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/user/dashboard'} replace />
}

// Admin routes configuration
const AdminRoutes = () => (
  <Routes>
    <Route path="/" element={<AdminLayout />}>
      {/* Admin Dashboard */}
      <Route index element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="dashboard" element={<AdminDashboard />} />

      {/* Admin-only routes */}
      <Route path="users" element={<Users />} />
      <Route path="permissions" element={<PagePermissions />} />

      {/* Shared routes - also accessible by admin */}
      <Route path="stakeholder">
        <Route path="new" element={<NewRequest />} />
        <Route path="pending" element={<PendingRequests />} />
        <Route path="update" element={<UpdateRequest />} />
        <Route path="delete" element={<DeleteRequest />} />
        <Route path="all" element={<AllRequests />} />
      </Route>

      <Route path="background">
        <Route path="new" element={<NewBackgroundCheck />} />
        <Route path="pending" element={<PendingBackgroundChecks />} />
        <Route path="update" element={<UpdateBackgroundCheck />} />
        <Route path="expired" element={<ExpiredDocuments />} />
        <Route path="all" element={<AllBackgroundChecks />} />
        <Route path="internship" element={<InternshipOverview />} />
      </Route>

      <Route path="reports">
        <Route path="stakeholder" element={<StakeholderReport />} />
        <Route path="background" element={<BackgroundCheckReport />} />
      </Route>

      {/* Catch-all route for admin section */}
      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
    </Route>
  </Routes>
)

// User routes configuration
const UserRoutes = () => (
  <Routes>
    <Route path="/" element={<UserLayout />}>
      {/* User Dashboard */}
      <Route index element={<Navigate to="/user/dashboard" replace />} />
      <Route path="user/dashboard" element={<UserDashboard />} />

      {/* Permission-based routes */}
      <Route path="stakeholder">
        <Route path="new" element={<NewRequest />} />
        <Route path="pending" element={<PendingRequests />} />
        <Route path="update" element={<UpdateRequest />} />
        <Route path="delete" element={<DeleteRequest />} />
        <Route path="all" element={<AllRequests />} />
      </Route>

      <Route path="background">
        <Route path="new" element={<NewBackgroundCheck />} />
        <Route path="pending" element={<PendingBackgroundChecks />} />
        <Route path="update" element={<UpdateBackgroundCheck />} />
        <Route path="expired" element={<ExpiredDocuments />} />
        <Route path="all" element={<AllBackgroundChecks />} />
        <Route path="internship" element={<InternshipOverview />} />
      </Route>

      <Route path="reports">
        <Route path="stakeholder" element={<StakeholderReport />} />
        <Route path="background" element={<BackgroundCheckReport />} />
      </Route>

      {/* Catch-all route for user section */}
      <Route path="*" element={<Navigate to="/user/dashboard" replace />} />
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

          {/* Admin Routes - Only Users and Permissions require admin */}
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

          {/* Other Admin Routes - No admin requirement */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute>
                <AdminRoutes />
              </ProtectedRoute>
            }
          />

          {/* User Routes - Permission based */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <UserRoutes />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
