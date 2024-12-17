// src/components/layout/Sidebar.jsx
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  Users, 
  FileText, 
  Clock, 
  Edit, 
  ChevronDown, 
  ChevronRight, 
  FileStack,
  LayoutDashboard,
  BarChart,
  UserCheck,
AlertTriangle,
Files,
BarChart2
} from 'lucide-react'

import { FaGraduationCap } from 'react-icons/fa';

const Sidebar = ({ isOpen, onClose }) => {
  const [isHovered, setIsHovered] = useState(false)
  const [expandedMenus, setExpandedMenus] = useState(['stakeholder'])
  const location = useLocation()

  const toggleMenu = (menu) => {
    setExpandedMenus(prev => 
      prev.includes(menu) 
        ? prev.filter(item => item !== menu)
        : [...prev, menu]
    )
  }

  const navItems = [
    {
      title: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
      href: '/admin/dashboard'
    },
    {
      title: 'Users Management',
      icon: <Users className="w-5 h-5" />,
      href: '/admin/users'
    },
    {
      title: 'Stakeholder Requests',
      icon: <FileStack className="w-5 h-5" />,
      id: 'stakeholder',
      children: [
        {
          title: 'New Request',
          icon: <FileText className="w-5 h-5" />,
          href: '/admin/stakeholder/new'
        },
        {
          title: 'Pending Requests',
          icon: <Clock className="w-5 h-5" />,
          href: '/admin/stakeholder/pending'
        },
        {
          title: 'Update Request',
          icon: <Edit className="w-5 h-5" />,
          href: '/admin/stakeholder/update'
        }
        ]
    },
      {
    title: 'Background Checks',
    icon: <UserCheck className="w-5 h-5" />,
    id: 'background',
    children: [
      {
        title: 'New Request',
        icon: <FileText className="w-5 h-5" />,
        href: '/admin/background/new'
      },
      {
        title: 'Pending Requests',
        icon: <Clock className="w-5 h-5" />,
        href: '/admin/background/pending'
      },
      {
        title: 'Update Request',
        icon: <Edit className="w-5 h-5" />,
        href: '/admin/background/update'
      },
      {
        title: 'Expired Documents',
        icon: <AlertTriangle className="w-5 h-5" />,
        href: '/admin/background/expired'
      },
      {
        title: 'Internship Overview',
        icon: <FaGraduationCap className="w-5 h-5" />,
        href: '/admin/background/InternshipOverview'
      },
      {
        title: 'All Requests',
        icon: <Files className="w-5 h-5" />,
        href: '/admin/background/all'
      }
      ]
      },
       {
      title: 'Reports',
      icon: <BarChart className="w-5 h-5" />,
      id: 'reports',
      children: [
        {
          title: 'Stakeholder Analysis',
          icon: <FileText className="w-5 h-5" />,
          href: '/admin/reports/stakeholder'
        },
        {
        title: 'Background Check Analytics',
        icon: <BarChart2 className="w-5 h-5" />,
        href: '/admin/reports/BackgroundCheckReport'
      }
      ]
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
      <nav className="mt-5 px-2">
        {navItems.map((item) => (
          <div key={item.href || item.id}>
            {item.children ? (
              <>
                <div
                  onClick={() => toggleMenu(item.id)}
                  className="flex items-center px-3 py-2 my-1 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                >
                  {item.icon}
                  <span className={`ml-3 flex-1 whitespace-nowrap transition-all duration-300 ${
                    isHovered ? 'opacity-100 w-auto' : 'opacity-0 w-0'
                  }`}>
                    {item.title}
                  </span>
                  {isHovered && (
                    expandedMenus.includes(item.id) ? 
                      <ChevronDown className="w-4 h-4" /> : 
                      <ChevronRight className="w-4 h-4" />
                  )}
                </div>
                {expandedMenus.includes(item.id) && isHovered && (
                  <div className="ml-4 mt-2 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        to={child.href}
                        className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                          location.pathname === child.href
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        {child.icon}
                        <span className="ml-3">{child.title}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <Link
                to={item.href}
                className={`flex items-center px-3 py-2 my-1 rounded-lg transition-colors ${
                  location.pathname === item.href
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {item.icon}
                <span className={`ml-3 whitespace-nowrap transition-all duration-300 ${
                  isHovered ? 'opacity-100 w-auto' : 'opacity-0 w-0'
                }`}>
                  {item.title}
                </span>
              </Link>
            )}
          </div>
        ))}
      </nav>
    </div>
  )
}

export default Sidebar
