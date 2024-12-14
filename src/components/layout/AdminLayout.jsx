// src/components/layout/AdminLayout.jsx
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import Sidebar from './Sidebar'
import { useState } from 'react'

const AdminLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header 
        onMenuClick={() => setIsSidebarOpen(true)}
        showMenuButton={!isSidebarOpen}
      />

      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className={`pt-16 min-h-screen ${
        isSidebarOpen ? 'lg:ml-64' : ''
      } transition-all duration-200 ease-in-out`}>
        <main className="p-6">
          {children || <Outlet />}
        </main>

        <Footer />
      </div>
    </div>
  )
}

export default AdminLayout
