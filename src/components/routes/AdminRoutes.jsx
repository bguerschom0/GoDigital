// src/components/routes/AdminRoutes.jsx
import { Routes, Route, Navigate } from 'react-router-dom'
import { AdminLayout } from '@/components/layout'

// Admin Pages
import Dashboard from '@/pages/admin/Dashboard'
import Users from '@/pages/admin/Users'
import PagePermissions from '@/pages/admin/PagePermissions'

// Stakeholder Pages
import NewRequest from '@/pages/stakeholder/NewRequest'
import PendingRequests from '@/pages/stakeholder/PendingRequests'
import UpdateRequest from '@/pages/stakeholder/UpdateRequest'
import DeleteRequest from '@/pages/stakeholder/DeleteRequest'
import AllRequests from '@/pages/stakeholder/AllRequests'

// Background Check Pages
import NewBackgroundCheck from '@/pages/background/NewBackgroundCheck'
import PendingBackgroundChecks from '@/pages/background/PendingBackgroundChecks'
import UpdateBackgroundCheck from '@/pages/background/UpdateBackgroundCheck'
import ExpiredDocuments from '@/pages/background/ExpiredDocuments'
import AllBackgroundChecks from '@/pages/background/AllBackgroundChecks'
import InternshipOverview from '@/pages/background/InternshipOverview'

// Report Pages
import StakeholderReport from '@/pages/reports/StakeholderReport'
import BackgroundCheckReport from '@/pages/reports/BackgroundCheckReport'


// Access control
import ControllersManagement from '@/pages/access-control/controllers/ControllersManagement'
import Attendance from '@/pages/access-control/attendance/DailyAttendance'
import DeviceList from '@/pages/access-control/devices/DeviceList'
import AccessControlDashboard from '@/pages/access-control/index'

// Security Services
import SecurityServiceRequest from '@/pages/security-services/SecurityServiceRequest'
import TasksPage from '@/pages/security-services/TasksPage'

const AdminRoutes = () => (
  <Routes>
    <Route path="/" element={<AdminLayout />}>
      {/* Dashboard */}
      <Route index element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="dashboard" element={<Dashboard />} />

      {/* Admin-only Pages */}
      <Route path="users" element={<Users />} />
      <Route path="permissions" element={<PagePermissions />} />

      {/* Stakeholder Routes */}
      <Route path="stakeholder">
        <Route path="new" element={<NewRequest />} />
        <Route path="pending" element={<PendingRequests />} />
        <Route path="update" element={<UpdateRequest />} />
        <Route path="delete" element={<DeleteRequest />} />
        <Route path="all" element={<AllRequests />} />
      </Route>

      {/* Background Check Routes */}
      <Route path="background">
        <Route path="new" element={<NewBackgroundCheck />} />
        <Route path="pending" element={<PendingBackgroundChecks />} />
        <Route path="update" element={<UpdateBackgroundCheck />} />
        <Route path="expired" element={<ExpiredDocuments />} />
        <Route path="all" element={<AllBackgroundChecks />} />
        <Route path="internship" element={<InternshipOverview />} />
      </Route>

      {/* Report Routes */}
      <Route path="reports">
        <Route path="stakeholder" element={<StakeholderReport />} />
        <Route path="background" element={<BackgroundCheckReport />} />
      </Route>

      {/* Access Control */}
      <Route path="access_control">
        <Route path="access_control_dashboard" element={<AccessControlDashboard />} />
        <Route path="controllers" element={<ControllersManagement />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="device_list" element={<DeviceList />} />
      </Route>

            {/* Security Services */}
<Route path="security_services">
  <Route path="security_service_request" element={<SecurityServiceRequest />} />
  <Route path="task_page" element={<TasksPage />} />
</Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
    </Route>
  </Routes>
)

export default AdminRoutes
