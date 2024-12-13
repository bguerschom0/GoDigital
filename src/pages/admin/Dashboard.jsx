// src/pages/admin/Dashboard.jsx
import { Card } from '@/components/ui/card'
import { Users, FileText, Activity } from 'lucide-react'

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <Users className="w-8 h-8 text-blue-500" />
            <div>
              <h3 className="text-sm font-medium text-gray-600">Total Users</h3>
              <p className="text-2xl font-bold">123</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <Activity className="w-8 h-8 text-green-500" />
            <div>
              <h3 className="text-sm font-medium text-gray-600">Active Users</h3>
              <p className="text-2xl font-bold">98</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <FileText className="w-8 h-8 text-purple-500" />
            <div>
              <h3 className="text-sm font-medium text-gray-600">Total Reports</h3>
              <p className="text-2xl font-bold">45</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard
