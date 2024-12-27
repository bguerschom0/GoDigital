import React, { useState, useEffect } from 'react'
import { supabase } from '@/config/supabase'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts'
import { Card } from '@/components/ui/card'
import { 
  FileText, 
  Download, 
  Filter 
} from 'lucide-react'

const ReportsPage = () => {
  const [reports, setReports] = useState([])
  const [serviceStats, setServiceStats] = useState([])
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    end: new Date()
  })

  useEffect(() => {
    fetchReports()
    fetchServiceStatistics()
  }, [dateRange])

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from('service_requests')
        .select('*')
        .gte('created_at', dateRange.start.toISOString())
        .lte('created_at', dateRange.end.toISOString())
        .order('created_at', { ascending: false })

      if (error) throw error
      setReports(data || [])
    } catch (error) {
      console.error('Error fetching reports:', error)
    }
  }

  const fetchServiceStatistics = async () => {
    try {
      const { data, error } = await supabase
        .from('service_requests')
        .select('service_type')
        .gte('created_at', dateRange.start.toISOString())
        .lte('created_at', dateRange.end.toISOString())

      if (error) throw error

      // Group and count service types
      const stats = Object.entries(
        data.reduce((acc, curr) => {
          acc[curr.service_type] = (acc[curr.service_type] || 0) + 1
          return acc
        }, {})
      ).map(([service_type, count]) => ({ service_type, count }))

      setServiceStats(stats)
    } catch (error) {
      console.error('Error fetching service statistics:', error)
    }
  }

  const handleDateRangeChange = (e) => {
    const { name, value } = e.target
    setDateRange(prev => ({
      ...prev,
      [name]: new Date(value)
    }))
  }

  const downloadReport = () => {
    // Implement CSV or PDF download
    const csvContent = [
      'Service Type,Status,Created At',
      ...reports.map(r => 
        `${r.service_type},${r.status},${new Date(r.created_at).toLocaleString()}`
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'service_requests_report.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Reports Dashboard</h1>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Date Range Filter */}
        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-4">Filter Date Range</h2>
          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">
                Start Date
              </label>
              <input
                type="date"
                name="start"
                value={dateRange.start.toISOString().split('T')[0]}
                onChange={handleDateRangeChange}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">
                End Date
              </label>
              <input
                type="date"
                name="end"
                value={dateRange.end.toISOString().split('T')[0]}
                onChange={handleDateRangeChange}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>
        </Card>

        {/* Download Report */}
        <Card className="p-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Service Requests Report</h2>
            <p className="text-gray-600">Generate and download full report</p>
          </div>
          <button 
            onClick={downloadReport}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-600"
          >
            <Download className="mr-2 h-5 w-5" /> Download
          </button>
        </Card>
      </div>

      {/* Service Statistics Chart */}
      <Card className="mt-6 p-4">
        <h2 className="text-lg font-semibold mb-4">Service Request Statistics</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={serviceStats}>
            <XAxis dataKey="service_type" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Detailed Reports Table */}
      <Card className="mt-6 p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Detailed Reports</h2>
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-gray-500" />
            <span>{reports.length} Total Requests</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3 text-left">Service Type</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Created At</th>
              </tr>
            </thead>
            <tbody>
              {reports.map(report => (
                <tr key={report.id} className="border-b">
                  <td className="p-3">{report.service_type}</td>
                  <td className="p-3">{report.status}</td>
                  <td className="p-3">
                    {new Date(report.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

export default ReportsPage
