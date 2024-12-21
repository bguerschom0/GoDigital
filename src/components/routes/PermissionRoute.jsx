// src/components/routes/PermissionRoute.jsx
import { usePageAccess } from '@/hooks/usePageAccess'
import { useAuth } from '@/context/AuthContext'
import { AlertCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'

// Helper function to check if path is in navigation items
const isPathInNavigation = (path, navItems) => {
  for (const item of navItems) {
    if (item.href === path) return true
    if (item.children) {
      for (const child of item.children) {
        if (child.href === path) return true
      }
    }
  }
  return false
}

const PermissionRoute = ({ element: Component, path }) => {
  const { checkPermission } = usePageAccess()
  const { user } = useAuth()
  const navigate = useNavigate()
  
  // Dashboard is always accessible
  if (path === '/user/dashboard') {
    return <Component />
  }

  // Get navigation items based on permissions
  const navItems = getNavItems(user, checkPermission)
  const isInSidebar = isPathInNavigation(path, navItems)

  console.log(`Checking sidebar visibility for ${path}:`, {
    isInSidebar,
    user: user?.username
  })

  if (!isInSidebar) {
    return (
      <AccessDeniedMessage 
        message="This page is not available. Please contact your administrator if you need access."
        showBackButton
        onBack={() => navigate(-1)}
      />
    )
  }

  return <Component />
}

const AccessDeniedMessage = ({ message, showBackButton = true, onBack }) => (
  <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
    <Card className="max-w-md w-full p-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4">
          <AlertCircle className="w-6 h-6 text-red-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600 mb-6">{message}</p>
        {showBackButton && (
          <Button
            onClick={onBack}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Go Back
          </Button>
        )}
      </div>
    </Card>
  </div>
)

// Function to get navigation items based on permissions
const getNavItems = (user, checkPermission) => {
  // Only get items that are visible in the sidebar
  const baseNavItems = [
    {
      title: 'Dashboard',
      href: '/user/dashboard'
    },
    {
      title: 'Stakeholder Requests',
      children: [
        {
          title: 'New Request',
          href: '/stakeholder/new'
        },
        {
          title: 'Pending Requests',
          href: '/stakeholder/pending'
        },
        {
          title: 'Update Request',
          href: '/stakeholder/update'
        },
        {
          title: 'Delete Request',
          href: '/stakeholder/delete'
        },
        {
          title: 'All Requests',
          href: '/stakeholder/all'
        }
      ]
    },
    {
      title: 'Background Checks',
      children: [
        {
          title: 'New Request',
          href: '/background/new'
        },
        {
          title: 'Pending Requests',
          href: '/background/pending'
        },
        {
          title: 'Update Request',
          href: '/background/update'
        },
        {
          title: 'Expired Documents',
          href: '/background/expired'
        },
        {
          title: 'All Requests',
          href: '/background/all'
        },
        {
          title: 'Internship Overview',
          href: '/background/internship'
        }
      ]
    },
    {
      title: 'Reports',
      children: [
        {
          title: 'Stakeholder Analysis',
          href: '/reports/stakeholder'
        },
        {
          title: 'Background Check Analytics',
          href: '/reports/background'
        }
      ]
    }
  ]

  // Filter items based on permissions (which determine sidebar visibility)
  const filterNavItems = (items) => {
    return items.map(item => {
      if (item.children) {
        const filteredChildren = item.children.filter(child => 
          checkPermission(child.href).canAccess
        )
        return {
          ...item,
          children: filteredChildren
        }
      }
      return item
    }).filter(item => 
      !item.children || item.children.length > 0
    )
  }

  return filterNavItems(baseNavItems)
}

export default PermissionRoute
