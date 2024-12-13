// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react'
import { authApi } from '@/config/supabase'

const AuthContext = createContext({})

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      try {
        const user = await authApi.getCurrentUser()
        setUser(user)
      } catch (error) {
        console.error('Auth initialization error:', error)
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  const signIn = async (username, password) => {
    const userData = await authApi.login(username, password)
    setUser(userData)
    localStorage.setItem('sss_user', JSON.stringify(userData))
    return userData
  }

  const signOut = () => {
    setUser(null)
    localStorage.removeItem('sss_user')
  }

  const value = {
    user,
    signIn,
    signOut,
    isAdmin: user?.role === 'admin'
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
