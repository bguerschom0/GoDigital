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

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header - Fixed at top */}
      <Header 
        onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
        showMenuButton={!isSidebarOpen}
        user={user}
        className="fixed top-0 w-full z-50"
      />

      {/* Main Content Area */}
      <div className="flex flex-1 pt-16"> {/* pt-16 to account for fixed header */}
        {/* Sidebar */}
        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="flex-shrink-0"
        >
          <Sidebar 
            isOpen={isSidebarOpen}
            isHovered={isHovered}
            onClose={() => setIsSidebarOpen(false)}
            userRole="user"
          />
        </div>

        {/* Main Content */}
        <main 
          className={`
            flex-1
            transition-all
            duration-300
            ease-in-out
            overflow-y-auto
            ${isSidebarOpen ? (isHovered ? 'ml-64' : 'ml-16') : 'ml-0'}
          `}
        >
          <div className="p-6">
            <div className="max-w-7xl mx-auto">
              {children || <Outlet />}
            </div>
          </div>
        </main>
      </div>

      {/* Footer - Always at bottom */}
      <Footer className="mt-auto" />
    </div>
  )
}

export default UserLayout
