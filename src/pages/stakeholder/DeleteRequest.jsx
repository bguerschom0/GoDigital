// src/pages/stakeholder/DeleteRequest.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Search, 
  Trash2, 
  Loader, 
  AlertCircle,
  RefreshCw,
  CheckCircle,
  ArrowUpDown
} from 'lucide-react'
import { supabase } from '@/config/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { format } from 'date-fns'
import { useAuth } from '@/context/AuthContext'
import { usePageAccess } from '@/hooks/usePageAccess'

const DeleteRequest = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { checkPermission } = usePageAccess()
  
  const [pageLoading, setPageLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isDeletingRequest, setIsDeletingRequest] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deletedRequests, setDeletedRequests] = useState([])
  
  // Check page access
  useEffect(() => {
    const checkAccess = async () => {
      const { canAccess } = checkPermission('/stakeholder/delete')
      
      if (!canAccess) {
        navigate(user?.role === 'admin' ? '/admin/dashboard' : '/dashboard')
        return
      }
      setPageLoading(false)
    }
    
    checkAccess()
    fetchDeletedRequests()
  }, [])

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setMessage({ type: 'error', text: 'Please enter a reference number' })
      return
    }

    setIsLoading(true)
    setSearchResults([])
    try {
      const { data, error } = await supabase
        .from('stakeholder_requests')
        .select('*')
        .ilike('reference_number', `%${searchTerm}%`)
        .order('date_received', { ascending: false })

      if (error) throw error

      setSearchResults(data)
      if (data.length === 0) {
        setMessage({ type: 'info', text: 'No requests found' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error searching requests' })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchDeletedRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('deleted_requests')
        .select('*')
        .order('deleted_at', { ascending: false })

      if (error) throw error
      setDeletedRequests(data)
    } catch (error) {
      console.error('Error fetching deleted requests:', error)
    }
  }

  const handleDelete = async () => {
    setIsDeletingRequest(true)
    try {
      // First, save to deleted_requests table
      const auditData = {
        reference_number: selectedRequest.reference_number,
        deleted_by: user.username,
        deleted_at: new Date().toISOString(),
        request_data: JSON.stringify(selectedRequest)
      }

      const { error: auditError } = await supabase
        .from('deleted_requests')
        .insert([auditData])

      if (auditError) throw auditError

      // Then delete from stakeholder_requests
      const { error: deleteError } = await supabase
        .from('stakeholder_requests')
        .delete()
        .eq('id', selectedRequest.id)

      if (deleteError) throw deleteError

      setMessage({ 
        type: 'success', 
        text: 'Request has been successfully deleted and logged.' 
      })

      // Refresh the deleted requests list
      await fetchDeletedRequests()
      
      // Clear selections and search
      setSelectedRequest(null)
      setSearchResults([])
      setSearchTerm('')
      setShowDeleteDialog(false)
    } catch (error) {
      console.error('Error:', error)
      setMessage({ 
        type: 'error', 
        text: 'Error deleting request. Please try again.' 
      })
    } finally {
      setIsDeletingRequest(false)
    }
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Delete Request
        </h1>

        {/* Search Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Search Request</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Enter Reference Number"
                  className="w-full px-4 py-2 border-2 border-[#0A2647]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] focus:border-transparent"
                />
                {isLoading && (
                  <Loader className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 animate-spin text-[#0A2647]" />
                )}
              </div>
              <Button
                onClick={handleSearch}
                disabled={isLoading}
                className="bg-[#0A2647] hover:bg-[#0A2647]/90 text-white"
              >
                <Search className="h-5 w-5 mr-2" />
                Search
              </Button>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="mt-4 space-y-2">
                {searchResults.map((result) => (
                  <div
                    key={result.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedRequest?.id === result.id
                        ? 'border-[#0A2647] bg-[#0A2647]/10'
                        : 'border-gray-200 hover:border-[#0A2647]/30'
                    }`}
                    onClick={() => setSelectedRequest(result)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">
                          {result.reference_number}
                        </p>
                        <p className="text-sm text-gray-500">
                          {format(new Date(result.date_received), 'MMM d, yyyy')}
                        </p>
                      </div>
                      {selectedRequest?.id === result.id && (
                        <Button
                          onClick={() => setShowDeleteDialog(true)}
                          variant="destructive"
                          size="sm"
                          className="bg-red-600 hover:bg-red-700"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Deleted Requests Audit Log */}
        <Card>
          <CardHeader>
            <CardTitle>Deletion History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-2 text-left">Reference Number</th>
                    <th className="px-4 py-2 text-left">Deleted By</th>
                    <th className="px-4 py-2 text-left">Deleted At</th>
                  </tr>
                </thead>
                <tbody>
                  {deletedRequests.map((item) => (
                    <tr key={item.id} className="border-b">
                      <td className="px-4 py-2">{item.reference_number}</td>
                      <td className="px-4 py-2">{item.deleted_by}</td>
                      <td className="px-4 py-2">
                        {format(new Date(item.deleted_at), 'MMM d, yyyy HH:mm:ss')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete the request with reference number{' '}
                <span className="font-semibold">{selectedRequest?.reference_number}</span>?
                This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeletingRequest}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeletingRequest ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Success/Error Messages */}
        <AnimatePresence>
          {message.text && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`
                  mx-4 p-6 rounded-lg shadow-xl max-w-md w-full bg-white
                  ${message.type === 'success' ? 'text-[#0A2647]' : 'text-red-600'}
                `}
              >
                <div className="flex items-center space-x-4">
                  <div className={`
                    p-2 rounded-full 
                    ${message.type === 'success' 
                      ? 'bg-[#0A2647]/10 text-[#0A2647]' 
                      : 'bg-red-100 text-red-600'}
                  `}>
                    {message.type === 'success' ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <AlertCircle className="w-6 h-6" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium">
                      {message.type === 'success' ? 'Success' : 'Error'}
                    </h3>
                    <p className="text-gray-600">{message.text}</p>
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <Button
                    onClick={() => setMessage({ type: '', text: '' })}
                    className="bg-[#0A2647] hover:bg-[#0A2647]/90 text-white"
                  >
                    Close
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default DeleteRequest
