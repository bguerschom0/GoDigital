// src/components/routes/UserRoutes.jsx
import { Routes, Route, Navigate } from 'react-router-dom'
import { UserLayout } from '@/components/layout'
import { useAuth } from '@/context/AuthContext'
import { usePageAccess } from '@/hooks/usePageAccess'
import { Suspense, lazy } from 'react'
import { Loader2 } from 'lucide-react'

// Lazy load all components
const UserDashboard = lazy(() => import('@/pages/user/Dashboard'))

// Stakeholder Pages
const NewRequest = lazy(() => import('@/pages/stakeholder/NewRequest'))
const PendingRequests = lazy(() => import('@/pages/stakeholder/PendingRequests'))
const UpdateRequest = lazy(() => import('@/pages/stakeholder/UpdateRequest'))
const DeleteRequest = lazy(() => import('@/pages/stakeholder/DeleteRequest'))
const AllRequests = lazy(() => import('@/pages/stakeholder/AllRequests'))

// Background Check Pages
const NewBackgroundCheck = lazy(() => import('@/pages/background/NewBackgroundCheck'))
const PendingBackgroundChecks = lazy(() => import('@/pages/background/PendingBackgroundChecks'))
const UpdateBackgroundCheck = lazy(() => import('@/pages/background/UpdateBackgroundCheck'))
const ExpiredDocuments = lazy(() => import('@/pages/background/ExpiredDocuments'))
const AllBackgroundChecks = lazy(() => import('@/pages/background/AllBackgroundChecks'))
const InternshipOverview = lazy(() => import('@/pages/background/InternshipOverview'))

// Report Pages
const StakeholderReport = lazy(() => import('@/pages/reports/StakeholderReport'))
const BackgroundCheckReport = lazy(() => import('@/pages/reports/BackgroundCheckReport'))

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
  </div>
)

// Protected Route with Permission Check
const PermissionRoute = ({ element: Component, path }) => {
  const { checkPermission } = usePageAccess()
  const { canAccess } = checkPermission(path)
  
  console.log(`Checking permission for path: ${path}, access:`, canAccess)

  if (!canAccess) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-xl mb-2">Access Denied</div>
          <p className="text-gray-600">You don't have permission to access this page.</p>
          <button 
            onClick={() => window.history.back()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return <Component />
}

const UserRoutes = () => {
  console.log('UserRoutes rendered, current path:', window.location.pathname)

  return (
    <Routes>
      <Route path="/" element={<UserLayout />}>
        {/* Dashboard */}
        <Route index element={<Navigate to="/user/dashboard" replace />} />
        <Route 
          path="user/dashboard" 
          element={
            <Suspense fallback={<PageLoader />}>
              <UserDashboard />
            </Suspense>
          } 
        />
        
        {/* Stakeholder Routes */}
        <Route path="stakeholder">
          <Route 
            path="new" 
            element={
              <Suspense fallback={<PageLoader />}>
                <PermissionRoute path="/stakeholder/new" element={NewRequest} />
              </Suspense>
            } 
          />
          <Route 
            path="pending" 
            element={
              <Suspense fallback={<PageLoader />}>
                <PermissionRoute path="/stakeholder/pending" element={PendingRequests} />
              </Suspense>
            } 
          />
          <Route 
            path="update" 
            element={
              <Suspense fallback={<PageLoader />}>
                <PermissionRoute path="/stakeholder/update" element={UpdateRequest} />
              </Suspense>
            } 
          />
          <Route 
            path="delete" 
            element={
              <Suspense fallback={<PageLoader />}>
                <PermissionRoute path="/stakeholder/delete" element={DeleteRequest} />
              </Suspense>
            } 
          />
          <Route 
            path="all" 
            element={
              <Suspense fallback={<PageLoader />}>
                <PermissionRoute path="/stakeholder/all" element={AllRequests} />
              </Suspense>
            } 
          />
        </Route>

        {/* Background Check Routes */}
        <Route path="background">
          <Route 
            path="new" 
            element={
              <Suspense fallback={<PageLoader />}>
                <PermissionRoute path="/background/new" element={NewBackgroundCheck} />
              </Suspense>
            } 
          />
          <Route 
            path="pending" 
            element={
              <Suspense fallback={<PageLoader />}>
                <PermissionRoute path="/background/pending" element={PendingBackgroundChecks} />
              </Suspense>
            } 
          />
          <Route 
            path="update" 
            element={
              <Suspense fallback={<PageLoader />}>
                <PermissionRoute path="/background/update" element={UpdateBackgroundCheck} />
              </Suspense>
            } 
          />
          <Route 
            path="expired" 
            element={
              <Suspense fallback={<PageLoader />}>
                <PermissionRoute path="/background/expired" element={ExpiredDocuments} />
              </Suspense>
            } 
          />
          <Route 
            path="all" 
            element={
              <Suspense fallback={<PageLoader />}>
                <PermissionRoute path="/background/all" element={AllBackgroundChecks} />
              </Suspense>
            } 
          />
          <Route 
            path="internship" 
            element={
              <Suspense fallback={<PageLoader />}>
                <PermissionRoute path="/background/internship" element={InternshipOverview} />
              </Suspense>
            } 
          />
        </Route>

        {/* Report Routes */}
        <Route path="reports">
          <Route 
            path="stakeholder" 
            element={
              <Suspense fallback={<PageLoader />}>
                <PermissionRoute path="/reports/stakeholder" element={StakeholderReport} />
              </Suspense>
            } 
          />
          <Route 
            path="background" 
            element={
              <Suspense fallback={<PageLoader />}>
                <PermissionRoute path="/reports/background" element={BackgroundCheckReport} />
              </Suspense>
            } 
          />
        </Route>

        {/* Catch all undefined routes */}
        <Route path="*" element={<Navigate to="/user/dashboard" replace />} />
      </Route>
    </Routes>
  )
}

export default UserRoutes
