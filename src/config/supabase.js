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



export const getControllerDetails = async (id) => {
  const { data, error } = await supabase
    .from('controllers') // Assuming the table name is "controllers"
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw new Error('Failed to fetch controller details');
  return data;
};

export const addController = async (controller) => {
  const { error } = await supabase
    .from('controllers') // Assuming the table name is "controllers"
    .insert([controller]);

  if (error) throw new Error('Failed to add controller');
};

export const updateController = async (id, updates) => {
  const { error } = await supabase
    .from('controllers')
    .update(updates)
    .eq('id', id);

  if (error) throw new Error('Failed to update controller');
};


// Add this to your existing supabase.js file

export const addBackgroundCheck = async (backgroundCheck) => {
  const { data, error } = await supabase
    .from('background_checks')
    .insert([backgroundCheck])
    .select() // Return the inserted data

  if (error) {
    console.error('Supabase Background Check Insert Error:', error)
    throw error
  }

  return data
}

export const getBackgroundChecks = async (filters = {}) => {
  let query = supabase.from('background_checks').select('*')

  // Apply filters if provided
  Object.entries(filters).forEach(([key, value]) => {
    query = query.eq(key, value)
  })

  const { data, error } = await query

  if (error) {
    console.error('Supabase Background Check Fetch Error:', error)
    throw error
  }

  return data
}

export const updateBackgroundCheck = async (id, updates) => {
  const { data, error } = await supabase
    .from('background_checks')
    .update(updates)
    .eq('id', id)
    .select()

  if (error) {
    console.error('Supabase Background Check Update Error:', error)
    throw error
  }

  return data
}
