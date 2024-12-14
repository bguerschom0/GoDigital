// src/config/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl) throw new Error('Missing environment variable: VITE_SUPABASE_URL')
if (!supabaseAnonKey) throw new Error('Missing environment variable: VITE_SUPABASE_ANON_KEY')

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const authApi = {
  async login(username, password) {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, username, fullname, role, status')
      .eq('username', username)
      .eq('password', password)
      .single()

    if (error || !user) throw new Error('Invalid credentials')
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



// Replace Firebase references with Supabase
export const addRequest = async (data) => {
  const { error } = await supabase
    .from('stakeholder_requests')
    .insert([data])
  if (error) throw error
}

export const updateRequest = async (id, data) => {
  const { error } = await supabase
    .from('stakeholder_requests')
    .update(data)
    .eq('id', id)
  if (error) throw error
}

export const getPendingRequests = async () => {
  const { data, error } = await supabase
    .from('stakeholder_requests')
    .select('*')
    .eq('status', 'Pending')
  if (error) throw error
  return data
}
