// src/components/layout/AdminLayout.jsx
import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import Header from './Header'
import Footer from './Footer'
import Sidebar from './Sidebar'
// Import Loader2 from lucide-react
import { Loader2, AlertCircle } from 'lucide-react'

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isHovered, setIsHovered] = useState(false)
  const [pageTitle, setPageTitle] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const location = useLocation()
  const { user } = useAuth()

  // Set page title based on current route
  useEffect(() => {
    const path = location.pathname.split('/').pop()
    const title = path.charAt(0).toUpperCase() + path.slice(1)
    setPageTitle(title === 'Admin' ? 'Dashboard' : title)
  }, [location])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 text-blue-600">
          <Loader2 />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <Header 
        onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
        showMenuButton={true}
        user={user}
      />

      {/* Sidebar */}
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="fixed left-0 top-0 h-full z-30"
      >
        <Sidebar 
          isOpen={isSidebarOpen}
          isHovered={isHovered}
          onClose={() => setIsSidebarOpen(false)}
          userRole="admin"
        />
      </div>

      {/* Main Content */}
      <main 
        className={`
          pt-16 
          min-h-[calc(100vh-4rem)] 
          transition-all 
          duration-300 
          ease-in-out
          ${isSidebarOpen ? (isHovered ? 'lg:pl-64' : 'lg:pl-16') : ''}
        `}
      >
        {/* Page Header */}
        <div className="px-6 py-4 border-b bg-white dark:bg-gray-800">
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
            {pageTitle}
          </h1>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default AdminLayout
