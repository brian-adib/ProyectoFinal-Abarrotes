import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)

  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    const storedRole  = localStorage.getItem('role')
    const storedUser  = localStorage.getItem('username')
    if (storedToken) {
      setToken(storedToken)
      setUser({ username: storedUser, role: storedRole })
    }
  }, [])

  const login = (tokenValue, role, username) => {
    localStorage.setItem('token',    tokenValue)
    localStorage.setItem('role',     role)
    localStorage.setItem('username', username)
    setToken(tokenValue)
    setUser({ username, role })
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    localStorage.removeItem('username')
    setToken(null)
    setUser(null)
  }

  const isAdmin       = user?.role === 'Admin'
  const isAlmacenista = user?.role === 'Almacenista' || isAdmin
  const isVendedor    = user?.role === 'Vendedor' || isAdmin

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAdmin, isAlmacenista, isVendedor }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
