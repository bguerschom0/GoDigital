// src/components/debug/DebugWrapper.jsx
import { useState, useEffect } from 'react'

const DebugWrapper = ({ children }) => {
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  })

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  if (process.env.NODE_ENV !== 'development') {
    return children
  }

  return (
    <div className="relative">
      {children}
      <div className="fixed bottom-4 right-4 bg-black/75 text-white p-2 rounded-lg text-xs font-mono z-50">
        {dimensions.width}x{dimensions.height}
      </div>
    </div>
  )
}

export default DebugWrapper
