// src/components/layout/Sidebar.jsx
import { Link } from 'react-router-dom'
import { Users, Settings, LayoutDashboard, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

const Sidebar = ({ isOpen, onClose }) => {
  const [isHovered, setIsHovered] = useState(false)

  const navItems = [
    {
      title: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
      href: '/admin/dashboard'
    },
    {
      title: 'Users',
      icon: <Users className="w-5 h-5" />,
      href: '/admin/users'
    },
    {
      title: 'Settings',
      icon: <Settings className="w-5 h-5" />,
      href: '/admin/settings'
    }
  ]

  return (
    <div 
      className={`fixed left-0 z-40 bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 ease-in-out h-[calc(100vh-4rem)] top-16 ${
        isOpen ? (isHovered ? 'w-64' : 'w-16') : '-translate-x-full w-64'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex flex-col h-full">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="lg:hidden self-end mr-4 mt-2"
        >
          <X className="w-5 h-5" />
        </Button>

        <nav className="mt-5 px-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className="flex items-center px-3 py-2 my-1 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300"
            >
              <div className="flex items-center">
                {item.icon}
                <span className={`ml-3 whitespace-nowrap transition-all duration-300 ${
                  isHovered ? 'opacity-100 w-auto' : 'opacity-0 w-0'
                }`}>
                  {item.title}
                </span>
              </div>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  )
}

export default Sidebar
