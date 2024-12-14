// src/components/layout/AdminLayout.jsx
import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import Sidebar from './Sidebar'

const AdminLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header - Fixed at top */}
      <Header 
        onMenuClick={() => setIsSidebarOpen(true)}
        showMenuButton={!isSidebarOpen}
      />

      {/* Sidebar - Collapsible */}
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Sidebar 
          isOpen={isSidebarOpen}
          isHovered={isHovered}
          onClose={() => setIsSidebarOpen(false)}
        />
      </div>

      {/* Main Content - Adjusts with sidebar */}
      <div 
        className={`
          pt-16 
          transition-all 
          duration-300 
          ease-in-out
          ${isSidebarOpen ? (isHovered ? 'lg:ml-64' : 'lg:ml-16') : ''}
        `}
      >
        {/* Content wrapper for consistent padding */}
        <div className="p-4 transition-all duration-300 ease-in-out">
          <div className="mx-auto transition-all duration-300 ease-in-out">
            {children || <Outlet />}
          </div>
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  )
}

export default AdminLayout
