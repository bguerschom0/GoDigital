import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import Sidebar from './Sidebar'
import { useAuth } from '@/context/AuthContext'

const UserLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isHovered, setIsHovered] = useState(false)
  const { user } = useAuth()

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Sidebar */}
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative"
      >
        <Sidebar 
          isOpen={isSidebarOpen}
          isHovered={isHovered}
          onClose={() => setIsSidebarOpen(false)}
          userRole="user"
        />
      </div>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header 
          onMenuClick={toggleSidebar}
          showMenuButton={!isSidebarOpen}
          user={user}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4 py-6">
            <div className="max-w-7xl mx-auto">
              {children || <Outlet />}
            </div>
          </div>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  )
}

export default UserLayout
