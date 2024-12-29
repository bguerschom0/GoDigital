import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
import { 
  Search, 
  RefreshCcw,
  FileText,
  Save,
  Printer,
  Filter,
  Users,
  Clock,
  Building2,
  Loader2
} from 'lucide-react'
import { supabase } from '@/config/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useAuth } from '@/context/AuthContext'
import { usePageAccess } from '@/hooks/usePageAccess'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import * as XLSX from 'xlsx'

const COLORS = ['#0A2647', '#144272', '#205295', '#2C74B3', '#427D9D']

const BackgroundCheckReport = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { checkPermission } = usePageAccess()
  const [pageLoading, setPageLoading] = useState(true)
  const chartsRef = useRef(null)
  const printRef = useRef(null)

  const [filters, setFilters] = useState({
    dateRange: 'all',
    startDate: null,
    endDate: null,
    department: 'all',
    roleType: 'all',
    citizenship: 'all'
  })

  // States for data
  const [loading, setLoading] = useState(true)
  const [departments, setDepartments] = useState([])
  const [roles, setRoles] = useState([])
  const [citizenships, setCitizenships] = useState([])
  const [stats, setStats] = useState({
    totalChecks: 0,
    pendingChecks: 0,
    closedChecks: 0
  })
  const [statusDistribution, setStatusDistribution] = useState([])
  const [rawData, setRawData] = useState([])

  useEffect(() => {
    const checkAccess = async () => {
      const { canAccess } = checkPermission('/reports/background')
      if (!canAccess) {
        navigate(user?.role === 'admin' ? '/admin/dashboard' : '/dashboard')
        return
      }
      setPageLoading(false)
    }
    checkAccess()
  }, [])

  useEffect(() => {
    fetchData()
    fetchDepartmentsAndRoles()
    fetchCitizenships()
  }, [filters])

  const fetchCitizenships = async () => {
    try {
      const { data, error } = await supabase
        .from('background_checks')
        .select('citizenship')
        .not('citizenship', 'is', null)
      
      if (error) throw error
      const uniqueCitizenships = [...new Set(data.map(item => item.citizenship))]
      setCitizenships(uniqueCitizenships.sort())
    } catch (error) {
      console.error('Error fetching citizenships:', error)
    }
  }

  const fetchDepartmentsAndRoles = async () => {
    try {
      const { data: deptData, error: deptError } = await supabase
        .from('departments')
        .select('id, name')
        .eq('status', 'active')

      if (deptError) throw deptError
      setDepartments(deptData || [])

      const { data: roleData, error: roleError } = await supabase
        .from('roles')
        .select('id, name, type')
        .eq('status', 'active')

      if (roleError) throw roleError
      setRoles(roleData || [])
    } catch (error) {
      console.error('Error fetching departments and roles:', error)
    }
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('background_checks')
        .select(`
          *,
          departments(name),
          roles(name, type)
        `)

      // Apply date range filter
      if (filters.startDate) {
        query = query.gte('submitted_date', filters.startDate.toISOString())
      }
      if (filters.endDate) {
        query = query.lte('submitted_date', filters.endDate.toISOString())
      }

      // Apply other filters
      if (filters.department !== 'all') {
        query = query.eq('department_id', filters.department)
      }
      if (filters.roleType !== 'all') {
        query = query.eq('roles.type', filters.roleType)
      }
      if (filters.citizenship !== 'all') {
        query = query.eq('citizenship', filters.citizenship)
      }

      const { data, error } = await query
      if (error) throw error
      
      setRawData(data)
      processData(data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const processData = (data) => {
    // Update stats based on filtered data
    const totalChecks = data.length
    const pendingChecks = data.filter(check => check.status === 'Pending').length
    const closedChecks = data.filter(check => check.status === 'Closed').length

    setStats({ 
      totalChecks, 
      pendingChecks, 
      closedChecks
    })

    // Update status distribution
    const statusData = [
      { name: 'Pending', value: pendingChecks, percentage: totalChecks ? ((pendingChecks/totalChecks) * 100).toFixed(1) : 0 },
      { name: 'Closed', value: closedChecks, percentage: totalChecks ? ((closedChecks/totalChecks) * 100).toFixed(1) : 0 }
    ]
    setStatusDistribution(statusData)
  }

  const exportToExcel = async () => {
    try {
      // Fetch all data for export
      const { data, error } = await supabase
        .from('background_checks')
        .select(`
          *,
          departments(name),
          roles(name, type)
        `)

      if (error) throw error

      // Prepare data for export
      const exportData = data.map(record => ({
        'Department': record.departments?.name,
        'Role': record.roles?.name,
        'Role Type': record.roles?.type,
        'Full Name': record.full_names,
        'Status': record.status,
        'Citizenship': record.citizenship,
        'Date Submitted': new Date(record.submitted_date).toLocaleDateString(),
        'Company': record.from_company,
        'Working With': record.work_with
      }))

      const workbook = XLSX.utils.book_new()
      const worksheet = XLSX.utils.json_to_sheet(exportData)
      XLSX.utils.book_append_sheet(workbook, worksheet, "Background Checks")
      XLSX.writeFile(workbook, `background-checks-${new Date().toISOString().split('T')[0]}.xlsx`)
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
    const margin = 10
    
    pdf.setFontSize(16)
    pdf.text('Background Check Report', margin, margin + 5)
    
    pdf.setFontSize(10)
    pdf.text(
      `Date: ${new Date().toLocaleDateString()}`,
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
    
    pdf.save('background-check-report.pdf')
  }

  const handlePrint = async () => {
    if (!printRef.current) return
    const content = printRef.current
    const printWindow = window.open('', '', 'width=800,height=600')
    printWindow.document.write('<html><head><title>Print</title>')
    printWindow.document.write('</head><body>')
    printWindow.document.write(content.innerHTML)
    printWindow.document.write('</body></html>')
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
    printWindow.close()
  }

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#0A2647]" />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-theme(spacing.16))]">
      <div className="flex-1 flex justify-center">
        <div className="w-full max-w-[90%] px-4 pb-8">
          <div className="flex justify-between items-center pt-2 mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Background Check Report
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
                onClick={handlePrint}
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
                {/* Date Range Pickers */}
                <div className="md:col-span-2 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Start Date
                    </label>
                    <DatePicker
                      selected={filters.startDate}
                      onChange={(date) => setFilters(prev => ({ ...prev, startDate: date }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647]"
                      placeholderText="Select start date"
                      maxDate={filters.endDate || new Date()}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      End Date
                    </label>
                    <DatePicker
                      selected={filters.endDate}
                      onChange={(date) => setFilters(prev => ({ ...prev, endDate: date }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647]"
                      placeholderText="Select end date"
                      minDate={filters.startDate}
                      maxDate={new Date()}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Department
                  </label>
                  <select
                    value={filters.department}
                    onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647]"
                  >
                    <option value="all">All Departments</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Role Type
                  </label>
                  <select
                    value={filters.roleType}
                    onChange={(e) => setFilters(prev => ({ ...prev, roleType: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647]"
                  >
                    <option value="all">All Roles</option>
                    {[...new Set(roles.map(role => role.type))].map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Citizenship
                  </label>
                  <select
                    value={filters.citizenship}
                    onChange={(e) => setFilters(prev => ({ ...prev, citizenship: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647]"
                  >
                    <option value="all">All Countries</option>
                    {citizenships.map(country => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end">
                  <Button 
                    onClick={() => setFilters({
                      dateRange: 'all',
                      startDate: null,
                      endDate: null,
                      department: 'all',
                      roleType: 'all',
                      citizenship: 'all'
                    })}
                    variant="outline"
                    className="w-full"
                  >
                    Reset Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Charts container for PDF export */}
          <div id="charts-container" ref={chartsRef}>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Checks</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalChecks}</div>
                  <p className="text-xs text-muted-foreground">
                    Total background checks
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Checks</CardTitle>
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
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed Checks</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.closedChecks}</div>
                  <p className="text-xs text-muted-foreground">
                    Finished background checks
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Status Distribution Chart */}
            <Card className="mb-6">
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
                        outerRadius={100}
                        fill="#0A2647"
                        label={({ name, value, percentage }) => `${name}: ${value} (${percentage}%)`}
                      >
                        {statusDistribution.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={COLORS[index % COLORS.length]} 
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Print content container - hidden by default */}
          <div className="hidden">
            <div ref={printRef}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* Stats Cards for printing */}
                <div className="border p-4 rounded-lg">
                  <div className="font-medium">Total Checks</div>
                  <div className="text-2xl font-bold">{stats.totalChecks}</div>
                </div>

                <div className="border p-4 rounded-lg">
                  <div className="font-medium">Pending Checks</div>
                  <div className="text-2xl font-bold">{stats.pendingChecks}</div>
                </div>

                <div className="border p-4 rounded-lg">
                  <div className="font-medium">Completed Checks</div>
                  <div className="text-2xl font-bold">{stats.closedChecks}</div>
                </div>
              </div>

              {/* Status Distribution for printing */}
              <div className="border p-4 rounded-lg mt-6">
                <div className="font-medium mb-4">Status Distribution</div>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusDistribution}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#0A2647"
                        label={({ name, value, percentage }) => `${name}: ${value} (${percentage}%)`}
                      >
                        {statusDistribution.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={COLORS[index % COLORS.length]} 
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BackgroundCheckReport
