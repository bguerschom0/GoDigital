// src/pages/error/SuspendedPage.jsx
const SuspendedPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Account Suspended</h1>
        <p className="text-gray-600 mb-6">
          Your account has been suspended. Please contact the administrator for more information.
        </p>
        <a
          href="/login"
          className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Back to Login
        </a>
      </div>
    </div>
  )
}

export default SuspendedPage
