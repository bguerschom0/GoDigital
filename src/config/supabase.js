// src/config/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl) throw new Error('Missing environment variable: VITE_SUPABASE_URL')
if (!supabaseAnonKey) throw new Error('Missing environment variable: VITE_SUPABASE_ANON_KEY')

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const authApi = {
  async login(username, password) {
    // Call the verify_user_password function we created
    const { data: isValid, error: verifyError } = await supabase
      .rpc('verify_user_password', {
        p_username: username,
        p_password: password
      })

    if (verifyError) throw new Error('Authentication failed')
    if (!isValid) throw new Error('Invalid credentials')

    // If password is valid, get user data
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, username, fullname, role, status')
      .eq('username', username)
      .single()

    if (userError) throw userError
    if (user.status !== 'active') throw new Error('Account is not active')

    // Update last_login
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id)

    return user
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
