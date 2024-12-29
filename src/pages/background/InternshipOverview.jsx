import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Loader2, 
  Download
} from 'lucide-react'
import { supabase } from '@/config/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
import { format } from 'date-fns'
import { useAuth } from '@/context/AuthContext'
import { usePageAccess } from '@/hooks/usePageAccess'
import Papa from 'papaparse'

const InternshipOverview = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { checkPermission } = usePageAccess()
  const [pageLoading, setPageLoading] = useState(true)
  const [internships, setInternships] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    status: 'active',
    startDate: null,
    endDate: null,
  })

  // Permission check
  useEffect(() => {
    const checkAccess = async () => {
      const { canAccess, canExport } = checkPermission('/background/internship')
      
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
      fetchInternships()
    }
  }, [filters, pageLoading])

  const fetchInternships = async () => {
    try {
      let query = supabase
        .from('background_checks')
        .select(`
          *,
          departments (name),
          roles (name)
        `)
        .eq('roles.type', 'Internship')

      // Apply date range filter if set
      if (filters.startDate) {
        query = query.gte('date_start', filters.startDate)
      }
      if (filters.endDate) {
        query = query.lte('date_end', filters.endDate)
      }

      // Apply status filter
      const currentDate = new Date().toISOString()
      if (filters.status === 'active') {
        query = query.gte('date_end', currentDate)
      } else if (filters.status === 'expired') {
        query = query.lt('date_end', currentDate)
      }

      const { data, error } = await query

      if (error) throw error
      setInternships(data || [])
    } catch (error) {
      console.error('Error fetching internships:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStatus = (endDate) => {
    const today = new Date()
    const end = new Date(endDate)
    return end >= today ? 'Active' : 'Expired'
  }

  const handleExport = () => {
    // Prepare data for export
    const exportData = internships.map(intern => ({
      'Full Name': intern.full_names,
      'Department': intern.departments?.name,
      'Start Date': format(new Date(intern.date_start), 'MMM d, yyyy'),
      'End Date': format(new Date(intern.date_end), 'MMM d, yyyy'),
      'Working With': intern.work_with,
      'Status': calculateStatus(intern.date_end)
    }))

    // Convert to CSV
    const csv = Papa.unparse(exportData)
    
    // Create blob and download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `internships_${format(new Date(), 'yyyy-MM-dd')}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#0A2647]" />
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-center">
        <div className="w-full max-w-[90%]">
          <div className="flex flex-col space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium">Filters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Status
                    </label>
                    <select
                      value={filters.status}
                      onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647]"
                    >
                      <option value="all">All Internships</option>
                      <option value="active">Active Only</option>
                      <option value="expired">Expired Only</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Start Date
                    </label>
                    <DatePicker
                      selected={filters.startDate}
                      onChange={(date) => setFilters(prev => ({ ...prev, startDate: date }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647]"
                      placeholderText="Select start date"
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
                    />
                  </div>

                  <div className="flex items-end">
                    <Button 
                      onClick={() => setFilters({ status: 'all', startDate: null, endDate: null })}
                      variant="outline"
                      className="w-full"
                    >
                      Reset Filters
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Internships Table */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg font-medium">Internship List</CardTitle>
                  <Button 
                    className="bg-[#0A2647]"
                    onClick={handleExport}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center items-center h-48">
                    <Loader2 className="w-8 h-8 animate-spin text-[#0A2647]" />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Full Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Department
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Start Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            End Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Working With
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {internships.map((intern) => (
                          <tr key={intern.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {intern.full_names}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {intern.departments?.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {format(new Date(intern.date_start), 'MMM d, yyyy')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {format(new Date(intern.date_end), 'MMM d, yyyy')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {intern.work_with}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                calculateStatus(intern.date_end) === 'Active' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {calculateStatus(intern.date_end)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InternshipOverview
