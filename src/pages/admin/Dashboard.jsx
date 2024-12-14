// src/pages/admin/Dashboard.jsx
import { AdminLayout } from '@/components/layout'
import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { supabase } from '@/config/supabase'
import {
  Chart,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend)

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeRequests: 0,
    completedRequests: 0,
    responseRate: 0
  })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      // Fetch users count
      const { count: usersCount } = await supabase
        .from('users')
        .select('*', { count: 'exact' })

      // Fetch requests stats
      const { count: activeCount } = await supabase
        .from('stakeholder_requests')
        .select('*', { count: 'exact' })
        .eq('status', 'Pending')

      const { count: completedCount } = await supabase
        .from('stakeholder_requests')
        .select('*', { count: 'exact' })
        .eq('status', 'Answered')

      const responseRate = completedCount + activeCount > 0 
        ? (completedCount / (completedCount + activeCount)) * 100 
        : 0

      setStats({
        totalUsers: usersCount,
        activeRequests: activeCount,
        completedRequests: completedCount,
        responseRate: responseRate.toFixed(1)
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Requests',
        data: [65, 59, 80, 81, 56, 55],
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
  }

  return (
    <AdminLayout>
      <div className="space-y-6 p-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle>Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Active Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeRequests}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Completed Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedRequests}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Response Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.responseRate}%</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <Bar data={chartData} options={{ maintainAspectRatio: false }} />
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}

export default Dashboard
