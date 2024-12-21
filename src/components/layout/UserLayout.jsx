// src/components/layout/UserLayout.jsx
import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import Sidebar from './Sidebar'
import { useAuth } from '@/context/AuthContext'

const UserLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <Header 
        onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
        showMenuButton={true}
        user={user}
      />

      {/* Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content */}
      <main 
        className={`
          pt-16 
          min-h-[calc(100vh-4rem)] 
          transition-all 
          duration-300 
          ease-in-out
          ${isSidebarOpen ? 'lg:ml-16 xl:ml-64' : ''}
        `}
      >
        <div className="p-4 h-full">
          <div className="mx-auto max-w-7xl h-full">
            <Outlet />
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default UserLayout
