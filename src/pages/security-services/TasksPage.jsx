import React, { useState, useEffect } from 'react'
import { supabase } from '@/config/supabase'
import { useAuth } from '@/context/AuthContext'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  EyeIcon, 
  CheckCircle, 
  ClockIcon 
} from 'lucide-react'

const TasksPage = () => {
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchTasks()
  }, [filter])

  const fetchTasks = async () => {
    try {
      let query = supabase
        .from('service_requests')
        .select('*')
        .order('created_at', { ascending: false })

      if (filter !== 'all') {
        query = query.eq('status', filter)
      }

      const { data, error } = await query

      if (error) throw error
      setTasks(data || [])
    } catch (error) {
      console.error('Error fetching tasks:', error)
    }
  }

  const handleTaskUpdate = async (taskId, status) => {
    try {
      const { error } = await supabase
        .from('service_requests')
        .update({ 
          status, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', taskId)

      if (error) throw error
      
      // Refresh tasks after update
      fetchTasks()
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return <Badge variant="secondary">Pending</Badge>
      case 'In Progress':
        return <Badge variant="warning">In Progress</Badge>
      case 'Completed':
        return <Badge variant="success">Completed</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Service Requests</h1>

      <div className="mb-4 flex space-x-2">
        {['all', 'Pending', 'In Progress', 'Completed'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded ${
              filter === status 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-800'
            }`}
          >
            {status === 'all' ? 'All Tasks' : status}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {tasks.map(task => (
          <Card key={task.id} className="p-4 flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="font-semibold">{task.service_type}</h3>
                {renderStatusBadge(task.status)}
              </div>
              <p className="text-sm text-gray-600">
                Created: {new Date(task.created_at).toLocaleString()}
              </p>
            </div>

            <div className="flex items-center space-x-2">
              {task.status === 'Pending' && (
                <button
                  onClick={() => handleTaskUpdate(task.id, 'In Progress')}
                  className="text-blue-500 hover:bg-blue-50 p-2 rounded"
                >
                  <ClockIcon className="h-5 w-5" />
                </button>
              )}
              {task.status === 'In Progress' && (
                <button
                  onClick={() => handleTaskUpdate(task.id, 'Completed')}
                  className="text-green-500 hover:bg-green-50 p-2 rounded"
                >
                  <CheckCircle className="h-5 w-5" />
                </button>
              )}
              <button
                onClick={() => {
                  // Implement view details functionality
                  console.log('View task details', task)
                }}
                className="text-gray-500 hover:bg-gray-100 p-2 rounded"
              >
                <EyeIcon className="h-5 w-5" />
              </button>
            </div>
          </Card>
        ))}
      </div>

      {tasks.length === 0 && (
        <div className="text-center text-gray-500 mt-10">
          No tasks found
        </div>
      )}
    </div>
  )
}

export default TasksPage
