// src/pages/access-control/index.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Users,
  Clock,
  Shield,
  AlertTriangle,
  Settings,
  DoorClosed,
  Activity,
  Loader2
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import { usePageAccess } from '@/hooks/usePageAccess'

const AccessControlDashboard = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { checkPermission } = usePageAccess()
  const [pageLoading, setPageLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeDevices: 0,
    pendingRequests: 0,
    alerts: 0
  })
  const [loading, setLoading] = useState(true)

useEffect(() => {
  setPageLoading(false);
  fetchControllers();
}, []);

  const quickLinks = [
    {
      title: 'Daily Attendance',
      description: 'View today\'s attendance records',
      icon: <Clock className="h-6 w-6" />,
      path: '/access-control/attendance/daily'
    },
    {
      title: 'Access Management',
      description: 'Manage user access rights',
      icon: <Shield className="h-6 w-6" />,
      path: '/access-control/access-management/users'
    },
    {
      title: 'Device Status',
      description: 'Monitor device health',
      icon: <Activity className="h-6 w-6" />,
      path: '/access-control/devices/status'
    },
  ]

  if (pageLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Access Control System
        </h1>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                Registered users with access
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Devices</CardTitle>
              <DoorClosed className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeDevices}</div>
              <p className="text-xs text-muted-foreground">
                Online access points
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingRequests}</div>
              <p className="text-xs text-muted-foreground">
                Access requests awaiting approval
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.alerts}</div>
              <p className="text-xs text-muted-foreground">
                Unresolved alerts
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickLinks.map((link) => (
            <Card 
              key={link.path}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate(link.path)}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium">{link.title}</CardTitle>
                {link.icon}
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {link.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Add your activity feed here */}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AccessControlDashboard
