// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '@/config/supabase'

const AuthContext = createContext({})

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedUser = localStorage.getItem('sss_user')
        if (storedUser) {
          const userData = JSON.parse(storedUser)
          // Verify the user still exists and is active
          const { data: currentUser, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', userData.id)
            .eq('status', 'active')
            .single()

          if (error || !currentUser) {
            throw new Error('Session expired')
          }

          setUser(currentUser)
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        localStorage.removeItem('sss_user')
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  const signIn = async (username, password) => {
    try {
      setError(null)

      // Get user by username
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .eq('status', 'active')
        .single()

      if (userError || !userData) {
        throw new Error('Invalid username or password')
      }

      // In a real app, you should hash the password and compare with the hashed version
      if (userData.password !== password) {
        throw new Error('Invalid username or password')
      }

      // Update last login
      await supabase
        .from('users')
        .update({ 
          last_login: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', userData.id)

      setUser(userData)
      localStorage.setItem('sss_user', JSON.stringify(userData))

      return userData
    } catch (error) {
      console.error('Sign in error:', error)
      setError(error.message)
      throw error
    }
  }

  const signOut = async () => {
    try {
      if (user) {
        // Update last activity
        await supabase
          .from('users')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', user.id)
      }

      setUser(null)
      localStorage.removeItem('sss_user')
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    }
  }

  const refreshUser = async () => {
    try {
      if (!user) return

      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .eq('status', 'active')
        .single()

      if (error || !userData) {
        throw new Error('User not found or inactive')
      }

      setUser(userData)
      localStorage.setItem('sss_user', JSON.stringify(userData))
    } catch (error) {
      console.error('Refresh user error:', error)
      setUser(null)
      localStorage.removeItem('sss_user')
      throw error
    }
  }

  const value = {
    user,
    loading,
    error,
    signIn,
    signOut,
    refreshUser,
    isAdmin: user?.role === 'admin',
    isAuthenticated: !!user,
    isSupervisor: user?.role === 'supervisor'
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
