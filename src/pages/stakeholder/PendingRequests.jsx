// src/pages/stakeholder/PendingRequests.jsx
import { AdminLayout } from '@/components/layout'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Loader, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { supabase } from '@/config/supabase'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'

const SuccessPopup = ({ message }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 50 }}
    className="fixed bottom-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2"
  >
    <CheckCircle2 className="h-5 w-5" />
    <p>{message}</p>
  </motion.div>
)

const ITEMS_PER_PAGE = 10;

const PendingRequests = () => {
  const [pendingRequests, setPendingRequests] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [sortField, setSortField] = useState('date_received')
  const [sortDirection, setSortDirection] = useState('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  useEffect(() => {
    fetchPendingRequests()
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchPendingRequests, 30000)
    return () => clearInterval(interval)
  }, [sortField, sortDirection, currentPage])

  const fetchPendingRequests = async () => {
    setIsLoading(true)
    try {
      // First get total count
      const { count } = await supabase
        .from('stakeholder_requests')
        .select('*', { count: 'exact' })
        .eq('status', 'Pending')

      setTotalCount(count)

      // Then get paginated data
      const { data, error } = await supabase
        .from('stakeholder_requests')
        .select('*')
        .eq('status', 'Pending')
        .order(sortField, { ascending: sortDirection === 'asc' })
        .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1)

      if (error) throw error
      setPendingRequests(data)
    } catch (error) {
      console.error('Error fetching pending requests:', error)
      setMessage({ type: 'error', text: 'Error loading pending requests' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
    setCurrentPage(1)
  }

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ChevronDown className="w-4 h-4 opacity-30" />
    return sortDirection === 'asc' ? 
      <ChevronUp className="w-4 h-4" /> : 
      <ChevronDown className="w-4 h-4" />
  }

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

  return (
    <AdminLayout>
      <div className="flex justify-center">
        <div className="w-full max-w-[90%] px-4">
          <div className="flex flex-col space-y-8">
            <div className="flex justify-between items-center pt-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pending Requests</h1>
                <p className="text-gray-500 dark:text-gray-400">
                  Showing {Math.min(totalCount, (currentPage - 1) * ITEMS_PER_PAGE + 1)} - {Math.min(totalCount, currentPage * ITEMS_PER_PAGE)} of {totalCount} pending requests
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
              {isLoading ? (
                <div className="flex justify-center items-center h-48">
                  <Loader className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              ) : pendingRequests.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400">No pending requests found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('reference_number')}
                        >
                          <div className="flex items-center space-x-1">
                            <span>Reference Number</span>
                            <SortIcon field="reference_number" />
                          </div>
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('date_received')}
                        >
                          <div className="flex items-center space-x-1">
                            <span>Date Received</span>
                            <SortIcon field="date_received" />
                          </div>
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('sender')}
                        >
                          <div className="flex items-center space-x-1">
                            <span>Sender</span>
                            <SortIcon field="sender" />
                          </div>
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('subject')}
                        >
                          <div className="flex items-center space-x-1">
                            <span>Subject</span>
                            <SortIcon field="subject" />
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Description
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {pendingRequests.map((request) => (
                        <tr 
                          key={request.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                            {request.reference_number}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {format(new Date(request.date_received), 'MMM d, yyyy')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {request.sender}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {request.subject}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-2xl">
                            {request.description}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="ghost"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="ghost"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {message?.type === 'success' && (
          <SuccessPopup message={message.text} />
        )}
      </AnimatePresence>
    </AdminLayout>
  )
}

export default PendingRequests
