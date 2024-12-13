// src/components/layout/AdminLayout.jsx
import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import Sidebar from './Sidebar'

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <Header 
        onMenuClick={() => setIsSidebarOpen(true)}
        showMenuButton={!isSidebarOpen}
      />

      {/* Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      {/* Main Content */}
      <div 
        className={`pt-16 flex flex-col ${
          isSidebarOpen ? 'lg:ml-16' : ''
        } transition-all duration-300 ease-in-out pb-16`} // Added padding bottom for footer
      >
        {/* Page Content */}
        <main className="flex-grow p-6">
          <Outlet />
        </main>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default AdminLayout
