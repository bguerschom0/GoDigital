// src/config/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl) throw new Error('Missing environment variable: VITE_SUPABASE_URL')
if (!supabaseAnonKey) throw new Error('Missing environment variable: VITE_SUPABASE_ANON_KEY')

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const authApi = {
  async login(username, password) {
    // First get the user
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single()

    if (userError) throw new Error('Invalid credentials')
    if (!userData) throw new Error('User not found')

    // Verify password using direct SQL query
    const { data: verifyData, error: verifyError } = await supabase
      .rpc('check_password', {
        input_username: username,
        input_password: password
      })

    if (verifyError || !verifyData) {
      throw new Error('Invalid credentials')
    }

    // If we get here, password is correct
    if (userData.status !== 'active') {
      throw new Error('Account is not active')
    }

    // Update last login
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', userData.id)

    // Return user data without sensitive information
    const { password: _, ...userDataWithoutPassword } = userData
    return userDataWithoutPassword
  },

  async getCurrentUser() {
    const storedUser = localStorage.getItem('sss_user')
    if (!storedUser) return null
    
    const user = JSON.parse(storedUser)
    const { data, error } = await supabase
      .from('users')
      .select('id, username, fullname, role, status')
      .eq('id', user.id)
      .single()

    if (error || !data) {
      localStorage.removeItem('sss_user')
      return null
    }

    return data
  }
}
