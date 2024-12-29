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
  Loader2,
  BadgeCheck,
  AlertCircle
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

  const [filters, setFilters] = useState({
    dateRange: 'all',
    startDate: '',
    endDate: '',
    requested_by: '',
    citizenship: 'all',
    from_company: '',
    department: 'all',
    roleType: 'all'
  })

  // States for data
  const [loading, setLoading] = useState(true)
  const [departments, setDepartments] = useState([])
  const [roles, setRoles] = useState([])
  const [citizenships, setCitizenships] = useState([])

  const [stats, setStats] = useState({
    // Background check stats
    totalChecks: 0,
    pendingChecks: 0,
    closedChecks: 0,
    // Internship stats
    totalInternships: 0,
    activeInternships: 0,
    expiredInternships: 0
  })

  const [statusDistribution, setStatusDistribution] = useState([])
  const [internshipStatusDistribution, setInternshipStatusDistribution] = useState([])

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
      if (filters.citizenship !== 'all') {
        query = query.eq('citizenship', filters.citizenship)
      }

      const { data, error } = await query
      if (error) throw error

      // Separate internship and non-internship data
      const internshipData = data.filter(item => item.roles?.type === 'Internship')
      const nonInternshipData = data.filter(item => item.roles?.type !== 'Internship')

      if (filters.roleType === 'Internship') {
        processInternshipData(internshipData)
      } else {
        // If 'all' is selected, only show non-internship data
        // If specific role type is selected, filter accordingly
        const filteredData = filters.roleType === 'all' 
          ? nonInternshipData
          : nonInternshipData.filter(item => item.roles?.type === filters.roleType)
        processBackgroundCheckData(filteredData)
      }
      
      setRawData(data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const processBackgroundCheckData = (data) => {
    // Process non-internship background checks
    const totalChecks = data.length
    const pendingChecks = data.filter(check => check.status === 'Pending').length
    const closedChecks = data.filter(check => check.status === 'Closed').length

    setStats(prev => ({ 
      ...prev,
      totalChecks,
      pendingChecks,
      closedChecks
    }))

    const statusData = [
      { name: 'Pending', value: pendingChecks, percentage: totalChecks ? ((pendingChecks/totalChecks) * 100).toFixed(1) : 0 },
      { name: 'Closed', value: closedChecks, percentage: totalChecks ? ((closedChecks/totalChecks) * 100).toFixed(1) : 0 }
    ]
    setStatusDistribution(statusData)
  }

  const processInternshipData = (data) => {
    const currentDate = new Date()
    const totalInternships = data.length
    const activeInternships = data.filter(intern => new Date(intern.date_end) >= currentDate).length
    const expiredInternships = totalInternships - activeInternships

    setStats(prev => ({
      ...prev,
      totalInternships,
      activeInternships,
      expiredInternships
    }))

    const statusData = [
      { name: 'Active', value: activeInternships, percentage: totalInternships ? ((activeInternships/totalInternships) * 100).toFixed(1) : 0 },
      { name: 'Expired', value: expiredInternships, percentage: totalInternships ? ((expiredInternships/totalInternships) * 100).toFixed(1) : 0 }
    ]
    setInternshipStatusDistribution(statusData)
  }

  // Render functions for different stat cards
  const renderBackgroundCheckStats = () => (
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
  )

  const renderInternshipStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Internships</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalInternships}</div>
          <p className="text-xs text-muted-foreground">
            All time internships
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Internships</CardTitle>
          <BadgeCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeInternships}</div>
          <p className="text-xs text-muted-foreground">
            Currently active
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Expired Internships</CardTitle>
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.expiredInternships}</div>
          <p className="text-xs text-muted-foreground">
            Past internships
          </p>
        </CardContent>
      </Card>
    </div>
  )

  const renderStatusDistribution = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>
          {filters.roleType === 'Internship' ? 'Internship Status Distribution' : 'Status Distribution'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={filters.roleType === 'Internship' ? internshipStatusDistribution : statusDistribution}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#0A2647"
                label={({ name, value, percentage }) => `${name}: ${value} (${percentage}%)`}
              >
                {(filters.roleType === 'Internship' ? internshipStatusDistribution : statusDistribution)
                  .map((entry, index) => (
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
  )

  return (
    <div className="flex flex-col min-h-[calc(100vh-theme(spacing.16))]">
      <div className="flex-1 flex justify-center">
        <div className="w-full max-w-[90%] px-4 pb-8">
          {/* ... (keep existing header and export buttons) ... */}

          {/* Filters */}
          <Card className="mb-6">
            {/* ... (keep existing filter code but update role type filter) ... */}
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
          </Card>

          {/* Dynamic Stats and Charts */}
          <div id="charts-container" ref={chartsRef}>
            {filters.roleType === 'Internship' ? renderInternshipStats() : renderBackgroundCheckStats()}
            {renderStatusDistribution()}
          </div>

          {/* Print content container */}
          <div className="hidden">
            <div ref={printRef}>
              {filters.roleType === 'Internship' ? renderInternshipStats() : renderBackgroundCheckStats()}
              {renderStatusDistribution()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BackgroundCheckReport
