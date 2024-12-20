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
  const [error, setError] = useState(null)

  useEffect(() => {
    const initializeDashboard = async () => {
      if (!user) {
        navigate('/login')
        return
      }

      try {
        console.log('Initializing dashboard for user:', user)
        
        const { data: stakeholderData } = await supabase
          .from('stakeholder_requests')
          .select('*')
          .eq('created_by', user.username)

        const { data: backgroundData } = await supabase
          .from('background_checks')
          .select('*')
          .eq('requested_by', user.username)

        const { data: activityData } = await supabase
          .from('activity_log')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5)

        setStats({
          pendingTasks: (stakeholderData?.filter(req => req.status === 'Pending')?.length || 0) +
                       (backgroundData?.filter(check => check.status === 'Pending')?.length || 0),
          activeRequests: (stakeholderData?.filter(req => req.status !== 'Closed')?.length || 0) +
                         (backgroundData?.filter(check => check.status !== 'Closed')?.length || 0),
          recentActivities: activityData?.length || 0
        })

        setActivities(activityData || [])
      } catch (err) {
        console.error('Dashboard initialization error:', err)
        setError(err.message)
      } finally {
        setPageLoading(false)
      }
    }

    initializeDashboard()
  }, [user, navigate])

if (pageLoading) {
    return (
      <div className="h-[calc(100vh-theme(spacing.16))] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <Card className="border-none shadow-sm">
        <CardContent className="pt-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Welcome back, {user?.fullname}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Here's what's happening with your account today
          </p>
          
          {error && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-200">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingTasks}</div>
            <p className="text-xs text-muted-foreground">Tasks awaiting your action</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Requests</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeRequests}</div>
            <p className="text-xs text-muted-foreground">Ongoing requests</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activities</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentActivities}</div>
            <p className="text-xs text-muted-foreground">Activities in the last 7 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
                <Calendar className="w-12 h-12 mb-4 opacity-50" />
                <p className="text-sm font-medium">No recent activities</p>
                <p className="text-xs text-center mt-1">
                  Your recent activities will appear here once you start using the system
                </p>
              </div>
            ) : (
              activities.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-4 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/50">
                    <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
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
  )
}

export default UserDashboard
