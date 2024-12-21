// src/pages/access-control/attendance/DailyAttendance.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Calendar,
  Clock,
  Download,
  Search,
  Filter,
  Loader2,
  UserCheck,
  UserX
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import DatePicker from 'react-datepicker'
import { format } from 'date-fns'
import { hikvisionService } from '@/services/hikvision'
import { useAuth } from '@/context/AuthContext'
import { usePageAccess } from '@/hooks/usePageAccess'
import * as XLSX from 'xlsx'

const DailyAttendance = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { checkPermission } = usePageAccess()
  const [pageLoading, setPageLoading] = useState(true)
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [attendanceData, setAttendanceData] = useState([])
  const [stats, setStats] = useState({
    totalPresent: 0,
    totalAbsent: 0,
    lateArrivals: 0,
    earlyDepartures: 0
  })
  const [filters, setFilters] = useState({
    department: 'all',
    status: 'all',
    searchTerm: ''
  })

  useEffect(() => {
    const checkAccess = async () => {
      const { canAccess } = checkPermission('/access-control/attendance/daily')
      if (!canAccess) {
        navigate(user?.role === 'admin' ? '/admin/dashboard' : '/dashboard')
        return
      }
      setPageLoading(false)
    }
    checkAccess()
  }, [])

  useEffect(() => {
    if (!pageLoading) {
      fetchAttendanceData()
    }
  }, [selectedDate, filters, pageLoading])

  const fetchAttendanceData = async () => {
    try {
      setLoading(true)
      const startTime = new Date(selectedDate)
      startTime.setHours(0, 0, 0, 0)
      
      const endTime = new Date(selectedDate)
      endTime.setHours(23, 59, 59, 999)

      const data = await hikvisionService.fetchAttendanceRecords(
        startTime.toISOString(),
        endTime.toISOString()
      )

      // Process attendance data
      const processed = data.map(record => ({
        ...record,
        status: determineStatus(record),
        department: record.department || 'Unassigned'
      }))

      // Apply filters
      let filtered = processed
      if (filters.department !== 'all') {
        filtered = filtered.filter(record => record.department === filters.department)
      }
      if (filters.status !== 'all') {
        filtered = filtered.filter(record => record.status === filters.status)
      }
      if (filters.searchTerm) {
        filtered = filtered.filter(record => 
          record.employeeName.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
          record.employeeId.includes(filters.searchTerm)
        )
      }

      setAttendanceData(filtered)
      calculateStats(filtered)
    } catch (error) {
      console.error('Error fetching attendance data:', error)
    } finally {
      setLoading(false)
    }
  }

  const determineStatus = (record) => {
    // Implement your attendance status logic here
    // This is just an example
    const checkInTime = new Date(record.checkInTime)
    const startTime = new Date(record.checkInTime)
    startTime.setHours(9, 0, 0, 0) // Example: 9 AM start time

    return checkInTime > startTime ? 'Late' : 'On Time'
  }

  const calculateStats = (data) => {
    const stats = {
      totalPresent: data.filter(r => r.checkInTime).length,
      totalAbsent: data.filter(r => !r.checkInTime).length,
      lateArrivals: data.filter(r => r.status === 'Late').length,
      earlyDepartures: data.filter(r => r.earlyDeparture).length
    }
    setStats(stats)
  }

  const exportToExcel = () => {
    const exportData = attendanceData.map(record => ({
      'Employee ID': record.employeeId,
      'Name': record.employeeName,
      'Department': record.department,
      'Check In': record.checkInTime ? format(new Date(record.checkInTime), 'HH:mm:ss') : 'N/A',
      'Check Out': record.checkOutTime ? format(new Date(record.checkOutTime), 'HH:mm:ss') : 'N/A',
      'Status': record.status
    }))

    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Attendance')
    XLSX.writeFile(wb, `attendance_${format(selectedDate, 'yyyy-MM-dd')}.xlsx`)
  }

  if (pageLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Daily Attendance</h1>
            <p className="text-gray-500">Manage and monitor daily attendance records</p>
          </div>
          <Button onClick={exportToExcel}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Present</CardTitle>
              <UserCheck className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPresent}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Absent</CardTitle>
              <UserX className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAbsent}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Late Arrivals</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.lateArrivals}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Early Departures</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.earlyDepartures}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Date Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <DatePicker
                selected={selectedDate}
                onChange={setSelectedDate}
                maxDate={new Date()}
                className="w-full px-3 py-2 border rounded-md"
                dateFormat="yyyy-MM-dd"
              />
              
              {/* Add your filter inputs here */}
            </div>
          </CardContent>
        </Card>

        {/* Attendance Table */}
        <Card>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left p-4">Employee ID</th>
                    <th className="text-left p-4">Name</th>
                    <th className="text-left p-4">Department</th>
                    <th className="text-left p-4">Check In</th>
                    <th className="text-left p-4">Check Out</th>
                    <th className="text-left p-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceData.map((record, index) => (
                    <tr key={index} className="border-t">
                      <td className="p-4">{record.employeeId}</td>
                      <td className="p-4">{record.employeeName}</td>
                      <td className="p-4">{record.department}</td>
                      <td className="p-4">
                        {record.checkInTime ? format(new Date(record.checkInTime), 'HH:mm:ss') : 'N/A'}
                      </td>
                      <td className="p-4">
                        {record.checkOutTime ? format(new Date(record.checkOutTime), 'HH:mm:ss') : 'N/A'}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          record.status === 'On Time' ? 'bg-green-100 text-green-800' :
                          record.status === 'Late' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default DailyAttendance
