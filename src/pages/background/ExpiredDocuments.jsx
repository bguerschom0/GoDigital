import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calendar,
  AlertTriangle,
  Clock,
  Filter,
  Search,
  Loader2,
  Calendar as CalendarIcon,
  FileText
} from 'lucide-react'
import { supabase } from '@/config/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { format, addDays, isAfter, isBefore, parseISO } from 'date-fns'
import { useAuth } from '@/context/AuthContext'
import { usePageAccess } from '@/hooks/usePageAccess'

const ExpiredDocuments = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { checkPermission } = usePageAccess()
  const [pageLoading, setPageLoading] = useState(true)
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('expiring-soon')
  const [searchTerm, setSearchTerm] = useState('')
  const [timeframe, setTimeframe] = useState('30')
  const [documentType, setDocumentType] = useState('internship')

  // Check permissions
  useEffect(() => {
    const checkAccess = async () => {
      const { canAccess } = checkPermission('/background/expired')
      
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
      fetchDocuments()
    }
  }, [filter, timeframe, documentType, pageLoading])

  const fetchDocuments = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('background_checks')
        .select(`
          id,
          full_names,
          citizenship,
          id_passport_number,
          passport_expiry_date,
          duration,
          date_end,
          role_id,
          department_id,
          status,
          roles (
            name,
            type
          ),
          departments (
            name
          )
        `)
        .not('status', 'eq', 'Closed')

      const { data, error } = await query

      if (error) throw error

      const THREE_MONTHS_IN_MS = 90 * 24 * 60 * 60 * 1000; // 90 days in milliseconds
      
      const processedData = data.map(doc => {
        if (documentType === 'passport' && doc.passport_expiry_date) {
          const expiryDate = parseISO(doc.passport_expiry_date);
          const today = new Date();
          const timeToExpiry = expiryDate.getTime() - today.getTime();
          
          return {
            ...doc,
            isExpired: isBefore(expiryDate, today),
            isExpiringSoon: timeToExpiry > 0 && timeToExpiry <= THREE_MONTHS_IN_MS
          };
        } else if (documentType === 'internship') {
          return {
            ...doc,
            contractExpired: doc.date_end ? isBefore(parseISO(doc.date_end), new Date()) : false,
            contractExpiringSoon: doc.date_end 
              ? isBefore(parseISO(doc.date_end), addDays(new Date(), parseInt(timeframe)))
              : false
          };
        }
        return doc;
      });

      console.log('Raw data:', data);
      console.log('Processed data:', processedData);

      // Filter by document type (internship or passport)
      const typeFilteredData = processedData.filter(doc => {
        if (documentType === 'passport') {
          return doc.passport_expiry_date != null; // Only show records with passport expiry dates
        }
        if (documentType === 'internship') {
          return doc.roles?.type?.toLowerCase().includes('intern') ||
                 doc.roles?.name?.toLowerCase().includes('intern');
        }
        return true;
      });
      
      console.log('Type filtered data:', typeFilteredData);

      // Filter by status for passport and internship separately
      const statusFilteredData = typeFilteredData.filter(doc => {
        if (documentType === 'passport') {
          if (filter === 'expired') {
            return doc.isExpired;
          }
          if (filter === 'expiring-soon') {
            return doc.isExpiringSoon && !doc.isExpired;
          }
          return true; // 'all' filter
        } else if (documentType === 'internship') {
          if (filter === 'expired') {
            return doc.contractExpired;
          }
          if (filter === 'expiring-soon') {
            return doc.contractExpiringSoon && !doc.contractExpired;
          }
          return true; // 'all' filter
        }
        return true;
      });
      
      console.log('Status filtered data:', statusFilteredData);

      setDocuments(statusFilteredData)
    } catch (error) {
      console.error('Error fetching documents:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (value) => {
    setSearchTerm(value)
  }

  const filteredDocuments = documents.filter(doc => 
    doc.full_names.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.id_passport_number.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
            {/* Header */}
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Expired Documents
              </h1>
            </div>

            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg font-medium">
                  <Filter className="w-5 h-5 mr-2" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Document Type
                    </label>
                    <select
                      value={documentType}
                      onChange={(e) => setDocumentType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] dark:bg-gray-800 dark:border-gray-700"
                    >
                      <option value="internship">Internship</option>
                      <option value="passport">Passport</option>
                    </select>
                  </div>

                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Status
                    </label>
                    <select
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] dark:bg-gray-800 dark:border-gray-700"
                    >
                      <option value="all">All Documents</option>
                      <option value="expired">Expired</option>
                      <option value="expiring-soon">Expiring Soon</option>
                    </select>
                  </div>

                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Timeframe
                    </label>
                    <select
                      value={timeframe}
                      onChange={(e) => setTimeframe(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] dark:bg-gray-800 dark:border-gray-700"
                    >
                      <option value="30">30 Days</option>
                      <option value="60">60 Days</option>
                      <option value="90">90 Days</option>
                    </select>
                  </div>

                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Search
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        placeholder="Search by name or ID/Passport"
                        className="w-full px-3 py-2 pl-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] dark:bg-gray-800 dark:border-gray-700"
                      />
                      <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Results */}
            <div className="space-y-4">
              {loading ? (
                <div className="flex justify-center items-center h-48">
                  <Loader2 className="w-8 h-8 animate-spin text-[#0A2647]" />
                </div>
              ) : filteredDocuments.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center text-gray-500">
                    No documents found matching your criteria
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredDocuments.map((doc) => (
                    <Card key={doc.id} className={`
                      ${(documentType === 'passport' && doc.isExpired) || 
                        (documentType === 'internship' && doc.contractExpired) ? 'border-red-500' : 
                        (documentType === 'passport' && doc.isExpiringSoon) || 
                        (documentType === 'internship' && doc.contractExpiringSoon) ? 'border-yellow-500' : 
                        'border-gray-200'}
                    `}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="font-medium text-lg">{doc.full_names}</h3>
                          {((documentType === 'passport' && doc.isExpired) || 
                            (documentType === 'internship' && doc.contractExpired)) && (
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                          )}
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Role:</span>
                            <span>{doc.roles?.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Department:</span>
                            <span>{doc.departments?.name}</span>
                          </div>
                          
                          {documentType === 'passport' && doc.passport_expiry_date && (
                            <div className="flex justify-between items-center">
                              <span className="text-gray-500">Passport Expiry:</span>
                              <div className="flex items-center">
                                <CalendarIcon className="h-4 w-4 mr-1" />
                                <span className={doc.isExpired ? 'text-red-500' : 
                                  doc.isExpiringSoon ? 'text-yellow-500' : ''}>
                                  {format(parseISO(doc.passport_expiry_date), 'MMM d, yyyy')}
                                </span>
                              </div>
                            </div>
                          )}

                          {documentType === 'internship' && doc.date_end && (
                            <div className="flex justify-between items-center">
                              <span className="text-gray-500">Contract End:</span>
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                <span className={doc.contractExpired ? 'text-red-500' : 
                                  doc.contractExpiringSoon ? 'text-yellow-500' : ''}>
                                  {format(parseISO(doc.date_end), 'MMM d, yyyy')}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExpiredDocuments
