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
  AlertCircle,
  AlertTriangle
} from 'lucide-react'
import { supabase } from '@/config/supabase'
import { format } from 'date-fns'

const DebugInfo = ({ data }) => {
  if (process.env.NODE_ENV === 'development') {
    return (
      <div className="mt-4 p-4 bg-gray-100 rounded-lg text-xs font-mono">
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </div>
    )
  }
  return null
}

const ErrorMessage = ({ error }) => (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
    <div className="flex items-center">
      <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
      <span className="text-red-700 font-medium">Error Loading Data</span>
    </div>
    <p className="mt-2 text-red-600 text-sm">{error}</p>
  </div>
)

const UserDashboard = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { checkPermission } = usePageAccess()
  const [pageLoading, setPageLoading] = useState(true)
  const [dataLoading, setDataLoading] = useState(true)
  const [error, setError] = useState(null)
  const [debugData, setDebugData] = useState({})
  const [stats, setStats] = useState({
    pendingTasks: 0,
    activeRequests: 0,
    recentActivities: 0
  })
  const [activities, setActivities] = useState([])

  // Debug logging
  useEffect(() => {
    console.log('Current Auth State:', { user, pageLoading, dataLoading })
  }, [user, pageLoading, dataLoading])

  // Check dashboard access
  useEffect(() => {
    const checkAccess = async () => {
      try {
        if (!user) {
          console.log('No user found, redirecting to login')
          navigate('/login')
          return
        }

        const { canAccess } = checkPermission('/user/dashboard')
        if (!canAccess) {
          console.log('Access denied to dashboard')
          navigate('/login')
          return
        }

        setPageLoading(false)
      } catch (err) {
        console.error('Access check error:', err)
        setError('Error checking page access')
        setPageLoading(false)
      }
    }
    checkAccess()
  }, [user, navigate, checkPermission])

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (pageLoading || !user) return

      try {
        setDataLoading(true)
        console.log('Fetching data for user:', user.username)

        // Fetch stakeholder requests
        const { data: stakeholderData, error: stakeholderError } = await supabase
          .from('stakeholder_requests')
          .select('*')
          .eq('created_by', user.username)

        if (stakeholderError) {
          console.error('Stakeholder fetch error:', stakeholderError)
          throw new Error('Failed to load stakeholder requests')
        }

        // Fetch background checks
        const { data: backgroundData, error: backgroundError } = await supabase
          .from('background_checks')
          .select('*')
          .eq('requested_by', user.username)

        if (backgroundError) {
          console.error('Background checks fetch error:', backgroundError)
          throw new Error('Failed to load background checks')
        }

        // Fetch activities
        const { data: activityData, error: activityError } = await supabase
          .from('activity_log')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5)

        if (activityError) {
          console.error('Activity log fetch error:', activityError)
          throw new Error('Failed to load activity log')
        }

        // Update debug data
        setDebugData({
          stakeholderData,
          backgroundData,
          activityData,
          user
        })

        // Calculate stats
        setStats({
          pendingTasks: (stakeholderData?.filter(req => req.status === 'Pending')?.length || 0) +
                       (backgroundData?.filter(check => check.status === 'Pending')?.length || 0),
          activeRequests: (stakeholderData?.filter(req => req.status !== 'Closed')?.length || 0) +
                         (backgroundData?.filter(check => check.status !== 'Closed')?.length || 0),
          recentActivities: activityData?.length || 0
        })

        setActivities(activityData || [])
        setError(null)
      } catch (err) {
        console.error('Dashboard data fetch error:', err)
        setError(err.message || 'Error loading dashboard data')
      } finally {
        setDataLoading(false)
      }
    }

    fetchDashboardData()
  }, [pageLoading, user])

  if (pageLoading || dataLoading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Loading dashboard...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.fullname || 'User'}
          </h1>
          <p className="text-gray-600 mt-1">
            Here's what's happening with your account
          </p>
          
          {error && <ErrorMessage error={error} />}
          
          {process.env.NODE_ENV === 'development' && (
            <DebugInfo data={debugData} />
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingTasks}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Requests</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeRequests}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Activities</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.recentActivities}</div>
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
                <div className="flex items-center justify-center p-6 text-gray-500">
                  <p>No recent activities to display</p>
                </div>
              ) : (
                activities.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-4">
                    <div className="p-2 rounded-full bg-blue-100">
                      <FileText className="w-4 h-4 text-blue-600" />
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
