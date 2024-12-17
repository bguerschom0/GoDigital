// src/pages/admin/Dashboard.jsx
import { AdminLayout } from '@/components/layout'
import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { 
  Users, 
  FileText, 
  Clock, 
  AlertCircle,
  CheckCircle,
  Calendar,
  UserCheck,
  FileWarning 
} from 'lucide-react'
import { supabase } from '@/config/supabase'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

const Dashboard = () => {
  const [stats, setStats] = useState({
    stakeholderRequests: {
      total: 0,
      pending: 0,
      answered: 0,
      todayNew: 0
    },
    backgroundChecks: {
      total: 0,
      pending: 0,
      closed: 0,
      expiringSoon: 0
    },
    users: {
      total: 0,
      active: 0
    }
  })
  
  const [loading, setLoading] = useState(true)
  const [timelineData, setTimelineData] = useState([])
  const [recentActivities, setRecentActivities] = useState([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch Stakeholder Requests Stats
      const { data: stakeholderData, error: stakeholderError } = await supabase
        .from('stakeholder_requests')
        .select('status')

      if (stakeholderError) throw stakeholderError

      // Fetch Background Checks Stats
      const { data: backgroundData, error: backgroundError } = await supabase
        .from('background_checks')
        .select('status')

      if (backgroundError) throw backgroundError

      // Update stats
      setStats({
        stakeholderRequests: {
          total: stakeholderData.length,
          pending: stakeholderData.filter(r => r.status === 'Pending').length,
          answered: stakeholderData.filter(r => r.status === 'Answered').length,
          todayNew: stakeholderData.filter(r => 
            new Date(r.created_at).toDateString() === new Date().toDateString()
          ).length
        },
        backgroundChecks: {
          total: backgroundData.length,
          pending: backgroundData.filter(b => b.status === 'Pending').length,
          closed: backgroundData.filter(b => b.status === 'Closed').length,
          expiringSoon: 0 // Will be implemented with passport expiry check
        },
        users: {
          total: 0,
          active: 0
        }
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout>
      <div className="flex justify-center -mt-6">
        <div className="w-full max-w-[90%] px-4">
          <div className="flex flex-col space-y-8">
            {/* Header */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white pt-2">
                Dashboard Overview
              </h1>
              <p className="text-gray-500 dark:text-gray-400">
                Monitor key metrics and recent activities
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Stakeholder Stats */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.stakeholderRequests.total}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.stakeholderRequests.todayNew} new today
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Background Checks</CardTitle>
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.backgroundChecks.total}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.backgroundChecks.pending} pending verification
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Pending Actions</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.stakeholderRequests.pending + stats.backgroundChecks.pending}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Total items needing attention
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
                  <FileWarning className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.backgroundChecks.expiringSoon}</div>
                  <p className="text-xs text-muted-foreground">
                    Documents needing renewal
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Activity Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle>Activity Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={timelineData}>
                        <defs>
                          <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0A2647" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#0A2647" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Area 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#0A2647" 
                          fillOpacity={1} 
                          fill="url(#colorActivity)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activities */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivities.map((activity, index) => (
                      <div key={index} className="flex items-start space-x-4">
                        {/* Add activity content here */}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default Dashboard
