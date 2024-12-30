import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Search, 
  Download,
  Loader,
  Filter,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { supabase } from '@/config/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { format, subMonths } from 'date-fns'
import * as XLSX from 'xlsx'
import { useAuth } from '@/context/AuthContext'
import { usePageAccess } from '@/hooks/usePageAccess'
import { Alert, AlertDescription } from '@/components/ui/alert'
import debounce from 'lodash/debounce'

const AllBackgroundChecks = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { checkPermission } = usePageAccess()
  const [pageLoading, setPageLoading] = useState(true)
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [exportLoading, setExportLoading] = useState(false)
  const [error, setError] = useState(null)
  const [canExportData, setCanExportData] = useState(false)
  const [requesters, setRequesters] = useState([])
  const [citizenshipOptions, setCitizenshipOptions] = useState([])
  
  const [filters, setFilters] = useState({
    role: 'all',
    department: 'all',
    status: 'all',
    citizenship: 'all',
    requestedBy: 'all',
    searchTerm: '',
    startDate: format(subMonths(new Date(), 3), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd')
  })
  
  const [sortConfig, setSortConfig] = useState({
    key: 'submitted_date',
    direction: 'desc'
  })
  const [departments, setDepartments] = useState([])
  const [roles, setRoles] = useState([])

  // Check permissions
  useEffect(() => {
    const checkAccess = async () => {
      // Admin automatically has access and export rights
      if (user?.role === 'admin') {
        setCanExportData(true)
        setPageLoading(false)
        return
      }

      // Check permissions for non-admin users
      const { canAccess, canExport } = await checkPermission('/background/all')
      
      if (!canAccess) {
        navigate('/dashboard')
        return
      }

      setCanExportData(canExport)
      setPageLoading(false)
    }
    
    checkAccess()
  }, [user])

  // Fetch initial data
  useEffect(() => {
    if (!pageLoading) {
      fetchDepartmentsAndRoles()
      fetchRequesters()
      fetchCitizenshipOptions()
      fetchRecords()
    }
  }, [pageLoading])

  // Handle real-time search
  const debouncedSearch = useCallback(
    debounce((searchTerm) => {
      fetchRecords(searchTerm)
    }, 300),
    []
  )

  useEffect(() => {
    if (!pageLoading) {
      debouncedSearch(filters.searchTerm)
    }
    return () => debouncedSearch.cancel()
  }, [filters.searchTerm])

  // Fetch records when other filters change
  useEffect(() => {
    if (!pageLoading && !filters.searchTerm) {
      fetchRecords()
    }
  }, [filters.role, filters.department, filters.status, filters.citizenship, filters.requestedBy, filters.startDate, filters.endDate, sortConfig])

  const fetchRequesters = async () => {
    try {
      const { data, error } = await supabase
        .from('background_checks')
        .select('requested_by')
        .not('requested_by', 'is', null)
        .order('requested_by')

      if (error) throw error

      // Get unique requesters
      const uniqueRequesters = [...new Set(data.map(item => item.requested_by))]
      setRequesters(uniqueRequesters)
    } catch (error) {
      console.error('Error fetching requesters:', error)
    }
  }

  const fetchCitizenshipOptions = async () => {
    try {
      const { data, error } = await supabase
        .from('background_checks')
        .select('citizenship')
        .not('citizenship', 'is', null)
        .order('citizenship')

      if (error) throw error

      // Get unique citizenship options
      const uniqueOptions = [...new Set(data.map(item => item.citizenship))]
      setCitizenshipOptions(uniqueOptions)
    } catch (error) {
      console.error('Error fetching citizenship options:', error)
    }
  }

  const fetchDepartmentsAndRoles = async () => {
    try {
      // Fetch departments
      const { data: depts, error: deptsError } = await supabase
        .from('departments')
        .select('*')
        .eq('status', 'active')
      
      if (deptsError) throw deptsError
      setDepartments(depts)

      // Fetch roles (excluding internships)
      const { data: rolesData, error: rolesError } = await supabase
        .from('roles')
        .select('*')
        .eq('status', 'active')
        .not('type', 'eq', 'internship')
      
      if (rolesError) throw rolesError
      setRoles(rolesData)
    } catch (error) {
      console.error('Error fetching departments and roles:', error)
      setError('Failed to load departments and roles')
    }
  }

  const fetchRecords = async (searchTerm = filters.searchTerm) => {
    setLoading(true)
    setError(null)
    try {
      let query = supabase
        .from('background_checks')
        .select(`
          full_names,
          citizenship,
          departments (name),
          roles (name, type),
          status,
          submitted_date,
          requested_by
        `)
        .order(sortConfig.key, { ascending: sortConfig.direction === 'asc' })
        .gte('submitted_date', filters.startDate)
        .lte('submitted_date', filters.endDate)

      // Apply filters
      if (filters.role !== 'all') {
        query = query.eq('role_id', filters.role)
      }
      if (filters.department !== 'all') {
        query = query.eq('department_id', filters.department)
      }
      if (filters.status !== 'all') {
        query = query.eq('status', filters.status)
      }
      if (filters.citizenship !== 'all') {
        query = query.eq('citizenship', filters.citizenship)
      }
      if (filters.requestedBy !== 'all') {
        query = query.eq('requested_by', filters.requestedBy)
      }
      if (searchTerm) {
        query = query.ilike('full_names', `%${searchTerm}%`)
      }

      const { data, error } = await query

      if (error) throw error
      setRecords(data || [])
    } catch (error) {
      console.error('Error fetching records:', error)
      setError('Failed to load background check records')
    } finally {
      setLoading(false)
    }
  }

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const exportToExcel = async () => {
    try {
      // Check if user is admin or has export permission
      if (user?.role !== 'admin') {
        const { canExport } = await checkPermission('/background/all')
        if (!canExport) {
          setError('You do not have permission to export data')
          return
        }
      }

      setExportLoading(true)
      setError(null)
      
      // Fetch all records for export based on current filters
      let query = supabase
        .from('background_checks')
        .select(`
          full_names,
          citizenship,
          departments (name),
          roles (name),
          status,
          submitted_date,
          requested_by
        `)
        .gte('submitted_date', filters.startDate)
        .lte('submitted_date', filters.endDate)

      // Apply filters
      if (filters.role !== 'all') query = query.eq('role_id', filters.role)
      if (filters.department !== 'all') query = query.eq('department_id', filters.department)
      if (filters.status !== 'all') query = query.eq('status', filters.status)
      if (filters.citizenship !== 'all') query = query.eq('citizenship', filters.citizenship)
      if (filters.requestedBy !== 'all') query = query.eq('requested_by', filters.requestedBy)
      if (filters.searchTerm) {
        query = query.ilike('full_names', `%${filters.searchTerm}%`)
      }

      const { data: exportRecords, error } = await query
      
      if (error) throw error

      const exportData = exportRecords.map(record => ({
        'Full Names': record.full_names,
        'Citizenship': record.citizenship,
        'Department': record.departments?.name,
        'Role': record.roles?.name,
        'Status': record.status,
        'Submitted Date': format(new Date(record.submitted_date), 'yyyy-MM-dd'),
        'Requested By': record.requested_by
      }))

      const ws = XLSX.utils.json_to_sheet(exportData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Background Checks')
      
      // Include date range in filename
      const fileName = `background_checks_${format(new Date(filters.startDate), 'yyyy-MM-dd')}_to_${format(new Date(filters.endDate), 'yyyy-MM-dd')}.xlsx`
      XLSX.writeFile(wb, fileName)

      // Log the export activity
      await supabase.from('activity_log').insert([{
        user_id: user.id,
        description: `Exported background checks data from ${filters.startDate} to ${filters.endDate}`,
        type: 'export'
      }])

    } catch (error) {
      console.error('Error exporting data:', error)
      setError('Failed to export data. Please try again.')
    } finally {
      setExportLoading(false)
    }
  }
  if (pageLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-[#0A2647]" />
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-center">
        <div className="w-full max-w-[95%]"> {/* Increased width */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              All Background Checks
            </h1>
            {(user?.role === 'admin' || canExportData) && (
              <Button
                onClick={exportToExcel}
                disabled={exportLoading || loading}
                className="bg-[#0A2647] hover:bg-[#0A2647]/90 text-white"
              >
                {exportLoading ? (
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Export to Excel
              </Button>
            )}
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Filters Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg font-medium flex items-center">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Search Names
                  </label>
                  <input
                    type="text"
                    value={filters.searchTerm}
                    onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                    placeholder="Search by name..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] dark:bg-gray-800 dark:border-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] dark:bg-gray-800 dark:border-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] dark:bg-gray-800 dark:border-gray-700"
                  />
                </div>

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
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Role
                  </label>
                  <select
                    value={filters.role}
                    onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] dark:bg-gray-800 dark:border-gray-700"
                  >
                    <option value="all">All Roles</option>
                    {roles.map(role => (
                      <option key={role.id} value={role.id}>{role.name}</option>
                    ))}
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
                    <option value="Closed">Closed</option>
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
                    <option value="all">All Citizenship</option>
                    {citizenshipOptions.map(citizenship => (
                      <option key={citizenship} value={citizenship}>{citizenship}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Requested By
                  </label>
                  <select
                    value={filters.requestedBy}
                    onChange={(e) => setFilters(prev => ({ ...prev, requestedBy: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] dark:bg-gray-800 dark:border-gray-700"
                  >
                    <option value="all">All Requesters</option>
                    {requesters.map(requester => (
                      <option key={requester} value={requester}>{requester}</option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Table Card */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      {[
                        { key: 'full_names', label: 'Full Names', width: 'w-[20%]' },
                        { key: 'citizenship', label: 'Citizenship', width: 'w-[12%]' },
                        { key: 'departments.name', label: 'Department', width: 'w-[15%]' },
                        { key: 'roles.name', label: 'Role', width: 'w-[15%]' },
                        { key: 'status', label: 'Status', width: 'w-[10%]' },
                        { key: 'submitted_date', label: 'Submitted Date', width: 'w-[13%]' },
                        { key: 'requested_by', label: 'Requested By', width: 'w-[15%]' }
                      ].map(column => (
                        <th
                          key={column.key}
                          className={`px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer ${column.width}`}
                          onClick={() => handleSort(column.key)}
                        >
                          <div className="flex items-center space-x-1">
                            <span>{column.label}</span>
                            <div className="flex flex-col">
                              <ChevronUp 
                                className={`w-4 h-4 ${
                                  sortConfig.key === column.key && sortConfig.direction === 'asc'
                                    ? 'text-[#0A2647]'
                                    : 'text-gray-400'
                                }`}
                              />
                              <ChevronDown 
                                className={`w-4 h-4 ${
                                  sortConfig.key === column.key && sortConfig.direction === 'desc'
                                    ? 'text-[#0A2647]'
                                    : 'text-gray-400'
                                }`}
                              />
                            </div>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {loading ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-4 text-center">
                          <Loader className="w-6 h-6 animate-spin mx-auto text-[#0A2647]" />
                        </td>
                      </tr>
                    ) : records.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                          No records found
                        </td>
                      </tr>
                    ) : (
                      records.map((record, index) => (
                        <tr 
                          key={index}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                          onClick={() => navigate(`/background/${record.id}`)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">{record.full_names}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{record.citizenship}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{record.departments?.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{record.roles?.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              record.status === 'Pending'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            }`}>
                              {record.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {format(new Date(record.submitted_date), 'MMM d, yyyy')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">{record.requested_by}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default AllBackgroundChecks
