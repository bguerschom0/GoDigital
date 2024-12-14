// src/pages/stakeholder/PendingRequests.jsx
import { AdminLayout } from '@/components/layout'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader, CheckCircle2 } from 'lucide-react'
import { supabase } from '@/config/supabase'
import { format } from 'date-fns'

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

const PendingRequests = () => {
  const [pendingRequests, setPendingRequests] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [selectedRequest, setSelectedRequest] = useState(null)

  useEffect(() => {
    fetchPendingRequests()
  }, [])

  const fetchPendingRequests = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('stakeholder_requests')
        .select('*')
        .eq('status', 'Pending')
        .order('date_received', { ascending: false })

      if (error) throw error
      setPendingRequests(data)
    } catch (error) {
      console.error('Error fetching pending requests:', error)
      setMessage({ type: 'error', text: 'Error loading pending requests' })
    } finally {
      setIsLoading(false)
    }
  }

  const showSuccessMessage = (text) => {
    setMessage({ type: 'success', text })
    setTimeout(() => setMessage(null), 3000) // Hide after 3 seconds
  }

  return (
    <AdminLayout>
      <div className="flex justify-center">
        <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col space-y-8">
            <div className="flex justify-between items-center pt-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pending Requests</h1>
                <p className="text-gray-500 dark:text-gray-400">Manage and track pending stakeholder requests</p>
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
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Reference Number
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Date Received
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Sender
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Subject
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
                          className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                          onClick={() => setSelectedRequest(request)}
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
                          <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                            {request.description}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
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
