// src/pages/reports/BackgroundCheckReport.jsx
import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/layout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { motion, AnimatePresence } from 'framer-motion'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts'
import { supabase } from '@/config/supabase'

const COLORS = ['#0A2647', '#144272', '#205295', '#2C74B3', '#427D9D']

const BackgroundCheckReport = () => {
  // States for filters
  const [filters, setFilters] = useState({
    dateRange: 'all',
    startDate: '',
    endDate: '',
    requestedBy: '',
    citizenship: '',
    submittedDate: '',
    fromCompany: '',
    departmentId: '',
    roleType: ''
  })

  // States for data
  const [departments, setDepartments] = useState([])
  const [roles, setRoles] = useState([])
  const [requestedByOptions, setRequestedByOptions] = useState([])
  const [citizenshipOptions, setCitizenshipOptions] = useState([])
  const [fromCompanyOptions, setFromCompanyOptions] = useState([])
  const [loading, setLoading] = useState(true)

  // States for chart data
  const [statusDistribution, setStatusDistribution] = useState([])
  const [citizenshipDistribution, setCitizenshipDistribution] = useState([])
  const [countryTimeline, setCountryTimeline] = useState([])

  // Fetch filter options on component mount
  useEffect(() => {
    fetchFilterOptions()
    fetchChartData()
  }, [filters])

  const fetchFilterOptions = async () => {
    try {
      // Fetch departments
      const { data: depts } = await supabase
        .from('departments')
        .select('id, name')
        .eq('status', 'active')

      setDepartments(depts || [])

      // Fetch roles
      const { data: roleData } = await supabase
        .from('roles')
        .select('id, name, type')
        .eq('status', 'active')

      setRoles(roleData || [])

      // Fetch unique requestedBy values
      const { data: requestedBy } = await supabase
        .from('background_checks')
        .select('requested_by')
        .not('requested_by', 'is', null)

      setRequestedByOptions([...new Set(requestedBy.map(item => item.requested_by))])

      // Fetch unique citizenship values
      const { data: citizenship } = await supabase
        .from('background_checks')
        .select('citizenship')

      setCitizenshipOptions([...new Set(citizenship.map(item => item.citizenship))])

      // Fetch unique from_company values
      const { data: companies } = await supabase
        .from('background_checks')
        .select('from_company')
        .not('from_company', 'is', null)

      setFromCompanyOptions([...new Set(companies.map(item => item.from_company))])

    } catch (error) {
      console.error('Error fetching filter options:', error)
    }
  }

  const fetchChartData = async () => {
    setLoading(true)
    try {
      let query = supabase.from('background_checks').select('*')

      // Apply filters
      if (filters.dateRange !== 'all') {
        if (filters.startDate) {
          query = query.gte('created_at', filters.startDate)
        }
        if (filters.endDate) {
          query = query.lte('created_at', filters.endDate)
        }
      }
      if (filters.requestedBy) {
        query = query.eq('requested_by', filters.requestedBy)
      }
      if (filters.citizenship) {
        query = query.eq('citizenship', filters.citizenship)
      }
      if (filters.fromCompany) {
        query = query.eq('from_company', filters.fromCompany)
      }
      if (filters.departmentId) {
        query = query.eq('department_id', filters.departmentId)
      }
      if (filters.roleType) {
        query = query.eq('role_id', filters.roleType)
      }

      const { data, error } = await query

      if (error) throw error

      // Process data for charts
      processChartData(data)
    } catch (error) {
      console.error('Error fetching chart data:', error)
    } finally {
      setLoading(false)
    }
  }

  const processChartData = (data) => {
    // Process status distribution
    const statusCounts = data.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1
      return acc
    }, {})

    setStatusDistribution(Object.entries(statusCounts).map(([name, value]) => ({
      name,
      value
    })))

    // Process citizenship distribution
    const citizenshipCounts = data.reduce((acc, item) => {
      acc[item.citizenship] = (acc[item.citizenship] || 0) + 1
      return acc
    }, {})

    setCitizenshipDistribution(Object.entries(citizenshipCounts).map(([name, value]) => ({
      name,
      value
    })))

    // Process operating country timeline
    const countryData = data.reduce((acc, item) => {
      if (item.operating_country) {
        const month = new Date(item.created_at).toLocaleString('default', { month: 'short' })
        if (!acc[month]) {
          acc[month] = {}
        }
        acc[month][item.operating_country] = (acc[month][item.operating_country] || 0) + 1
      }
      return acc
    }, {})

    setCountryTimeline(Object.entries(countryData).map(([month, countries]) => ({
      month,
      ...countries
    })))
  }

  return (
    <AdminLayout>
      <div className="flex justify-center -mt-6">
        <div className="w-full max-w-[90%] px-4">
          {/* Header */}
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white pt-2 mb-6">
            Background Check Report
          </h1>

          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg font-medium">Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Date Range Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date Range</label>
                  <select
                    value={filters.dateRange}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      dateRange: e.target.value
                    }))}
                    className="w-full rounded-lg border p-2"
                  >
                    <option value="all">All Time</option>
                    <option value="custom">Custom Range</option>
                  </select>
                </div>

                {filters.dateRange === 'custom' && (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Start Date</label>
                      <DatePicker
                        selected={filters.startDate ? new Date(filters.startDate) : null}
                        onChange={(date) => setFilters(prev => ({
                          ...prev,
                          startDate: date
                        }))}
                        className="w-full rounded-lg border p-2"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">End Date</label>
                      <DatePicker
                        selected={filters.endDate ? new Date(filters.endDate) : null}
                        onChange={(date) => setFilters(prev => ({
                          ...prev,
                          endDate: date
                        }))}
                        className="w-full rounded-lg border p-2"
                      />
                    </div>
                  </>
                )}

                {/* Other Filters */}
                {/* ... Add other filter dropdowns for requestedBy, citizenship, etc. */}
              </div>
            </CardContent>
          </Card>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Operating Country Timeline - Full width */}
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Operating Country Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={countryTimeline}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      {Object.keys(countryTimeline[0] || {})
                        .filter(key => key !== 'month')
                        .map((country, index) => (
                          <Area
                            key={country}
                            type="monotone"
                            dataKey={country}
                            stackId="1"
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Status Distribution */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Distribution by Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label
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

            {/* Citizenship Distribution */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Distribution by Citizenship</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={citizenshipDistribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value">
                        {citizenshipDistribution.map((entry, index) => (
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

export default BackgroundCheckReport
