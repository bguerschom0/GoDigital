// src/pages/admin/Dashboard.jsx
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/config/supabase'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { 
  Users,
  FileText,
  AlertCircle,
  Clock,
  Activity,
  BarChart2
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeRequests: 0,
    pendingApprovals: 0,
    expiringDocuments: 0
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [
        usersCount,
        requestsCount,
        approvalsCount,
        expiringCount,
        activity,
        monthlyStats
      ] = await Promise.all([
        // Get total users
        supabase
          .from('users')
          .select('id', { count: 'exact' }),

        // Get active requests
        supabase
          .from('stakeholder_requests')
          .select('id', { count: 'exact' })
          .eq('status', 'active'),

        // Get pending approvals
        supabase
          .from('background_checks')
          .select('id', { count: 'exact' })
          .eq('status', 'pending'),

        // Get expiring documents
        supabase
          .from('documents')
          .select('id', { count: 'exact' })
          .lt('expiry_date', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()),

        // Get recent activity
        supabase
          .from('activity_log')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5),

        // Get monthly stats
        supabase
          .from('monthly_stats')
          .select('*')
          .order('month', { ascending: true })
          .limit(6)
      ])

      setStats({
        totalUsers: usersCount.count || 0,
        activeRequests: requestsCount.count || 0,
        pendingApprovals: approvalsCount.count || 0,
        expiringDocuments: expiringCount.count || 0
      })

      setRecentActivity(activity.data || [])
      setChartData(monthlyStats.data || [])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Registered users in the system
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Requests</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeRequests}</div>
            <p className="text-xs text-muted-foreground">
              Currently active requests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingApprovals}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Expiring Documents</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.expiringDocuments}</div>
            <p className="text-xs text-muted-foreground">
              Expiring in 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Activity and Chart Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <div key={activity.id} className="flex items-center">
                    <Activity className="h-4 w-4 text-muted-foreground mr-2" />
                    <div>
                      <p className="text-sm font-medium">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No recent activity</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Monthly Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="requests" fill="#0A2647" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard
