// src/config/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl) throw new Error('Missing environment variable: VITE_SUPABASE_URL')
if (!supabaseAnonKey) throw new Error('Missing environment variable: VITE_SUPABASE_ANON_KEY')

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const authApi = {
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
  },

  async login(username, password) {
    const { data, error } = await supabase
      .from('users')
      .select('id, username, fullname, role, status')
      .eq('username', username)
      .eq('password', password) // Note: In production, use proper password hashing
      .single()

    if (error || !data) {
      throw new Error('Invalid credentials')
    }

    if (data.status !== 'active') {
      throw new Error('Account is not active')
    }

    // Update last login
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', data.id)

    return data
  }
}
