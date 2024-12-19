// src/pages/background/InternshipOverview.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Calendar,
  Loader2, 
  Filter,
  Download,
  Clock,
  BadgeCheck,
  AlertCircle
} from 'lucide-react'
import { supabase } from '@/config/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
import { format } from 'date-fns'
import { useAuth } from '@/context/AuthContext'
import { usePageAccess } from '@/hooks/usePageAccess'

console.log('InternshipOverview component loading...') // Debug log

const InternshipOverview = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { checkPermission } = usePageAccess()
  const [pageLoading, setPageLoading] = useState(true)
  const [internships, setInternships] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    status: 'active',
    startDate: null,
    endDate: null,
  })

  console.log('Component rendered with user:', user) // Debug log

  // Check permissions
  useEffect(() => {
    const checkAccess = async () => {
      try {
        console.log('Checking permissions...') // Debug log
        const { canAccess } = checkPermission('/background/internship')
        
        if (!canAccess) {
          console.log('Access denied') // Debug log
          navigate(user?.role === 'admin' ? '/admin/dashboard' : '/dashboard')
          return
        }
        console.log('Access granted') // Debug log
        setPageLoading(false)
      } catch (error) {
        console.error('Permission check error:', error)
        setError(error.message)
        setPageLoading(false)
      }
    }
    
    checkAccess()
  }, [])

  // Fetch data
  useEffect(() => {
    if (!pageLoading && !error) {
      fetchInternships()
    }
  }, [filters, pageLoading, error])

  const fetchInternships = async () => {
    try {
      console.log('Fetching internships...') // Debug log
      setLoading(true)
      let query = supabase
        .from('background_checks')
        .select(`
          *,
          departments (name),
          roles (name)
        `)
        .eq('roles.type', 'Internship')

      // Apply filters
      if (filters.startDate) {
        query = query.gte('date_start', filters.startDate)
      }
      if (filters.endDate) {
        query = query.lte('date_end', filters.endDate)
      }

      const { data, error: fetchError } = await query
      if (fetchError) throw fetchError

      console.log('Fetched internships:', data) // Debug log
      setInternships(data || [])
    } catch (error) {
      console.error('Error fetching internships:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Error: {error}</div>
      </div>
    )
  }

  if (pageLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#0A2647]" />
      </div>
    )
  }

    const calculateStatus = (endDate) => {
    const today = new Date()
    const end = new Date(endDate)
    return end >= today ? 'Active' : 'Expired'
  }

  return (
    <div className="p-6">
      <div className="flex justify-center">
        <div className="w-full max-w-[90%]">
          <div className="flex flex-col space-y-6">
            {/* Header with Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Internships</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {internships.length}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Active Internships</CardTitle>
                  <BadgeCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {internships.filter(intern => calculateStatus(intern.date_end) === 'Active').length}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Expired Internships</CardTitle>
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {internships.filter(intern => calculateStatus(intern.date_end) === 'Expired').length}
                  </div>
                </CardContent>
              </Card>
            </div>

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
                  <Button className="bg-[#0A2647]">
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
