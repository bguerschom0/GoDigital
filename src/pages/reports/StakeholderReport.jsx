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
  // ... (previous state and ref declarations remain the same)

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

    // Process distributions with percentages
    setSenderDistribution(processDistributionData(data, 'sender', total))
    
    // Process status distribution instead of subject
    const statusData = [
      { name: 'Pending', value: pending, percentage: ((pending/total) * 100).toFixed(1) },
      { name: 'Answered', value: answered, percentage: ((answered/total) * 100).toFixed(1) }
    ]
    setStatusDistribution(statusData)

    // Process monthly trends with actual numbers
    const trends = processMonthlyTrends(data)
    setMonthlyTrends(trends)

    // Process timeline data last
    const timeline = processTimelineData(data)
    setTimelineData(timeline)
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

  const CustomLabel = ({ viewBox, value, percentage }) => {
    const { cx, cy } = viewBox;
    return (
      <text
        x={cx}
        y={cy}
        className="recharts-text"
        textAnchor="middle"
        dominantBaseline="central"
        fill="#fff"
        fontSize="14"
      >
        <tspan x={cx} dy="-0.5em">{value}</tspan>
        <tspan x={cx} dy="1.5em">{percentage}%</tspan>
      </text>
    );
  };

  const exportToPDF = async () => {
    if (!chartsRef.current) return

    const canvas = await html2canvas(chartsRef.current, {
      scale: 2, // Increase quality
      backgroundColor: '#ffffff'
    })
    
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    })

    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()
    
    // Add title
    pdf.setFontSize(16)
    pdf.text('Stakeholder Analysis Report', 14, 15)
    
    // Add date range
    pdf.setFontSize(10)
    pdf.text(
      `Date Range: ${dateRange.startDate.toLocaleDateString()} - ${dateRange.endDate.toLocaleDateString()}`,
      14, 25
    )
    
    // Add image with margins
    const margin = 10
    pdf.addImage(
      imgData,
      'PNG',
      margin,
      30, // Start after the title
      pdfWidth - (margin * 2),
      pdfHeight - 40 // Leave space for title and margins
    )
    
    pdf.save('stakeholder-report.pdf')
  }

  const printCharts = () => {
    const printWindow = window.open('', '_blank')
    const printContent = document.getElementById('charts-container')
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Stakeholder Analysis Report</title>
          <style>
            body { margin: 20px; }
            .page-break { page-break-before: always; }
            .chart-container { margin-bottom: 20px; }
            @media print {
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>Stakeholder Analysis Report</h1>
          <p>Date Range: ${dateRange.startDate.toLocaleDateString()} - ${dateRange.endDate.toLocaleDateString()}</p>
          ${printContent.innerHTML}
        </body>
      </html>
    `)
    
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 250)
  }

  return (
    <AdminLayout>
      <div className="flex flex-col min-h-[calc(100vh-theme(spacing.16))] -mt-6">
        <div className="flex-1 flex justify-center">
          <div className="w-full max-w-[90%] px-4 pb-8">
            {/* Header and Filters sections remain the same */}
            
            <div id="charts-container" ref={chartsRef}>
              {/* Stats Cards remain the same */}

              {/* Charts Grid - Reordered */}
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

                {/* Sender Distribution with numbers */}
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

                {/* Status Distribution (replacing Subject) */}
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

                {/* Timeline Chart - Moved to bottom */}
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
