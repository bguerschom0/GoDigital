// src/components/layout/UserLayout.jsx
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <Header 
        onMenuClick={() => setIsSidebarOpen(true)}
        showMenuButton={!isSidebarOpen}
        user={user}
      />

      {/* Sidebar */}
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
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
          pt-16 
          min-h-[calc(100vh-4rem)] 
          transition-all 
          duration-300 
          ease-in-out
          ${isSidebarOpen ? (isHovered ? 'lg:ml-64' : 'lg:ml-16') : ''}
        `}
      >
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

export default UserLayout
