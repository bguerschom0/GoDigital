// src/components/auth/AuthForm.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { FileText, ArrowRight, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'

const AuthForm = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { user, signIn } = useAuth()

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/dashboard')
    }
  }, [user, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isLoading) return

    setError('')
    setIsLoading(true)
    
    try {
      const userData = await signIn(username, password)
      
      // Clear form
      setUsername('')
      setPassword('')
      
      // Redirect based on role
      if (userData.role === 'admin') {
        navigate('/admin/dashboard')
      } else {
        navigate('/dashboard')
      }
    } catch (err) {
      setError(err.message || 'Failed to sign in')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0A2647] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Flow */}
      <div className="absolute inset-0 overflow-hidden">
        <svg viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#0A2647"/>
          <g fill="rgba(255,255,255,0.1)">
            <circle cx="50" cy="50" r="2">
              <animateMotion path="M 0 0 L 30 15 L 50 0 Z" dur="3s" repeatCount="indefinite"/>
            </circle>
                <circle cx="150" cy="250" r="2">
      <animateMotion path="M 0 0 L -20 10 L -40 0 Z" dur="2.5s" repeatCount="indefinite"/>
    </circle>
    <circle cx="300" cy="150" r="1.5">
      <animateMotion path="M 0 0 L 10 20 L 30 10 Z" dur="3.5s" repeatCount="indefinite"/>
    </circle>
    <circle cx="500" cy="400" r="2.5">
      <animateMotion path="M 0 0 L -30 -10 L -60 0 Z" dur="4s" repeatCount="indefinite"/>
    </circle>
    <circle cx="700" cy="600" r="2">
      <animateMotion path="M 0 0 L 25 15 L 50 0 Z" dur="5s" repeatCount="indefinite"/>
    </circle>
    <circle cx="800" cy="200" r="1.8">
      <animateMotion path="M 0 0 L -15 25 L -35 0 Z" dur="2.8s" repeatCount="indefinite"/>
    </circle>
    <circle cx="900" cy="700" r="2">
      <animateMotion path="M 0 0 L 20 -10 L 40 0 Z" dur="3.2s" repeatCount="indefinite"/>
    </circle>
    <circle cx="600" cy="500" r="2.2">
      <animateMotion path="M 0 0 L -25 -15 L -50 0 Z" dur="4.5s" repeatCount="indefinite"/>
    </circle>
    <circle cx="200" cy="800" r="1.5">
      <animateMotion path="M 0 0 L 10 30 L 25 0 Z" dur="5.2s" repeatCount="indefinite"/>
    </circle>
    <circle cx="400" cy="900" r="1.8">
      <animateMotion path="M 0 0 L -20 10 L -40 0 Z" dur="3.6s" repeatCount="indefinite"/>
    </circle>
    

    <circle cx="100" cy="100" r="2">
      <animateMotion path="M 0 0 L 40 20 L 80 0 Z" dur="3s" repeatCount="indefinite"/>
    </circle>
    <circle cx="300" cy="300" r="1.5">
      <animateMotion path="M 0 0 L -10 20 L -30 10 Z" dur="4s" repeatCount="indefinite"/>
    </circle>
    <circle cx="400" cy="100" r="2">
      <animateMotion path="M 0 0 L 50 -15 L 70 0 Z" dur="3.2s" repeatCount="indefinite"/>
    </circle>
    <circle cx="800" cy="400" r="2.2">
      <animateMotion path="M 0 0 L -35 10 L -60 0 Z" dur="5s" repeatCount="indefinite"/>
    </circle>
    <circle cx="900" cy="900" r="2.5">
      <animateMotion path="M 0 0 L 30 -10 L 50 0 Z" dur="2.5s" repeatCount="indefinite"/>
    </circle>
    <circle cx="700" cy="200" r="2">
      <animateMotion path="M 0 0 L 20 10 L 30 0 Z" dur="3.8s" repeatCount="indefinite"/>
    </circle>
    <circle cx="400" cy="300" r="1.8">
      <animateMotion path="M 0 0 L -15 -25 L -25 0 Z" dur="4.2s" repeatCount="indefinite"/>
    </circle>
    <circle cx="200" cy="500" r="2">
      <animateMotion path="M 0 0 L 25 20 L 50 0 Z" dur="5s" repeatCount="indefinite"/>
    </circle>
    <circle cx="500" cy="700" r="1.5">
      <animateMotion path="M 0 0 L 15 -10 L 25 0 Z" dur="3s" repeatCount="indefinite"/>
    </circle>
    <circle cx="100" cy="600" r="2">
      <animateMotion path="M 0 0 L -20 30 L -40 0 Z" dur="4s" repeatCount="indefinite"/>
    </circle>

          </g>
        </svg>
      </div>
      
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 relative transform transition-all hover:scale-[1.01]">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-[#0A2647] rounded-full flex items-center justify-center animate-bounce-slow">
                <Send className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-[#0A2647] mb-2">
              Welcome
            </h2>
            <p className="text-gray-600 animate-fade-in">
              Sign in to access this portal
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm text-center animate-shake">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A2647] focus:border-transparent transition-all"
                  placeholder="Username"
                  disabled={isLoading}
                />
              </div>

              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A2647] focus:border-transparent transition-all"
                  placeholder="Password"
                  disabled={isLoading}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full py-3 bg-[#0A2647] text-white rounded-lg hover:bg-[#0A2647]/90 transition-all transform hover:scale-[1.02]"
              disabled={isLoading}
            >
              <span className="flex items-center justify-center">
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    Sign in to continue
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </>
                )}
              </span>
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AuthForm
