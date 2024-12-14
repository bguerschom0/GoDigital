// src/pages/reports/StakeholderReport.jsx
import { AdminLayout } from '@/components/layout'
import { useState, useEffect } from 'react'
import { supabase } from '@/config/supabase'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Loader, 
  Download, 
  Filter,
  Calendar,
  RefreshCcw,
  FileDown,
  Printer,
  Mail,
  BarChart2,
  PieChart as PieChartIcon,
  TrendingUp
} from 'lucide-react'
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
import * as XLSX from 'xlsx'

const COLORS = ['#0A2647', '#144272', '#205295', '#2C74B3', '#427D9D']

const StakeholderReport = () => {
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    dateRange: 'all', // all, last7days, last30days, last3months, custom
    startDate: '',
    endDate: '',
    sender: 'all',
    status: 'all',
    subject: 'all'
  })
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    answeredRequests: 0,
    averageResponseTime: 0
  })
  const [timelineData, setTimelineData] = useState([])
  const [senderDistribution, setSenderDistribution] = useState([])
  const [subjectDistribution, setSubjectDistribution] = useState([])
  const [exportLoading, setExportLoading] = useState(false)

  useEffect(() => {
    fetchData()
  }, [filters])

  const fetchData = async () => {
    setLoading(true)
    try {
      let query = supabase.from('stakeholder_requests').select('*')

      // Apply filters
      if (filters.dateRange !== 'all') {
        const startDate = getDateRangeStart(filters.dateRange)
        query = query.gte('date_received', startDate.toISOString())
      }
      if (filters.sender !== 'all') {
        query = query.eq('sender', filters.sender)
      }
      if (filters.status !== 'all') {
        query = query.eq('status', filters.status)
      }
      if (filters.subject !== 'all') {
        query = query.eq('subject', filters.subject)
      }

      const { data, error } = await query

      if (error) throw error

      processData(data)
    } catch (error) {
      console.error('Error fetching report data:', error)
    } finally {
      setLoading(false)
    }
  }

  const processData = (data) => {
    // Process statistics
    const totalRequests = data.length
    const pendingRequests = data.filter(r => r.status === 'Pending').length
    const answeredRequests = data.filter(r => r.status === 'Answered').length

    // Calculate average response time for answered requests
    const responseTimes = data
      .filter(r => r.status === 'Answered' && r.response_date)
      .map(r => {
        const received = new Date(r.date_received)
        const responded = new Date(r.response_date)
        return (responded - received) / (1000 * 60 * 60 * 24) // Days
      })
    const averageResponseTime = responseTimes.length 
      ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
      : 0

    setStats({ totalRequests, pendingRequests, answeredRequests, averageResponseTime })

    // Process timeline data
    const timeline = processTimelineData(data)
    setTimelineData(timeline)

    // Process distributions
    const senders = processDistributionData(data, 'sender')
    setSenderDistribution(senders)

    const subjects = processDistributionData(data, 'subject')
    setSubjectDistribution(subjects)
  }

  const processTimelineData = (data) => {
    // Group by date and count
    const grouped = data.reduce((acc, item) => {
      const date = item.date_received.split('T')[0]
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {})

    // Convert to array and sort
    return Object.entries(grouped)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
  }

  const processDistributionData = (data, field) => {
    const distribution = data.reduce((acc, item) => {
      const value = item[field]
      acc[value] = (acc[value] || 0) + 1
      return acc
    }, {})

    return Object.entries(distribution)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }

  const exportToExcel = async () => {
    setExportLoading(true)
    try {
      const { data, error } = await supabase
        .from('stakeholder_requests')
        .select('*')
        // Apply current filters...

      if (error) throw error

      const ws = XLSX.utils.json_to_sheet(data)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Stakeholder Requests')
      XLSX.writeFile(wb, 'stakeholder_report.xlsx')
    } catch (error) {
      console.error('Error exporting data:', error)
    } finally {
      setExportLoading(false)
    }
  }

  return (
    <AdminLayout>
      <div className="flex justify-center -mt-6">
        <div className="w-full max-w-[90%] px-4">
          {/* Header with Title and Actions */}
          <div className="flex justify-between items-center pt-2 mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Stakeholder Analysis Report
            </h1>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchData()}
                className="text-[#0A2647] border-[#0A2647]"
              >
                <RefreshCcw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportToExcel}
                disabled={exportLoading}
                className="text-[#0A2647] border-[#0A2647]"
              >
                {exportLoading ? (
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <FileDown className="w-4 h-4 mr-2" />
                )}
                Export Excel
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                className="text-[#0A2647] border-[#0A2647]"
              >
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
            </div>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date Range
                  </label>
                  <select
                    value={filters.dateRange}
                    onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] dark:bg-gray-800 dark:border-gray-700"
                  >
                    <option value="all">All Time</option>
                    <option value="last7days">Last 7 Days</option>
                    <option value="last30days">Last 30 Days</option>
                    <option value="last3months">Last 3 Months</option>
                    <option value="custom">Custom Range</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Sender
                  </label>
                  <select
                    value={filters.sender}
                    onChange={(e) => setFilters(prev => ({ ...prev, sender: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] dark:bg-gray-800 dark:border-gray-700"
                  >
                    <option value="all">All Senders</option>
                    <option value="NPPA">NPPA</option>
                    <option value="RIB">RIB</option>
                    <option value="MPG">MPG</option>
                    <option value="Private Advocate">Private Advocate</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] dark:bg-gray-800 dark:border-gray-700"
                  >
                    <option value="all">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Answered">Answered</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Subject
                  </label>
                  <select
                    value={filters.subject}
                    onChange={(e) => setFilters(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] dark:bg-gray-800 dark:border-gray-700"
                  >
                    <option value="all">All Subjects</option>
                    <option value="Account Unblock">Account Unblock</option>
                    <option value="MoMo Transaction">MoMo Transaction</option>
                    <option value="Call History">Call History</option>
                    {/* Add other subject options */}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                <BarChart2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalRequests}</div>
                <p className="text-xs text-muted-foreground">
                  All time requests
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingRequests}</div>
                <p className="text-xs text-muted-foreground">
                  Awaiting response
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Answered Requests</CardTitle>
                <PieChartIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.answeredRequests}</div>
                <p className="text-xs text-muted-foreground">
                  Completed requests
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Response Time</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.averageResponseTime} days</div>
                <p className="text-xs text-muted-foreground">
                  Average completion time
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          {/* ... Your existing charts code ... */}
        </div>
      </div>
    </AdminLayout>
  )
}

export default StakeholderReport
