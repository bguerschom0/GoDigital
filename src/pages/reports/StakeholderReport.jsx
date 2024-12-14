// src/pages/reports/StakeholderReport.jsx
import { AdminLayout } from '@/components/layout'
import { useState, useEffect } from 'react'
import { supabase } from '@/config/supabase'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
import { 
  Loader, 
  Download, 
  Filter,
  Calendar,
  RefreshCcw,
  FileDown,
  Printer,
  BarChart2,
  PieChart as PieChartIcon,
  TrendingUp
} from 'lucide-react'
import {
  AreaChart,
  Area,
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
    dateRange: 'all',
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

  const getDateRangeStart = (range) => {
    const today = new Date()
    switch (range) {
      case 'last7days':
        return new Date(today.setDate(today.getDate() - 7))
      case 'last30days':
        return new Date(today.setDate(today.getDate() - 30))
      case 'last3months':
        return new Date(today.setMonth(today.getMonth() - 3))
      case 'custom':
        return filters.startDate ? new Date(filters.startDate) : null
      default:
        return null
    }
  }

  const getDateRangeEnd = () => {
    return filters.dateRange === 'custom' && filters.endDate 
      ? new Date(filters.endDate) 
      : new Date()
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      let query = supabase.from('stakeholder_requests').select('*')

      // Apply date filters
      if (filters.dateRange !== 'all') {
        const startDate = getDateRangeStart(filters.dateRange)
        const endDate = getDateRangeEnd()
        if (startDate) {
          query = query.gte('date_received', startDate.toISOString())
        }
        if (endDate) {
          query = query.lte('date_received', endDate.toISOString())
        }
      }

      // Apply other filters
      if (filters.sender !== 'all') {
        query = query.eq('sender', filters.sender)
      }
      if (filters.status !== 'all') {
        query = query.eq('status', filters.status)
      }
      if (filters.subject !== 'all') {
        query = query.eq('subject', filters.subject)
      }

      const { data, error } = await query.order('date_received', { ascending: true })

      if (error) throw error

      processData(data)
    } catch (error) {
      console.error('Error fetching report data:', error)
    } finally {
      setLoading(false)
    }
  }

  const processData = (data) => {
    // Process basic stats
    const totalRequests = data.length
    const pendingRequests = data.filter(r => r.status === 'Pending').length
    const answeredRequests = data.filter(r => r.status === 'Answered').length

    // Calculate average response time
    const responseTimes = data
      .filter(r => r.status === 'Answered' && r.response_date)
      .map(r => {
        const received = new Date(r.date_received)
        const responded = new Date(r.response_date)
        return (responded - received) / (1000 * 60 * 60 * 24) // Convert to days
      })

    const averageResponseTime = responseTimes.length 
      ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
      : 0

    setStats({
      totalRequests,
      pendingRequests,
      answeredRequests,
      averageResponseTime
    })

    // Process timeline data
    const timeline = Object.entries(
      data.reduce((acc, item) => {
        const date = item.date_received.split('T')[0]
        acc[date] = (acc[date] || 0) + 1
        return acc
      }, {})
    ).map(([date, count]) => ({ date, count }))

    setTimelineData(timeline)

    // Process sender distribution
    const senders = Object.entries(
      data.reduce((acc, item) => {
        acc[item.sender] = (acc[item.sender] || 0) + 1
        return acc
      }, {})
    ).map(([name, value]) => ({ name, value }))

    setSenderDistribution(senders)

    // Process subject distribution
    const subjects = Object.entries(
      data.reduce((acc, item) => {
        acc[item.subject] = (acc[item.subject] || 0) + 1
        return acc
      }, {})
    ).map(([name, value]) => ({ name, value }))

    setSubjectDistribution(subjects)
  }

  const exportToExcel = async () => {
    setExportLoading(true)
    try {
      const { data, error } = await supabase
        .from('stakeholder_requests')
        .select('*')
        .order('date_received', { ascending: false })

      if (error) throw error

      const ws = XLSX.utils.json_to_sheet(data)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Stakeholder Requests')
      XLSX.writeFile(wb, `stakeholder_report_${new Date().toISOString().split('T')[0]}.xlsx`)
    } catch (error) {
      console.error('Error exporting data:', error)
    } finally {
      setExportLoading(false)
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
                    onChange={(e) => {
                      const newValue = e.target.value
                      setFilters(prev => ({
                        ...prev,
                        dateRange: newValue,
                        startDate: newValue === 'custom' ? prev.startDate : '',
                        endDate: newValue === 'custom' ? prev.endDate : ''
                      }))
                    }}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] dark:bg-gray-800 dark:border-gray-700"
                  >
                    <option value="all">All Time</option>
                    <option value="last7days">Last 7 Days</option>
                    <option value="last30days">Last 30 Days</option>
                    <option value="last3months">Last 3 Months</option>
                    <option value="custom">Custom Range</option>
                  </select>
                </div>

                {filters.dateRange === 'custom' && (
                  <div className="md:col-span-2 grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Start Date
                      </label>
                      <DatePicker
                        selected={filters.startDate ? new Date(filters.startDate) : null}
                        onChange={date => setFilters(prev => ({ ...prev, startDate: date }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] dark:bg-gray-800 dark:border-gray-700"
                        dateFormat="yyyy-MM-dd"
                        placeholderText="Select start date"
                        maxDate={new Date()}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        End Date
                      </label>
                      <DatePicker
                        selected={filters.endDate ? new Date(filters.endDate) : null}
                        onChange={date => setFilters(prev => ({ ...prev, endDate: date }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] dark:bg-gray-800 dark:border-gray-700"
                        dateFormat="yyyy-MM-dd"
                        placeholderText="Select end date"
                        maxDate={new Date()}
                        minDate={filters.startDate ? new Date(filters.startDate) : null}
                      />
                    </div>
                  </div>
                )}

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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Timeline Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Request Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={timelineData}>
                      <defs>
                        <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
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
                        fill="url(#colorRequests)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Request Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Pending', value: stats.pendingRequests },
                          { name: 'Answered', value: stats.answeredRequests }
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        <Cell fill="#0A2647" />
                        <Cell fill="#2C74B3" />
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Sender Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Requests by Sender</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={senderDistribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value">
                        {senderDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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

export default StakeholderReport
