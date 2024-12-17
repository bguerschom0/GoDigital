// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '@/config/supabase'

const AuthContext = createContext({})

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check for stored user data
        const storedUser = localStorage.getItem('sss_user')
        if (storedUser) {
          const userData = JSON.parse(storedUser)
          // Verify the user still exists and is active
          const { data: currentUser, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', userData.id)
            .eq('status', 'active')
            .single()

          if (userError || !currentUser) {
            throw new Error('Session expired or user inactive')
          }

          setUser(currentUser)
          // Update last_login
          await supabase
            .from('users')
            .update({ last_login: new Date().toISOString() })
            .eq('id', currentUser.id)
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        setError(error.message)
        setUser(null)
        localStorage.removeItem('sss_user')
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  const signIn = async (username, password) => {
    try {
      setError(null)
      
      // Fetch user and verify password
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .eq('status', 'active')
        .single()

      if (userError || !userData) {
        throw new Error('Invalid username or password')
      }

      // You should use a proper password verification here
      // This is just a placeholder - implement actual password checking
      if (password !== userData.password) {
        throw new Error('Invalid username or password')
      }

      // Update last_login
      const { error: updateError } = await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', userData.id)

      if (updateError) throw updateError

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
        // Update last activity if needed
        await supabase
          .from('users')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', user.id)
      }
      
      setUser(null)
      localStorage.removeItem('sss_user')
    } catch (error) {
      console.error('Sign out error:', error)
      setError(error.message)
      throw error
    }
  }

  const refreshUser = async () => {
    try {
      if (!user) return

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .eq('status', 'active')
        .single()

      if (userError || !userData) {
        throw new Error('User not found or inactive')
      }

      setUser(userData)
      localStorage.setItem('sss_user', JSON.stringify(userData))
    } catch (error) {
      console.error('Refresh user error:', error)
      setError(error.message)
      setUser(null)
      localStorage.removeItem('sss_user')
      throw error
    }
  }

  const updatePassword = async (currentPassword, newPassword) => {
    try {
      if (!user) throw new Error('Not authenticated')

      // Verify current password
      if (currentPassword !== user.password) {
        throw new Error('Current password is incorrect')
      }

      // Update password
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          password: newPassword,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (updateError) throw updateError

      await refreshUser()
    } catch (error) {
      console.error('Password update error:', error)
      setError(error.message)
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
    updatePassword,
    isAdmin: user?.role === 'admin',
    isSupervisor: user?.role === 'supervisor',
    isActive: user?.status === 'active',
    isAuthenticated: !!user
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
