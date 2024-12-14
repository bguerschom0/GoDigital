// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import NewRequest from './pages/stakeholder/NewRequest'
import PendingRequests from './pages/stakeholder/PendingRequests'
import UpdateRequest from './pages/stakeholder/UpdateRequest'
import Users from './pages/admin/Users'

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/admin/*" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Route path="users" element={<Users />} />
              <Route path="stakeholder/new" element={<NewRequest />} />
              <Route path="stakeholder/pending" element={<PendingRequests />} />
              <Route path="stakeholder/update" element={<UpdateRequest />} />
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
