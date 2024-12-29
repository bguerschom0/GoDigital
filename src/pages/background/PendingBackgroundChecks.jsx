import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Loader2,
  Download
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/config/supabase'
import { useAuth } from '@/context/AuthContext'
import { usePageAccess } from '@/hooks/usePageAccess'
import { Card, CardContent } from '@/components/ui/card'
import { format } from 'date-fns'

const PendingBackgroundChecks = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { checkPermission } = usePageAccess()
  const [pageLoading, setPageLoading] = useState(true)
  const [pendingChecks, setPendingChecks] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedDepartment, setSelectedDepartment] = useState('all')
  const [departments, setDepartments] = useState([])
  
  useEffect(() => {
    const checkAccess = async () => {
      const { canAccess } = checkPermission('/background/pending')
      if (!canAccess) {
        navigate(user?.role === 'admin' ? '/admin/dashboard' : '/dashboard')
        return
      }
      setPageLoading(false)
    }
    checkAccess()
  }, [])

  useEffect(() => {
    fetchDepartments()
  }, [])

  useEffect(() => {
    fetchPendingChecks()
  }, [selectedDepartment])

  const fetchDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .eq('status', 'active')
        .order('name')

      if (error) throw error
      setDepartments(data || [])
    } catch (error) {
      console.error('Error fetching departments:', error)
    }
  }

  const fetchPendingChecks = async () => {
    setIsLoading(true)
    setError(null)
    try {
      let query = supabase
        .from('background_checks')
        .select(`
          *,
          departments:department_id(name),
          roles:role_id(name, type)
        `)
        .eq('status', 'Pending')
        .order('submitted_date', { ascending: false })

      if (selectedDepartment !== 'all') {
        query = query.eq('department_id', selectedDepartment)
      }

      const response = await query
      
      if (response.error) {
        throw response.error
      }
      
      // Filter out internships after fetching
      const filteredData = response.data?.filter(check => 
        check.roles?.type?.toLowerCase() !== 'internship'
      ) || []
      
      setPendingChecks(filteredData)
    

      const { data, error } = await query

      if (error) throw error
      setPendingChecks(data || [])
    } catch (error) {
      console.error('Error fetching pending checks:', error)
      setError('Failed to load pending background checks')
    } finally {
      setIsLoading(false)
    }
  }

  const handleExport = () => {
    try {
      // Create CSV content
      const headers = ['Full Name', 'Department', 'Role', 'Citizenship', 'Submitted Date', 'Requested By']
      const csvContent = [
        headers.join(','),
        ...pendingChecks.map(check => [
          check.full_names,
          check.departments?.name || 'N/A',
          check.roles?.name || 'N/A',
          check.citizenship,
          formatDate(check.submitted_date),
          check.requested_by
        ].join(','))
      ].join('\n')

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `pending_background_checks_${format(new Date(), 'yyyy-MM-dd')}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Error exporting data:', error)
    }
  }

  const formatDate = (date) => {
    if (!date) return 'N/A'
    return format(new Date(date), 'MMM d, yyyy')
  }

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#0A2647]" />
      </div>
    )
  }

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-[90%] px-4">
        <div className="flex flex-col space-y-6">
          {/* Header with Filters and Export Button */}
          <div className="flex justify-between items-center pt-8">
            <div className="flex space-x-4">
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] dark:bg-gray-800 dark:border-gray-700"
              >
                <option value="all">All Departments</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>
            
            <Button
              onClick={handleExport}
              className="flex items-center space-x-2 bg-[#0A2647] hover:bg-[#144272] text-white"
            >
              <Download className="w-4 h-4" />
              <span>Export to CSV</span>
            </Button>
          </div>

          {/* Content */}
          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex justify-center items-center h-48">
                  <Loader2 className="w-8 h-8 animate-spin text-[#0A2647]" />
                </div>
              ) : error ? (
                <div className="text-center py-8 text-red-500">{error}</div>
              ) : pendingChecks.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No pending background checks found
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Full Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Department
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Citizenship
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Submitted Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Requested By
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                      {pendingChecks.map((check) => (
                        <motion.tr
                          key={check.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {check.full_names}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            {check.departments?.name || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            {check.roles?.name || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            {check.citizenship}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            {formatDate(check.submitted_date)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            {check.requested_by}
                          </td>
                        </motion.tr>
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
  )
}

export default PendingBackgroundChecks
