// src/pages/admin/Dashboard.jsx
import { AdminLayout } from '@/components/layout'
import { useState, useEffect } from 'react'
import { 
  Users, 
  FileText, 
  Clock,
  Bell,
  Calendar,
  CheckCircle,
  AlertCircle,
  BarChart
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { supabase } from '@/config/supabase'
import { useAuth } from '@/context/AuthContext'
import { format } from 'date-fns'

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    completedRequests: 0,
    totalBackgroundChecks: 0
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch stakeholder requests stats
      const { data: stakeholderData, error: stakeholderError } = await supabase
        .from('stakeholder_requests')
        .select('status')

      if (stakeholderError) throw stakeholderError

      // Fetch background checks stats
      const { data: backgroundData, error: backgroundError } = await supabase
        .from('background_checks')
        .select('status')

      if (backgroundError) throw backgroundError

      // Calculate stats
      setStats({
        totalRequests: stakeholderData.length,
        pendingRequests: stakeholderData.filter(r => r.status === 'Pending').length,
        completedRequests: stakeholderData.filter(r => r.status === 'Answered').length,
        totalBackgroundChecks: backgroundData?.length || 0
      })

      // Fetch recent activity
      const { data: recentData, error: recentError } = await supabase
        .from('stakeholder_requests')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)

      if (recentError) throw recentError
      setRecentActivity(recentData)

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <AdminLayout>
      <div className="flex justify-center -mt-6">
        <div className="w-full max-w-[90%] px-4">
          {/* Welcome Section */}
          <div className="bg-[#0A2647] text-white rounded-lg p-6 mb-6">
            <h1 className="text-3xl font-bold mb-2">
              {getGreeting()}, {user?.fullname}
            </h1>
            <p className="text-blue-100">
              Welcome to your dashboard. Here's what's happening today.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalRequests}</div>
                <p className="text-xs text-muted-foreground">
                  All stakeholder requests
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
                  Awaiting response
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Completed Requests</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.completedRequests}</div>
                <p className="text-xs text-muted-foreground">
                  Successfully processed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Background Checks</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalBackgroundChecks}</div>
                <p className="text-xs text-muted-foreground">
                  Total background checks
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & Recent Activity */}
          <div className="grid gap-6 md:grid-cols-2 mb-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button 
                    className="w-full bg-[#0A2647] hover:bg-[#0A2647]/90"
                    onClick={() => window.location.href = '/admin/stakeholder/new'}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    New Stakeholder Request
                  </Button>
                  <Button 
                    className="w-full bg-[#0A2647] hover:bg-[#0A2647]/90"
                    onClick={() => window.location.href = '/admin/background/new'}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    New Background Check
                  </Button>
                  <Button 
                    className="w-full bg-[#0A2647] hover:bg-[#0A2647]/90"
                    onClick={() => window.location.href = '/admin/reports'}
                  >
                    <BarChart className="w-4 h-4 mr-2" />
                    View Reports
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div 
                      key={activity.id} 
                      className="flex items-center space-x-4 border-b border-gray-100 pb-4 last:border-0 last:pb-0"
                    >
                      <div className={`p-2 rounded-full ${
                        activity.status === 'Pending' 
                          ? 'bg-yellow-100 text-yellow-600'
                          : 'bg-green-100 text-green-600'
                      }`}>
                        {activity.status === 'Pending' ? (
                          <Clock className="w-4 h-4" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {activity.reference_number}
                        </p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(activity.created_at), 'MMM d, yyyy h:mm a')}
                        </p>
                      </div>
                      <div className={`px-2 py-1 rounded text-xs ${
                        activity.status === 'Pending'
                          ? 'bg-yellow-100 text-yellow-600'
                          : 'bg-green-100 text-green-600'
                      }`}>
                        {activity.status}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Notifications */}
          <Card>
            <CardHeader>
              <CardTitle>System Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 text-amber-600 bg-amber-50 p-4 rounded-lg">
                  <Bell className="w-5 h-5" />
                  <p className="text-sm">You have {stats.pendingRequests} pending requests that need your attention.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}

export default Dashboard
