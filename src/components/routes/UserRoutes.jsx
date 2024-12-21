// src/components/routes/UserRoutes.jsx
import { Routes, Route, Navigate } from 'react-router-dom'
import { UserLayout } from '@/components/layout'
import { Suspense, lazy } from 'react'
import { Loader2 } from 'lucide-react'

// Lazy load all components for better performance
// Dashboard
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

// Loading component for Suspense fallback
const PageLoader = () => (
  <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
  </div>
)

const UserRoutes = () => {
  return (
    <Routes>
      <Route element={<UserLayout />}>
        {/* Dashboard - Always accessible */}
        <Route index element={<Navigate to="/user/dashboard" replace />} />
        <Route
          path="/user/dashboard"
          element={
            <Suspense fallback={<PageLoader />}>
              <UserDashboard />
            </Suspense>
          }
        />
        
        {/* Stakeholder Routes */}
        <Route path="/stakeholder">
          <Route
            path="new"
            element={
              <Suspense fallback={<PageLoader />}>
                <NewRequest />
              </Suspense>
            }
          />
          <Route
            path="pending"
            element={
              <Suspense fallback={<PageLoader />}>
                <PendingRequests />
              </Suspense>
            }
          />
          <Route
            path="update"
            element={
              <Suspense fallback={<PageLoader />}>
                <UpdateRequest />
              </Suspense>
            }
          />
          <Route
            path="delete"
            element={
              <Suspense fallback={<PageLoader />}>
                <DeleteRequest />
              </Suspense>
            }
          />
          <Route
            path="all"
            element={
              <Suspense fallback={<PageLoader />}>
                <AllRequests />
              </Suspense>
            }
          />
        </Route>

        {/* Background Check Routes */}
        <Route path="/background">
          <Route
            path="new"
            element={
              <Suspense fallback={<PageLoader />}>
                <NewBackgroundCheck />
              </Suspense>
            }
          />
          <Route
            path="pending"
            element={
              <Suspense fallback={<PageLoader />}>
                <PendingBackgroundChecks />
              </Suspense>
            }
          />
          <Route
            path="update"
            element={
              <Suspense fallback={<PageLoader />}>
                <UpdateBackgroundCheck />
              </Suspense>
            }
          />
          <Route
            path="expired"
            element={
              <Suspense fallback={<PageLoader />}>
                <ExpiredDocuments />
              </Suspense>
            }
          />
          <Route
            path="all"
            element={
              <Suspense fallback={<PageLoader />}>
                <AllBackgroundChecks />
              </Suspense>
            }
          />
          <Route
            path="internship"
            element={
              <Suspense fallback={<PageLoader />}>
                <InternshipOverview />
              </Suspense>
            }
          />
        </Route>

        {/* Report Routes */}
        <Route path="/reports">
          <Route
            path="stakeholder"
            element={
              <Suspense fallback={<PageLoader />}>
                <StakeholderReport />
              </Suspense>
            }
          />
          <Route
            path="background"
            element={
              <Suspense fallback={<PageLoader />}>
                <BackgroundCheckReport />
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
