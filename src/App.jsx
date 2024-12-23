// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import AuthForm from './components/auth/AuthForm'
import { AdminLayout, UserLayout } from './components/layout'
import { useAuth } from './context/AuthContext'
import UserRoutes from './components/routes/UserRoutes'
import AdminErrorBoundary from '@/components/admin/AdminErrorBoundary'


// Admin-only Pages
import Users from './pages/admin/Users'
import PagePermissions from './pages/admin/PagePermissions'
import AdminDashboard from './pages/admin/Dashboard'

// Regular Pages
import UserDashboard from './pages/user/Dashboard'
import NewRequest from './pages/stakeholder/NewRequest'
import PendingRequests from './pages/stakeholder/PendingRequests'
import UpdateRequest from './pages/stakeholder/UpdateRequest'
import DeleteRequest from './pages/stakeholder/DeleteRequest'
import AllRequests from './pages/stakeholder/AllRequests'
import NewBackgroundCheck from './pages/background/NewBackgroundCheck'
import PendingBackgroundChecks from './pages/background/PendingBackgroundChecks'
import UpdateBackgroundCheck from './pages/background/UpdateBackgroundCheck'
import ExpiredDocuments from './pages/background/ExpiredDocuments'
import AllBackgroundChecks from './pages/background/AllBackgroundChecks'
import InternshipOverview from './pages/background/InternshipOverview'
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
const AdminRoutes = () => {
  const { user } = useAuth()

  if (user?.role !== 'admin') {
    return <Navigate to="/user/dashboard" replace />
  }

  return (
    <Routes>
      <Route path="/" element={<AdminLayout />}>
        {/* Admin Dashboard */}
        <Route index element={<AdminDashboard />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<Users />} />
       <Route path="permissions" element={<PagePermissions />} />

        {/* Shared Routes */}
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
      </Route>
    </Routes>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<AuthForm />} />
          
          {/* Root Route */}
          <Route path="/" element={<Root />} />

          {/* Admin-only Routes */}
<Route
  path="/admin/users"
  element={
    <ProtectedRoute requireAdmin>
      <AdminLayout>
        <AdminErrorBoundary>
          <Users />
        </AdminErrorBoundary>
      </AdminLayout>
    </ProtectedRoute>
  }
/>
<Route
  path="/admin/permissions"
  element={
    <ProtectedRoute requireAdmin>
      <AdminLayout>
        <AdminErrorBoundary>
          <PagePermissions />
        </AdminErrorBoundary>
      </AdminLayout>
    </ProtectedRoute>
  }
/>

          {/* Regular Admin Routes */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute>
                <AdminRoutes />
              </ProtectedRoute>
            }
          />

          {/* User Routes */}
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
