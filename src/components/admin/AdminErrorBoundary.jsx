// src/components/admin/AdminErrorBoundary.jsx
import React from 'react'
import { AlertTriangle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'

class AdminErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Admin page error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
            <div className="flex flex-col items-center text-center">
              <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
              <p className="text-gray-600 mb-6">
                There was an error loading this admin page. Please try again or contact support if the issue persists.
              </p>
              <Button
                onClick={() => window.location.reload()}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Refresh Page
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Wrapper to use hooks with class component
const AdminErrorBoundaryWithHooks = (props) => {
  const navigate = useNavigate()
  return <AdminErrorBoundary navigate={navigate} {...props} />
}

export default AdminErrorBoundaryWithHooks
