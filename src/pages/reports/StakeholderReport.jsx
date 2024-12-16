```jsx
// src/pages/reports/StakeholderReport.jsx
import { AdminLayout } from '@/components/layout'
import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart2, 
  Download, 
  Printer, 
  Calendar,
  Filter,
  RefreshCw,
  PieChartIcon,
  TrendingUp,
  FileText,
  Save
} from 'lucide-react'
import { supabase } from '@/config/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
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
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import * as XLSX from 'xlsx'

const COLORS = ['#0A2647', '#144272', '#205295', '#2C74B3', '#427D9D', '#6096B4']

const StakeholderReport = () => {
  const chartsRef = useRef(null)
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    endDate: new Date()
  })
  const [selectedSender, setSelectedSender] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedSubject, setSelectedSubject] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    answeredRequests: 0,
    averageResponseTime: 0
  })
  const [timelineData, setTimelineData] = useState([])
  const [senderDistribution, setSenderDistribution] = useState([])
  const [subjectDistribution, setSubjectDistribution] = useState([])
  const [monthlyTrends, setMonthlyTrends] = useState([])
  const [availableSenders, setAvailableSenders] = useState(['all'])
  const [availableSubjects, setAvailableSubjects] = useState(['all'])

  useEffect(() => {
    fetchData()
  }, [dateRange, selectedSender, selectedStatus, selectedSubject])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      let query = supabase
        .from('stakeholder_requests')
        .select('*')
        .gte('created_at', dateRange.startDate.toISOString())
        .lte('created_at', dateRange.endDate.toISOString())

      if (selectedSender !== 'all') {
        query = query.eq('sender', selectedSender)
      }
      if (selectedStatus !== 'all') {
        query = query.eq('status', selectedStatus)
      }
      if (selectedSubject !== 'all') {
        query = query.eq('subject', selectedSubject)
      }

      const { data, error } = await query

      if (error) throw error

      processData(data)
      await fetchOptions()
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchOptions = async () => {
    try {
      const { data: senders } = await supabase
        .from('stakeholder_requests')
        .select('sender')
        .not('sender', 'is', null)

      const { data: subjects } = await supabase
        .from('stakeholder_requests')
        .select('subject')
        .not('subject', 'is', null)

      const uniqueSenders = ['all', ...new Set(senders.map(s => s.sender))]
      const uniqueSubjects = ['all', ...new Set(subjects.map(s => s.subject))]

      setAvailableSenders(uniqueSenders)
      setAvailableSubjects(uniqueSubjects)
    } catch (error) {
      console.error('Error fetching options:', error)
    }
  }

  const processData = (data) => {
    // Basic stats
    const total = data.length
    const pending = data.filter(r => r.status === 'Pending').length
    const answered = data.filter(r => r.status === 'Answered').length

    // Calculate average response time
    const responseTimesInDays = data
      .filter(r => r.status === 'Answered' && r.response_date)
      .map(r => {
        const start = new Date(r.date_received)
        const end = new Date(r.response_date)
        return Math.ceil((end - start) / (1000 * 60 * 60 * 24))
      })

    const avgResponseTime = responseTimesInDays.length > 0
      ? Math.round(responseTimesInDays.reduce((a, b) => a + b, 0) / responseTimesInDays.length)
      : 0

    setStats({
      totalRequests: total,
      pendingRequests: pending,
      answeredRequests: answered,
      averageResponseTime: avgResponseTime
    })

    // Process timeline data
    const timeline = processTimelineData(data)
    setTimelineData(timeline)

    // Process distributions
    setSenderDistribution(processDistributionData(data, 'sender'))
    setSubjectDistribution(processDistributionData(data, 'subject'))

    // Process monthly trends
    setMonthlyTrends(processMonthlyTrends(data))
  }

  const processTimelineData = (data) => {
    const grouped = data.reduce((acc, item) => {
      const date = item.date_received.split('T')[0]
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {})

    return Object.entries(grouped)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
  }

  const processDistributionData = (data, key) => {
    const distribution = data.reduce((acc, item) => {
      const value = item[key]
      acc[value] = (acc[value] || 0) + 1
      return acc
    }, {})

    return Object.entries(distribution)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }

  const processMonthlyTrends = (data) => {
    const monthly = data.reduce((acc, item) => {
      const month = new Date(item.date_received).toLocaleString('default', { month: 'short' })
      acc[month] = acc[month] || { month, total: 0, pending: 0, answered: 0 }
      acc[month].total += 1
      acc[month][item.status.toLowerCase()] += 1
      return acc
    }, {})

    return Object.values(monthly).sort((a, b) => 
      new Date(a.month) - new Date(b.month)
    )
  }

  const exportToExcel = () => {
    const workbook = XLSX.utils.book_new()
    
    // Create sheets for different data
    const statsSheet = XLSX.utils.json_to_sheet([stats])
    const timelineSheet = XLSX.utils.json_to_sheet(timelineData)
    const senderSheet = XLSX.utils.json_to_sheet(senderDistribution)
    const subjectSheet = XLSX.utils.json_to_sheet(subjectDistribution)
    
    XLSX.utils.book_append_sheet(workbook, statsSheet, "Stats")
    XLSX.utils.book_append_sheet(workbook, timelineSheet, "Timeline")
    XLSX.utils.book_append_sheet(workbook, senderSheet, "Sender Distribution")
    XLSX.utils.book_append_sheet(workbook, subjectSheet, "Subject Distribution")
    
    XLSX.writeFile(workbook, "stakeholder-report.xlsx")
  }

  const exportToPDF = async () => {
    if (!chartsRef.current) return

    const canvas = await html2canvas(chartsRef.current)
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('l', 'mm', 'a4')
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
    pdf.save('stakeholder-report.pdf')
  }

  const printCharts = () => {
    const printContent = document.getElementById('charts-container')
    const originalContents = document.body.innerHTML
    document.body.innerHTML = printContent.innerHTML
    window.print()
    document.body.innerHTML = originalContents
    window.location.reload()
  }

  return (
    <AdminLayout>
      <div className="flex flex-col min-h-[calc(100vh-theme(spacing.16))] -mt-6">
        <div className="flex-1 flex justify-center">
          <div className="w-full max-w-[90%] px-4 pb-8">
            {/* Header with Title and Actions */}
            <div className="flex justify-between items-center pt-2 mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Stakeholder Analysis Report
              </h1>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportToExcel}
                  className="text-[#0A2647] border-[#0A2647]"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Export Excel
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportToPDF}
                  className="text-[#0A2647] border-[#0A2647]"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save PDF
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={printCharts}
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
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Date Range
                    </label>
                    <div className="flex space-x-2">
                      <DatePicker
                        selected={dateRange.startDate}
                        onChange={date => setDateRange(prev => ({ ...prev, startDate: date }))}
                        selectsStart
                        startDate={dateRange.startDate}
                        endDate={dateRange.endDate}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                      />
                      <DatePicker
                        selected={dateRange.endDate}
                        onChange={date => setDateRange(prev => ({ ...prev, endDate: date }))}
                        selectsEnd
                        startDate={dateRange.startDate}
                        endDate={dateRange.endDate}
                        minDate={dateRange.startDate}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Sender
                    </label>
                    <select
                      value={selectedSender}
                      onChange={(e) => setSelectedSender(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                    >
                      {availableSenders.map((sender) => (
                        <option key={sender} value={sender}>
                          {sender === 'all' ? 'All Senders' : sender}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Status
                    </label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                    >
                      <option value="all">All Status</option>
                      <option value="Pending">Pending</option>
                      <option value="Answered">Answered</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Subject
                    </label>
                    <select
                      value={selectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                    >
                      {availableSubjects.map((subject) => (
                        <option key={subject} value={subject}>
                          {subject === 'all' ? 'All Subjects' : subject}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div id="charts-container" ref={chartsRef}>
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
                      All stakeholder requests
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
                    <RefreshCw className="h-4 w-4 text-muted-foreground" />
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
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.answeredRequests}</div>
                    <p className="text-xs text-muted-foreground">
                      Completed responses
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Average Response Time</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.averageResponseTime} days</div>
                    <p className="text-xs text-muted-foreground">
                      Time to resolution
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Charts Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Timeline Chart */}
                <Card className="col-span-2">
                  <CardHeader>
                    <CardTitle>Request Timeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={timelineData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Area
                            type="monotone"
                            dataKey="count"
                            stroke="#0A2647"
                            fill="#0A2647"
                            fillOpacity={0.2}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Sender Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>Sender Distribution</CardTitle>
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
                            outerRadius={80}
                            fill="#0A2647"
                          >
                            {senderDistribution.map((entry, index) => (
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

                {/* Subject Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>Subject Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={subjectDistribution}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            fill="#0A2647"
                          >
                            {subjectDistribution.map((entry, index) => (
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

                {/* Monthly Trends */}
                <Card className="col-span-2">
                  <CardHeader>
                    <CardTitle>Monthly Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={monthlyTrends}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="total" fill="#0A2647" name="Total Requests" />
                          <Bar dataKey="pending" fill="#2C74B3" name="Pending" />
                          <Bar dataKey="answered" fill="#427D9D" name="Answered" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default StakeholderReport
