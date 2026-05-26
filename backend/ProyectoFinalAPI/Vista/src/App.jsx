import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastContainer } from './components/Toast'
import Sidebar from './components/Sidebar'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Productos from './pages/Productos'
import Ventas from './pages/Ventas'
import Categorias from './pages/Categorias'
import Proveedores from './pages/Proveedores'

function ProtectedLayout({ children }) {
    const { token } = useAuth()
    if (!token) return <Navigate to="/login" replace />
    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar />
            <main style={{ flex: 1, overflow: 'auto' }}>
                {children}
            </main>
        </div>
    )
}

function AppRoutes() {
    const { token } = useAuth()
    return (
        <Routes>
            <Route path="/login" element={token ? <Navigate to="/" /> : <Login />} />
            <Route path="/" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
            <Route path="/productos" element={<ProtectedLayout><Productos /></ProtectedLayout>} />
            <Route path="/ventas" element={<ProtectedLayout><Ventas /></ProtectedLayout>} />
            <Route path="/categorias" element={<ProtectedLayout><Categorias /></ProtectedLayout>} />
            <Route path="/proveedores" element={<ProtectedLayout><Proveedores /></ProtectedLayout>} />
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    )
}

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <AppRoutes />
                <ToastContainer />
            </BrowserRouter>
        </AuthProvider>
    )
}