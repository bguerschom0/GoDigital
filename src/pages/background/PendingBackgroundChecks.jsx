// src/pages/background/PendingBackgroundChecks.jsx (example)
import { AdminLayout } from '@/components/layout'

const PendingBackgroundChecks = () => {
  return (
    <AdminLayout>
      <div className="flex justify-center -mt-6">
        <div className="w-full max-w-[90%] px-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white pt-2 mb-6">
            New Background Check
          </h1>
          {/* Content will go here */}
        </div>
      </div>
    </AdminLayout>
  )
}

export default PendingBackgroundChecks