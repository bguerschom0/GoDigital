// src/utils/toast.js
import toast from 'react-hot-toast'

export const showToast = {
  success: (message) => {
    toast.success(message, {
      duration: 3000,
      position: 'top-right',
      style: {
        background: '#363636',
        color: '#fff',
      },
    })
  },
  error: (message) => {
    toast.error(message, {
      duration: 4000,
      position: 'top-right',
      style: {
        background: '#363636',
        color: '#fff',
      },
    })
  },
  loading: (message) => {
    return toast.loading(message, {
      position: 'top-right',
    })
  }
}
