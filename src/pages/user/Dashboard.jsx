// src/pages/user/Dashboard.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { usePageAccess } from '@/hooks/usePageAccess'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { 
  Bell, 
  Calendar, 
  FileText, 
  Loader2,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import { supabase } from '@/config/supabase'
import { format } from 'date-fns'

const UserDashboard = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { checkPermission } = usePageAccess()
  const [pageLoading, setPageLoading] = useState(true)
  const [stats, setStats] = useState({
    pendingTasks: 0,
    activeRequests: 0,
    recentActivities: 0
  })
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)

  // Check basic dashboard access
  useEffect(() => {
    const checkAccess = async () => {
      const { canAccess } = checkPermission('/user/dashboard')
      if (!canAccess) {
        navigate('/login')
        return
      }
      setPageLoading(false)
    }
    checkAccess()
  }, [])

  // Fetch dashboard data
  useEffect(() => {
    if (!pageLoading) {
      fetchDashboardData()
    }
  }, [pageLoading])

  const fetchDashboardData = async () => {
    try {
      // Fetch stakeholder requests
      const { data: stakeholderData, error: stakeholderError } = await supabase
        .from('stakeholder_requests')
        .select('*')
        .eq('created_by', user.username)
        .order('created_at', { ascending: false })

      if (stakeholderError) throw stakeholderError

      // Fetch background checks
      const { data: backgroundData, error: backgroundError } = await supabase
        .from('background_checks')
        .select('*')
        .eq('requested_by', user.username)
        .order('created_at', { ascending: false })

      if (backgroundError) throw backgroundError

      // Fetch recent activities
      const { data: activityData, error: activityError } = await supabase
        .from('activity_log')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)

      if (activityError) throw activityError

      // Calculate stats
      setStats({
        pendingTasks: stakeholderData.filter(req => req.status === 'Pending').length +
                     backgroundData.filter(check => check.status === 'Pending').length,
        activeRequests: stakeholderData.filter(req => req.status !== 'Closed').length +
                       backgroundData.filter(check => check.status !== 'Closed').length,
        recentActivities: activityData.length
      })

      setActivities(activityData)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (pageLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.fullname}
          </h1>
          <p className="text-gray-600 mt-1">
            Here's what's happening with your account
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Tasks
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingTasks}</div>
              <p className="text-xs text-muted-foreground">
                Tasks awaiting your action
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Requests
              </CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeRequests}</div>
              <p className="text-xs text-muted-foreground">
                Ongoing requests
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Recent Activities
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.recentActivities}</div>
              <p className="text-xs text-muted-foreground">
                Activities in the last 7 days
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities.length === 0 ? (
                <div className="flex items-center">
                  <div className="ml-4">
                    <p className="text-sm font-medium">No recent activity</p>
                    <p className="text-sm text-muted-foreground">
                      Your activities will appear here
                    </p>
                  </div>
                </div>
              ) : (
                activities.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-4">
                    <div className={`p-2 rounded-full ${
                      activity.type === 'success' ? 'bg-green-100' : 'bg-blue-100'
                    }`}>
                      {activity.type === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : (
                        <FileText className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{activity.description}</p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(activity.created_at), 'MMM d, yyyy - h:mm a')}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default UserDashboard
