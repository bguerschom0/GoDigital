// src/pages/reports/StakeholderReport.jsx
import { AdminLayout } from '@/components/layout'
import { useState, useEffect } from 'react'
import { supabase } from '@/config/supabase'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Loader } from 'lucide-react'
import {
  LineChart,
  Line,
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

const StakeholderReport = () => {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    answeredRequests: 0
  })
  const [timelineData, setTimelineData] = useState([])
  const [senderDistribution, setSenderDistribution] = useState([])
  const [subjectDistribution, setSubjectDistribution] = useState([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch total counts
      const { data: total } = await supabase
        .from('stakeholder_requests')
        .select('status', { count: 'exact' })

      const { data: pending } = await supabase
        .from('stakeholder_requests')
        .select('status', { count: 'exact' })
        .eq('status', 'Pending')

      const { data: answered } = await supabase
        .from('stakeholder_requests')
        .select('status', { count: 'exact' })
        .eq('status', 'Answered')

      // Set basic stats
      setStats({
        totalRequests: total?.length || 0,
        pendingRequests: pending?.length || 0,
        answeredRequests: answered?.length || 0
      })

      // Fetch timeline data (last 6 months)
      const { data: timeline } = await supabase
        .from('stakeholder_requests')
        .select('date_received, status')
        .order('date_received', { ascending: true })

      // Process timeline data
      // ... process data for timeline chart

      // Fetch sender distribution
      const { data: senders } = await supabase
        .from('stakeholder_requests')
        .select('sender')

      // Process sender data
      // ... process data for sender chart

      // Fetch subject distribution
      const { data: subjects } = await supabase
        .from('stakeholder_requests')
        .select('subject')

      // Process subject data
      // ... process data for subject chart

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
          <Loader className="w-8 h-8 animate-spin text-[#0A2647]" />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="flex justify-center -mt-6">
        <div className="w-full max-w-[90%] px-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white pt-2 mb-6">
            Stakeholder Analysis Report
          </h1>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalRequests}</div>
              </CardContent>
            </Card>
            {/* Add similar cards for pending and answered requests */}
          </div>

          {/* Timeline Chart */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Request Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="requests" stroke="#0A2647" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Distribution Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sender Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Requests by Sender</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={senderDistribution}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        fill="#0A2647"
                      />
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Subject Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Requests by Subject</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={subjectDistribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#0A2647" />
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

export default StakeholderReport
