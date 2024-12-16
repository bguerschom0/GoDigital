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
  Line,
  Label
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
  const [statusDistribution, setStatusDistribution] = useState([])
  const [monthlyTrends, setMonthlyTrends] = useState([])
  const [senderOptions, setSenderOptions] = useState([])
  const [subjectOptions, setSubjectOptions] = useState([])
  const [rawData, setRawData] = useState([])

  useEffect(() => {
    fetchInitialData()
    fetchFilterOptions()
  }, [])

  useEffect(() => {
    if (dateRange.startDate && dateRange.endDate) {
      fetchData()
    }
  }, [dateRange.startDate, dateRange.endDate, selectedSender, selectedStatus, selectedSubject])

  const fetchInitialData = async () => {
    const startDate = new Date(new Date().setMonth(new Date().getMonth() - 1))
    const endDate = new Date()
    await fetchDataForRange(startDate, endDate)
  }

  const fetchFilterOptions = async () => {
    try {
      const { data: senders } = await supabase
        .from('stakeholder_requests')
        .select('DISTINCT sender')
        .not('sender', 'is', null)
        .order('sender')

      const { data: subjects } = await supabase
        .from('stakeholder_requests')
        .select('DISTINCT subject')
        .not('subject', 'is', null)
        .order('subject')

      setSenderOptions(['all', ...(senders?.map(s => s.sender) || [])])
      setSubjectOptions(['all', ...(subjects?.map(s => s.subject) || [])])
    } catch (error) {
      console.error('Error fetching filter options:', error)
    }
  }

  const handleStartDateChange = (date) => {
    setDateRange({
      startDate: date,
      endDate: null
    })
  }

  const handleEndDateChange = (date) => {
    setDateRange(prev => ({
      ...prev,
      endDate: date
    }))
  }

  const fetchDataForRange = async (startDate, endDate) => {
    setIsLoading(true)
    try {
      let query = supabase
        .from('stakeholder_requests')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())

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

      setRawData(data)
      processData(data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchData = () => {
    if (dateRange.startDate && dateRange.endDate) {
      fetchDataForRange(dateRange.startDate, dateRange.endDate)
    }
  }

  const processData = (data) => {
    const total = data.length
    const pending = data.filter(r => r.status === 'Pending').length
    const answered = data.filter(r => r.status === 'Answered').length

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

    setSenderDistribution(processDistributionData(data, 'sender', total))
    
    const statusData = [
      { name: 'Pending', value: pending, percentage: ((pending/total) * 100).toFixed(1) },
      { name: 'Answered', value: answered, percentage: ((answered/total) * 100).toFixed(1) }
    ]
    setStatusDistribution(statusData)

    setMonthlyTrends(processMonthlyTrends(data))
    setTimelineData(processTimelineData(data))
  }

  const processTimelineData = (data) => {
    const grouped = data.reduce((acc, item) => {
      const date = new Date(item.date_received).toISOString().split('T')[0]
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {})

    return Object.entries(grouped)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
  }

  const processDistributionData = (data, key, total) => {
    const distribution = data.reduce((acc, item) => {
      const value = item[key]
      acc[value] = (acc[value] || 0) + 1
      return acc
    }, {})

    return Object.entries(distribution)
      .map(([name, value]) => ({
        name,
        value,
        percentage: ((value/total) * 100).toFixed(1)
      }))
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
      new Date(Date.parse(`1 ${a.month} 2024`)) - new Date(Date.parse(`1 ${b.month} 2024`))
    )
  }

  const exportToExcel = async () => {
    try {
      const { data, error } = await supabase
        .from('stakeholder_requests')
        .select('*')
        .gte('created_at', dateRange.startDate.toISOString())
        .lte('created_at', dateRange.endDate.toISOString())

      if (error) throw error

      const workbook = XLSX.utils.book_new()
      const worksheet = XLSX.utils.json_to_sheet(data)
      
      XLSX.utils.book_append_sheet(workbook, worksheet, "Raw Data")
      XLSX.writeFile(workbook, `stakeholder-data-${dateRange.startDate.toISOString().split('T')[0]}-to-${dateRange.endDate.toISOString().split('T')[0]}.xlsx`)
    } catch (error) {
      console.error('Error exporting to Excel:', error)
    }
  }

  const exportToPDF = async () => {
    if (!chartsRef.current) return

    const canvas = await html2canvas(chartsRef.current, {
      scale: 2,
      backgroundColor: '#ffffff'
    })
    
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const margin = 10
    
    pdf.setFontSize(16)
    pdf.text('Stakeholder Analysis Report', margin, margin + 5)
    
    pdf.setFontSize(10)
    pdf.text(
      `Date Range: ${dateRange.startDate.toLocaleDateString()} - ${dateRange.endDate.toLocaleDateString()}`,
      margin, margin + 15
    )
    
    const imgWidth = pageWidth - (margin * 2)
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    
    pdf.addImage(
      imgData,
      'PNG',
      margin,
      margin + 20,
      imgWidth,
      imgHeight
    )
    
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
                        onChange={handleStartDateChange}
                        selectsStart
                        startDate={dateRange.startDate}
                        endDate={dateRange.endDate}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                        placeholderText="Select start date"
                      />
                      <DatePicker
                        selected={dateRange.endDate}
                        onChange={handleEndDateChange}
                        selectsEnd
                        startDate={dateRange.startDate}
                        endDate={dateRange.endDate}
                        minDate={dateRange.startDate}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                        placeholderText="Select end date"
                        disabled={!dateRange.startDate}
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
                      {senderOptions.map((sender) => (
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
                      {subjectOptions.map((subject) => (
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
                    <p className="text-xs text-muted-foreground">All stakeholder requests</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
                    <RefreshCw className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.pendingRequests}</div>
                    <p className="text-xs text-muted-foreground">Awaiting response</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Answered Requests</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.answeredRequests}</div>
                    <p className="text-xs text-muted-foreground">Completed responses</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Average Response Time</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.averageResponseTime} days</div>
                    <p className="text-xs text-muted-foreground">Time to resolution</p>
                  </CardContent>
                </Card>
              </div>

              {/* Charts Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                          <Bar dataKey="total" fill="#0A2647" name="Total Requests">
                            <Label position="top" content={({ value }) => value} />
                          </Bar>
                          <Bar dataKey="pending" fill="#2C74B3" name="Pending">
                            <Label position="top" content={({ value }) => value} />
                          </Bar>
                          <Bar dataKey="answered" fill="#427D9D" name="Answered">
                            <Label position="top" content={({ value }) => value} />
                          </Bar>
                        </BarChart>
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
                            label={({ value, percentage }) => `${value} (${percentage}%)`}
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

                {/* Status Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>Status Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={statusDistribution}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            fill="#0A2647"
                            label={({ value, percentage }) => `${value} (${percentage}%)`}
                          >
                            {statusDistribution.map((entry, index) => (
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
                          >
                            <Label
                              content={({ value }) => value}
                              position="top"
                            />
                          </Area>
                        </AreaChart>
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
