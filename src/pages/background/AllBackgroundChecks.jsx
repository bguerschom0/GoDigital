
// src/pages/background/AllBackgroundChecks.jsx
import { AdminLayout } from '@/components/layout'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Search, 
  FileText, 
  Download,
  Loader,
  Filter,
  Calendar,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { supabase } from '@/config/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { format } from 'date-fns'
import * as XLSX from 'xlsx'

const AllBackgroundChecks = () => {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    role: 'all',
    department: 'all',
    status: 'all',
    citizenship: 'all',
    searchTerm: ''
  })
  const [sortConfig, setSortConfig] = useState({
    key: 'submitted_date',
    direction: 'desc'
  })
  const [departments, setDepartments] = useState([])
  const [roles, setRoles] = useState([])

  useEffect(() => {
    fetchDepartmentsAndRoles()
    fetchRecords()
  }, [filters, sortConfig])

  const fetchDepartmentsAndRoles = async () => {
    try {
      // Fetch departments
      const { data: depts, error: deptsError } = await supabase
        .from('departments')
        .select('*')
        .eq('status', 'active')
      
      if (deptsError) throw deptsError
      setDepartments(depts)

      // Fetch roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('roles')
        .select('*')
        .eq('status', 'active')
      
      if (rolesError) throw rolesError
      setRoles(rolesData)
    } catch (error) {
      console.error('Error fetching departments and roles:', error)
    }
  }

  const fetchRecords = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('background_checks')
        .select(`
          *,
          departments (name),
          roles (name, type)
        `)
        .order(sortConfig.key, { ascending: sortConfig.direction === 'asc' })

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
      if (filters.searchTerm) {
        query = query.or(`
          full_names.ilike.%${filters.searchTerm}%,
          id_passport_number.ilike.%${filters.searchTerm}%
        `)
      }

      const { data, error } = await query

      if (error) throw error
      setRecords(data || [])
    } catch (error) {
      console.error('Error fetching records:', error)
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

  const exportToExcel = () => {
    const exportData = records.map(record => ({
      'Full Names': record.full_names,
      'Citizenship': record.citizenship,
      'ID/Passport': record.id_passport_number,
      'Department': record.departments?.name,
      'Role': record.roles?.name,
      'Status': record.status,
      'Submitted Date': format(new Date(record.submitted_date), 'yyyy-MM-dd'),
      'Requested By': record.requested_by
    }))

    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Background Checks')
    XLSX.writeFile(wb, `background_checks_${format(new Date(), 'yyyy-MM-dd')}.xlsx`)
  }

  return (
    <AdminLayout>
      <div className="flex justify-center -mt-6">
        <div className="w-full max-w-[90%] px-4">
          <div className="flex justify-between items-center pt-2 mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              All Background Checks
            </h1>
            <Button
              onClick={exportToExcel}
              className="bg-[#0A2647] hover:bg-[#0A2647]/90 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Export to Excel
            </Button>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg font-medium flex items-center">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Search
                  </label>
                  <input
                    type="text"
                    value={filters.searchTerm}
                    onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                    placeholder="Search names or ID..."
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
                    <option value="all">All</option>
                    <option value="Rwandan">Rwandan</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      {[
                        { key: 'full_names', label: 'Full Names' },
                        { key: 'citizenship', label: 'Citizenship' },
                        { key: 'id_passport_number', label: 'ID/Passport' },
                        { key: 'departments.name', label: 'Department' },
                        { key: 'roles.name', label: 'Role' },
                        { key: 'status', label: 'Status' },
                        { key: 'submitted_date', label: 'Submitted Date' },
                        { key: 'requested_by', label: 'Requested By' }
                      ].map(column => (
                        <th
                          key={column.key}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
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
                        <td colSpan="8" className="px-6 py-4 text-center">
                          <Loader className="w-6 h-6 animate-spin mx-auto text-[#0A2647]" />
                        </td>
                      </tr>
                    ) : records.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                          No records found
                        </td>
                      </tr>
                    ) : (
                      records.map((record) => (
                        <tr 
                          key={record.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">{record.full_names}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{record.citizenship}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{record.id_passport_number}</td>
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
    </AdminLayout>
  )
}

export default AllBackgroundChecks
