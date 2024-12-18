// src/hooks/use-toast.js
import { useState, useEffect } from 'react'

const TOAST_TIMEOUT = 5000

export function useToast() {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    const timer = setInterval(() => {
      setToasts((prevToasts) => prevToasts.filter((toast) => !toast.dismissed))
    }, 100)

    return () => clearInterval(timer)
  }, [])

  const toast = ({ title, description, variant = "default" }) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast = {
      id,
      title,
      description,
      variant,
      dismissed: false,
      timestamp: Date.now(),
    }

    setToasts((prevToasts) => [...prevToasts, newToast])

    setTimeout(() => {
      setToasts((prevToasts) =>
        prevToasts.map((t) =>
          t.id === id ? { ...t, dismissed: true } : t
        )
      )
    }, TOAST_TIMEOUT)

    return {
      id,
      dismiss: () => {
        setToasts((prevToasts) =>
          prevToasts.map((t) =>
            t.id === id ? { ...t, dismissed: true } : t
          )
        )
      },
    }
  }

  return { toast, toasts }
}
