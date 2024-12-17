// src/pages/reports/BackgroundCheckReport.jsx
import { AdminLayout } from '@/components/layout'
import { useState, useEffect } from 'react'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
import { 
  Calendar,
  Search, 
  RefreshCcw,
  FileDown,
  Printer,
  Filter,
  Users,
  Clock,
  Globe,
  Building2
} from 'lucide-react'
import { supabase } from '@/config/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
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
  ResponsiveContainer
} from 'recharts'

const COLORS = ['#0A2647', '#144272', '#205295', '#2C74B3', '#427D9D']

const citizenshipOptions = [
  'United States',
  'United Kingdom',
  'Canada',
  'Australia',
  'Germany',
  'France',
  'Japan',
  'Singapore',
  'India',
  'Other'
]

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
      return null
    default:
      return null
  }
}

const getDateRangeEnd = () => new Date()

const BackgroundCheckReport = () => {
  // States for filters
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
  const [stats, setStats] = useState({
    totalChecks: 0,
    pendingChecks: 0,
    closedChecks: 0,
    uniqueCountries: 0,
    activeDepartments: 0
  })
  const [operatingCountryData, setOperatingCountryData] = useState([])
  const [statusDistribution, setStatusDistribution] = useState([])
  const [citizenshipDistribution, setCitizenshipDistribution] = useState([])

  useEffect(() => {
    fetchData()
    fetchDepartmentsAndRoles()
  }, [filters])

  const fetchDepartmentsAndRoles = async () => {
    try {
      // Fetch departments
      const { data: deptData, error: deptError } = await supabase
        .from('departments')
        .select('id, name')
        .eq('status', 'active')

      if (deptError) throw deptError
      setDepartments(deptData || [])

      // Fetch roles
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

      // Apply filters
      if (filters.dateRange !== 'all') {
        const startDate = filters.dateRange === 'custom' 
          ? filters.startDate 
          : getDateRangeStart(filters.dateRange)
        const endDate = filters.dateRange === 'custom'
          ? filters.endDate
          : getDateRangeEnd()

        if (startDate) {
          query = query.gte('submitted_date', startDate.toISOString())
        }
        if (endDate) {
          query = query.lte('submitted_date', endDate.toISOString())
        }
      }

      if (filters.requested_by) {
        query = query.ilike('requested_by', `%${filters.requested_by}%`)
      }

      if (filters.citizenship !== 'all') {
        query = query.eq('citizenship', filters.citizenship)
      }

      if (filters.from_company) {
        query = query.ilike('from_company', `%${filters.from_company}%`)
      }

      if (filters.department !== 'all') {
        query = query.eq('department_id', filters.department)
      }

      if (filters.roleType !== 'all') {
        query = query.eq('role_type', filters.roleType)
      }

      const { data, error } = await query

      if (error) throw error

      processData(data || [])
    } catch (error) {
      console.error('Error fetching report data:', error)
    } finally {
      setLoading(false)
    }
  }

  const processData = (data) => {
    // Basic stats
    const totalChecks = data.length
    const pendingChecks = data.filter(check => check.status === 'Pending').length
    const closedChecks = data.filter(check => check.status === 'Closed').length
    const uniqueCountries = new Set(data.map(check => check.operating_country)).size
    const activeDepartments = new Set(data.map(check => check.department_id)).size

    setStats({ 
      totalChecks, 
      pendingChecks, 
      closedChecks,
      uniqueCountries,
      activeDepartments
    })

    // Process operating country data
    const countryData = data.reduce((acc, check) => {
      if (check.operating_country) {
        const date = check.submitted_date.split('T')[0]
        acc[date] = (acc[date] || 0) + 1
      }
      return acc
    }, {})

    setOperatingCountryData(
      Object.entries(countryData)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => new Date(a.date) - new Date(b.date))
    )

    // Process status distribution
    const statusData = data.reduce((acc, check) => {
      acc[check.status] = (acc[check.status] || 0) + 1
      return acc
    }, {})

    setStatusDistribution(
      Object.entries(statusData)
        .map(([name, value]) => ({ name, value }))
    )

    // Process citizenship distribution
    const citizenshipData = data.reduce((acc, check) => {
      acc[check.citizenship] = (acc[check.citizenship] || 0) + 1
      return acc
    }, {})

    setCitizenshipDistribution(
      Object.entries(citizenshipData)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
    )
  }

  return (
    <AdminLayout>
      <div className="flex justify-center -mt-6">
        <div className="w-full max-w-[90%] px-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white pt-2 mb-6">
            Background Check Analysis
          </h1>

          {/* Filters Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center text-sm font-medium">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Date Range Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date Range
                  </label>
                  <select
                    value={filters.dateRange}
                    onChange={(e) => {
                      const newValue = e.target.value;
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
                    Department
                  </label>
                  <select
                    value={filters.department}
                    onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] dark:bg-gray-800 dark:border-gray-700"
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
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] dark:bg-gray-800 dark:border-gray-700"
                  >
                    <option value="all">All Roles</option>
                    <option value="Staff">Staff</option>
                    <option value="Expert">Expert</option>
                    <option value="Contractor">Contractor</option>
                    <option value="Consultant">Consultant</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Citizenship
                  </label>
                  <select
                    value={filters.citizenship}
                    onChange={(e) => setFilters(prev => ({ ...prev, citizenship: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] dark:bg-gray-800 dark:border-gray-700"
                  >
                    <option value="all">All Countries</option>
                    {citizenshipOptions.map((country) => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {loading ? (
            <div className="flex justify-center items-center h-40">
              <RefreshCcw className="w-8 h-8 animate-spin" />
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Checks</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalChecks}</div>
                    <p className="text-xs text-muted-foreground">
                      All time background checks
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
                    <CardTitle className="text-sm font-medium">Operating Countries</CardTitle>
                    <Globe className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.uniqueCountries}</div>
                    <p className="text-xs text-muted-foreground">
                      Unique operating locations
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Departments</CardTitle>
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.activeDepartments}</div>
                    <p className="text-xs text-muted-foreground">
                      Departments with active checks
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Operating Countries Timeline - Full width */}
                <Card className="lg:col-span-3">
                  <CardHeader>
                    <CardTitle>Operating Countries Timeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={operatingCountryData}>
                          <defs>
                            <linearGradient id="colorCountries" x1="0" y1="0" x2="0" y2="1">
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
                            fill="url(#colorCountries)" 
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Status Distribution */}
                <Card className="lg:col-span-1">
                  <CardHeader>
                    <CardTitle>Status Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={statusDistribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            fill="#0A2647"
                            paddingAngle={5}
                            dataKey="value"
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

                {/* Citizenship Distribution */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Citizenship Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={citizenshipDistribution}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="name" 
                            tick={{ fontSize: 12 }}
                            interval={0}
                            angle={-45}
                            textAnchor="end"
                          />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="value">
                            {citizenshipDistribution.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={COLORS[index % COLORS.length]} 
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

export default BackgroundCheckReport;
