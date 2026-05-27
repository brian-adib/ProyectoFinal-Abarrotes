import { useState, useCallback, useEffect } from 'react'

let _addToast = null

export function useToast() {
  const toast = useCallback((msg, type = 'info') => {
    if (_addToast) _addToast(msg, type)
  }, [])
  return {
    toast,
    success: (m) => toast(m, 'success'),
    error:   (m) => toast(m, 'error'),
  }
}

export function ToastContainer() {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    _addToast = (msg, type) => {
      const id = Date.now()
      setToasts(t => [...t, { id, msg, type }])
      setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500)
    }
    return () => { _addToast = null }
  }, [])

  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          {t.type === 'success' && '✓ '}
          {t.type === 'error'   && '✕ '}
          {t.msg}
        </div>
      ))}
    </div>
  )
}
