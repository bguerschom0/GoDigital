// src/pages/stakeholder/PendingRequests.jsx
// ... previous imports remain the same ...

const PendingRequests = () => {
  // ... previous state and functions remain the same ...

  return (
    <AdminLayout>
      <div className="flex justify-center">
        <div className="w-full max-w-[90%] px-4">
          {/* Header moved to top of page */}
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white pt-4 mb-6">
            Pending Requests
          </h1>

          {/* Main content area with reduced top spacing */}
          <div className="flex flex-col space-y-4">
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
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      {/* ... table header and body remain the same ... */}
                    </table>
                  </div>

                  {/* Footer with pagination and count info */}
                  <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Showing {Math.min(totalCount, (currentPage - 1) * ITEMS_PER_PAGE + 1)} - {Math.min(totalCount, currentPage * ITEMS_PER_PAGE)} of {totalCount} pending requests
                    </div>
                    
                    <div className="flex items-center space-x-4">
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
                </>
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
