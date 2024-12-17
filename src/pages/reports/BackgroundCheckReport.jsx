
// src/pages/reports/BackgroundCheckReport.jsx
import { AdminLayout } from '@/components/layout'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  FileText, 
  Clock, 
  Calendar,
  Flag,
  Building,
  Briefcase,
  BarChart2
} from 'lucide-react'
import { supabase } from '@/config/supabase'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

const COLORS = ['#0A2647', '#144272', '#205295', '#2C74B3', '#427D9D']

const BackgroundCheckReport = () => {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalChecks: 0,
    pendingChecks: 0,
    completedChecks: 0,
    expiringPassports: 0
  })
  const [timelineData, setTimelineData] = useState([])
  const [roleDistribution, setRoleDistribution] = useState([])
  const [citizenshipDistribution, setCitizenshipDistribution] = useState([])
  const [departmentDistribution, setDepartmentDistribution] = useState([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch total counts
      const { data: allChecks, error: checksError } = await supabase
        .from('background_checks')
        .select('*')

      if (checksError) throw checksError

      // Calculate stats
      const pending = allChecks.filter(check => check.status === 'Pending').length
      const completed = allChecks.filter(check => check.status === 'Closed').length
      const expiring = allChecks.filter(check => {
        if (!check.passport_expiry_date) return false
        const expiryDate = new Date(check.passport_expiry_date)
        const threeMonthsFromNow = new Date()
        threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3)
        return expiryDate <= threeMonthsFromNow && expiryDate > new Date()
      }).length

      setStats({
        totalChecks: allChecks.length,
        pendingChecks: pending,
        completedChecks: completed,
        expiringPassports: expiring
      })

      // Process role distribution
      const roleCounts = allChecks.reduce((acc, check) => {
        acc[check.role_id] = (acc[check.role_id] || 0) + 1
        return acc
      }, {})

      // Fetch role names
      const { data: roles } = await supabase
        .from('roles')
        .select('id, name')

      const roleData = Object.entries(roleCounts).map(([roleId, count]) => ({
        name: roles.find(r => r.id === roleId)?.name || 'Unknown',
        value: count
      }))

      setRoleDistribution(roleData)

      // Process citizenship distribution
      const citizenshipCounts = allChecks.reduce((acc, check) => {
        acc[check.citizenship] = (acc[check.citizenship] || 0) + 1
        return acc
      }, {})

      const citizenshipData = Object.entries(citizenshipCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)

      setCitizenshipDistribution(citizenshipData)

      // Process department distribution
      const { data: departments } = await supabase
        .from('departments')
        .select('id, name')

      const deptCounts = allChecks.reduce((acc, check) => {
        acc[check.department_id] = (acc[check.department_id] || 0) + 1
        return acc
      }, {})

      const departmentData = Object.entries(deptCounts)
        .map(([deptId, count]) => ({
          name: departments.find(d => d.id === deptId)?.name || 'Unknown',
          value: count
        }))
        .sort((a, b) => b.value - a.value)

      setDepartmentDistribution(departmentData)

      // Process timeline data
      const timelineStats = allChecks.reduce((acc, check) => {
        const month = new Date(check.created_at).toLocaleString('default', { month: 'short', year: 'numeric' })
        acc[month] = (acc[month] || 0) + 1
        return acc
      }, {})

      const timelineArray = Object.entries(timelineStats)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => new Date(a.date) - new Date(b.date))

      setTimelineData(timelineArray)

    } catch (error) {
      console.error('Error fetching report data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0A2647]" />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="flex justify-center -mt-6">
        <div className="w-full max-w-[90%] px-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white pt-2 mb-6">
            Background Check Analytics
          </h1>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Checks</CardTitle>
                <BarChart2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalChecks}</div>
                <p className="text-xs text-muted-foreground">
                  All background checks
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingChecks}</div>
                <p className="text-xs text-muted-foreground">
                  Awaiting completion
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.completedChecks}</div>
                <p className="text-xs text-muted-foreground">
                  Closed checks
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.expiringPassports}</div>
                <p className="text-xs text-muted-foreground">
                  Passports expiring in 3 months
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Timeline Chart - Full width */}
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Background Checks Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={timelineData}>
                      <defs>
                        <linearGradient id="colorChecks" x1="0" y1="0" x2="0" y2="1">
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
                        dataKey="count" 
                        stroke="#0A2647" 
                        fillOpacity={1} 
                        fill="url(#colorChecks)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Role Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Distribution by Role</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={roleDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {roleDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Department Distribution */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Distribution by Department</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={departmentDistribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 12 }}
                        interval={0}
                        angle={-45}
                        textAnchor="end"
                      />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value">
                        {departmentDistribution.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default BackgroundCheckReport
