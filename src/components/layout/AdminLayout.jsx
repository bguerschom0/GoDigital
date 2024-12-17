// src/components/layout/AdminLayout.jsx
import { useState, useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import Sidebar from './Sidebar'
import { useAuth } from '@/context/AuthContext'
import { Loader2 } from 'lucide-react'

const AdminLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isHovered, setIsHovered] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { user, isAdmin } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // Check admin permission
    if (!isAdmin) {
      navigate('/dashboard')
      return
    }
    setIsLoading(false)
  }, [isAdmin, navigate])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <Header 
        onMenuClick={toggleSidebar}
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
          ${isSidebarOpen ? (isHovered ? 'lg:ml-64' : 'lg:ml-16') : ''}
        `}
      >
        {/* Breadcrumb can be added here */}
        <div className="p-4 h-full">
          <div className="mx-auto max-w-7xl h-full">
            {children || <Outlet />}
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default AdminLayout
