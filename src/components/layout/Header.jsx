// src/components/layout/Header.jsx
import { useNavigate } from 'react-router-dom'
import { useTheme } from '@/components/theme-provider'
import { Button } from '@/components/ui/button'
import { Menu, LogOut, Moon, Sun } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

const Header = ({ onMenuClick, showMenuButton = true }) => {
   console.log('Header rendering at:', new Date().getTime(), 'with props:', { showMenuButton, onMenuClick: !!onMenuClick })
  const { theme, setTheme } = useTheme()
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm fixed top-0 w-full z-50">
      <div className="flex h-16">
        {/* Logo Section - Removed width constraint and padding */}
        <div 
          className="flex items-center cursor-pointer transition-all duration-300"
          onClick={() => navigate('/admin/dashboard')}
        >
          <img 
            src="/logo.png" 
            alt="SSS Portal" 
            className="h-16 w-auto"
          />
        </div>

        {/* Header Controls Section */}
        <div className="flex-1 flex items-center justify-between px-4">
          {showMenuButton && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuClick}
              className="lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </Button>
          )}

          <div className="flex items-center space-x-4 ml-auto">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-gray-600 dark:text-gray-300"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </Button>

            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {user?.fullname}
            </span>

            <Button
              variant="ghost"
              size="icon"
              onClick={signOut}
              className="text-gray-600 dark:text-gray-300"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
