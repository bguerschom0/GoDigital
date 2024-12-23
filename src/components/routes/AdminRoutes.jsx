// src/components/routes/AdminRoutes.jsx
import { Routes, Route, Navigate } from 'react-router-dom'
import { AdminLayout } from '@/components/layout'
import Dashboard from '@/pages/admin/Dashboard'
import Users from '@/pages/admin/Users'
import PagePermissions from '@/pages/admin/PagePermissions'

const AdminRoutes = () => (
  <Routes>
    <Route path="/" element={<AdminLayout />}>
      <Route index element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="users" element={<Users />} />
      <Route path="permissions" element={<PagePermissions />} />
      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
    </Route>
  </Routes>
)

export default AdminRoutes
