// src/utils/pageManagement.js
import { supabase } from '@/config/supabase'

export const pageManagement = {
  async addNewPage({
    name,
    path,
    category,
    description,
    isActive = true
  }) {
    try {
      const { data, error } = await supabase
        .from('pages')
        .insert([{
          name,
          path,
          category,
          description,
          is_active: isActive
        }])
        .select()

      if (error) throw error
      return data[0]
    } catch (error) {
      console.error('Error adding new page:', error)
      throw error
    }
  },

  async updatePage(pageId, updates) {
    try {
      const { data, error } = await supabase
        .from('pages')
        .update(updates)
        .eq('id', pageId)
        .select()

      if (error) throw error
      return data[0]
    } catch (error) {
      console.error('Error updating page:', error)
      throw error
    }
  },

  async getPagesByCategory(category) {
    try {
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .eq('category', category)
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching pages:', error)
      throw error
    }
  }
}
