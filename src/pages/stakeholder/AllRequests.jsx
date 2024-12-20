// src/pages/stakeholder/AllRequests.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  RefreshCw, 
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Download
} from 'lucide-react'
import { supabase } from '@/config/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { format } from 'date-fns'
import { useAuth } from '@/context/AuthContext'
import { usePageAccess } from '@/hooks/usePageAccess'

const AllRequests = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { checkPermission } = usePageAccess()
  
  const [pageLoading, setPageLoading] = useState(true)
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [sortConfig, setSortConfig] = useState({ key: 'date_received', direction: 'desc' })

  useEffect(() => {
    const checkAccess = async () => {
      const { canAccess } = checkPermission('/stakeholder/all')
      
      if (!canAccess) {
        navigate(user?.role === 'admin' ? '/admin/dashboard' : '/dashboard')
        return
      }
      setPageLoading(false)
    }
    
    checkAccess()
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('stakeholder_requests')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setRequests(data)
    } catch (error) {
      console.error('Error fetching requests:', error)
    } finally {
      setLoading(false)
    }
  }

  // Sort function
  const sortData = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  // Filter and sort data
  const filteredAndSortedData = () => {
    let filtered = [...requests]
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.reference_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sender?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.status?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortConfig.key === 'date_received' || sortConfig.key === 'response_date') {
        const dateA = new Date(a[sortConfig.key] || '1900-01-01')
        const dateB = new Date(b[sortConfig.key] || '1900-01-01')
        return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA
      }
      
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredAndSortedData().slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredAndSortedData().length / itemsPerPage)

  // Export to Excel
  const exportToExcel = () => {
    const data = filteredAndSortedData()
    const csvContent = [
      // Headers
      ['Reference Number', 'Date Received', 'Sender', 'Subject', 'Status', 'Response Date', 'Answered By', 'Description'],
      // Data
      ...data.map(item => [
        item.reference_number,
        item.date_received,
        item.sender,
        item.subject,
        item.status,
        item.response_date || '',
        item.answered_by || '',
        item.description
      ])
    ]
      .map(row => row.join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `stakeholder_requests_${format(new Date(), 'yyyy-MM-dd')}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin text-[#0A2647]" />
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-[95%] mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            All Stakeholder Requests
          </h1>
          <Button 
            onClick={exportToExcel}
            className="bg-[#0A2647] hover:bg-[#0A2647]/90 text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            Export to Excel
          </Button>
        </div>

        <Card className="overflow-hidden">
          <div className="p-4">
            <div className="flex gap-4 mb-4">
              <Input
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
              <Button
                onClick={fetchRequests}
                variant="outline"
                className="border-[#0A2647] text-[#0A2647]"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800">
                    <th className="px-4 py-3 text-left">
                      <button
                        onClick={() => sortData('reference_number')}
                        className="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400"
                      >
                        Reference Number
                        <ArrowUpDown className="w-4 h-4 ml-1" />
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left">
                      <button
                        onClick={() => sortData('date_received')}
                        className="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400"
                      >
                        Date Received
                        <ArrowUpDown className="w-4 h-4 ml-1" />
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left">
                      <button
                        onClick={() => sortData('sender')}
                        className="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400"
                      >
                        Sender
                        <ArrowUpDown className="w-4 h-4 ml-1" />
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left">
                      <button
                        onClick={() => sortData('subject')}
                        className="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400"
                      >
                        Subject
                        <ArrowUpDown className="w-4 h-4 ml-1" />
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left">
                      <button
                        onClick={() => sortData('status')}
                        className="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400"
                      >
                        Status
                        <ArrowUpDown className="w-4 h-4 ml-1" />
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left">
                      <button
                        onClick={() => sortData('response_date')}
                        className="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400"
                      >
                        Response Date
                        <ArrowUpDown className="w-4 h-4 ml-1" />
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left">
                      <button
                        onClick={() => sortData('answered_by')}
                        className="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400"
                      >
                        Answered By
                        <ArrowUpDown className="w-4 h-4 ml-1" />
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((request) => (
                    <tr 
                      key={request.id}
                      className="border-t border-gray-200 dark:border-gray-700"
                    >
                      <td className="px-4 py-3 text-sm">{request.reference_number}</td>
                      <td className="px-4 py-3 text-sm">
                        {format(new Date(request.date_received), 'MMM d, yyyy')}
                      </td>
                      <td className="px-4 py-3 text-sm">{request.sender}</td>
                      <td className="px-4 py-3 text-sm">{request.subject}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          request.status === 'Pending'
                            ? 'bg-[#0A2647]/10 text-[#0A2647]'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {request.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {request.response_date 
                          ? format(new Date(request.response_date), 'MMM d, yyyy')
                          : '-'
                        }
                      </td>
                      <td className="px-4 py-3 text-sm">{request.answered_by || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredAndSortedData().length)} of {filteredAndSortedData().length} entries
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  variant="outline"
                  className="border-[#0A2647] text-[#0A2647]"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  variant="outline"
                  className="border-[#0A2647] text-[#0A2647]"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default AllRequests
