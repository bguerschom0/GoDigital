// src/components/layout/Sidebar.jsx
import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { usePageAccess } from '@/hooks/usePageAccess'
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
  BarChart2,
  Lock,
  GraduationCap,
  Menu,
  Shield
} from 'lucide-react'

const MenuGroup = ({ item, isOpen, isHovered, expandedMenus, toggleMenu, location, checkPermission }) => {
  if (!isOpen) return null

  // Filter out children based on permissions
  const accessibleChildren = item.children.filter(child => 
    checkPermission(child.href.replace('/admin', '')).canAccess
  )

  if (accessibleChildren.length === 0) return null

  return (
    <>
      <div
        onClick={() => toggleMenu(item.id)}
        className="flex items-center px-3 py-2 my-1 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
      >
        <div className="min-w-[24px] flex items-center">
          {item.icon}
        </div>
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
          {accessibleChildren.map((child) => (
            <Link
              key={child.href}
              to={child.href}
              className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                location.pathname === child.href
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <div className="min-w-[24px] flex items-center">
                {child.icon}
              </div>
              <span className="ml-3">{child.title}</span>
            </Link>
          ))}
        </div>
      )}
    </>
  )
}

const MenuItem = ({ item, isOpen, isHovered, location }) => {
  if (!isOpen) return null

  return (
    <Link
      to={item.href}
      className={`flex items-center px-3 py-2 my-1 rounded-lg transition-colors ${
        location.pathname === item.href
          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
      }`}
    >
      <div className="min-w-[24px] flex items-center">
        {item.icon}
      </div>
      <span className={`ml-3 whitespace-nowrap transition-all duration-300 ${
        isHovered ? 'opacity-100 w-auto' : 'opacity-0 w-0'
      }`}>
        {item.title}
      </span>
    </Link>
  )
}

const Sidebar = ({ isOpen, onClose }) => {
  const [isHovered, setIsHovered] = useState(false)
  const [expandedMenus, setExpandedMenus] = useState(['stakeholder'])
  const location = useLocation()
  const { user } = useAuth()
  const { checkPermission } = usePageAccess()
  const isAdmin = user?.role === 'admin'

  const toggleMenu = (menu) => {
    setExpandedMenus(prev => 
      prev.includes(menu) 
        ? prev.filter(item => item !== menu)
        : [...prev, menu]
    )
  }

  const adminNavItems = [
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
      title: 'Page Permissions',
      icon: <Lock className="w-5 h-5" />,
      href: '/admin/permissions'
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
        },
                {
          title: 'All Requests',
          icon: <Clock className="w-5 h-5" />,
          href: '/admin/stakeholder/AllRequests'
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
          icon: <GraduationCap className="w-5 h-5" />,
          href: '/admin/background/internship'
        },
        {
          title: 'All Requests',
          icon: <Files className="w-5 h-5" />,
          href: '/admin/background/all'
        }
      ]
    },
      {
    title: 'Security Services',
    icon: <Shield className="h-4 w-4" />,
    id: 'access_control',
      children: [
      {
        title: 'New Request',
        icon: <FileText className="w-5 h-5" />,
        href: '/admin/security-services/SecurityServiceRequest'
      },
              {
        title: 'Tasks',
        icon: <Clock className="w-5 h-5" />,
        href: '/admin/security-services/TasksPage'
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
          icon: <BarChart2 className="w-5 h-5" />,
          href: '/admin/reports/stakeholder'
        },
        {
          title: 'Background Check Analytics',
          icon: <BarChart2 className="w-5 h-5" />,
          href: '/admin/reports/background'
        }
      ]
    }
  ]

  const userNavItems = [
    {
    title: 'Dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />,
    href: '/user/dashboard'
    }
  ]

  // Filter navigation items based on user role and permissions
  const getNavItems = () => {
    if (isAdmin) return adminNavItems
    
    const items = [...userNavItems]
    adminNavItems.forEach(item => {
      if (item.children) {
        const accessibleChildren = item.children.filter(child => 
          checkPermission(child.href.replace('/admin', '')).canAccess
        )
        if (accessibleChildren.length > 0) {
          items.push({ ...item, children: accessibleChildren })
        }
      }
    })
    return items
  }

  const navItems = getNavItems()

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
              <MenuGroup 
                item={item}
                isOpen={isOpen}
                isHovered={isHovered}
                expandedMenus={expandedMenus}
                toggleMenu={toggleMenu}
                location={location}
                checkPermission={checkPermission}
              />
            ) : (
              <MenuItem 
                item={item}
                isOpen={isOpen}
                isHovered={isHovered}
                location={location}
              />
            )}
          </div>
        ))}
      </nav>
    </div>
  )
}

export default Sidebar
