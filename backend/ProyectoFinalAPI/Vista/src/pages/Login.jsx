import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'

export default function Login() {
    const [tab, setTab] = useState('login')
    const [form, setForm] = useState({ username: '', password: '', role: 'Vendedor' })
    const [loading, setLoading] = useState(false)
    const { login } = useAuth()
    const navigate = useNavigate()
    const { error, success } = useToast()

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

    const handleLogin = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await authApi.login({ username: form.username, password: form.password })
            login(res.token, res.role, form.username)
            success('¡Bienvenido!')
            navigate('/')
        } catch (err) {
            error(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleRegistro = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            await authApi.registro({ username: form.username, password: form.password, role: form.role })
            success('Usuario registrado. Inicia sesión.')
            setTab('login')
        } catch (err) {
            error(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="login-bg">
            <div className="login-deco" aria-hidden>
                <div className="deco-circle c1" />
                <div className="deco-circle c2" />
                <div className="deco-grid" />
            </div>

            <div className="login-card">
                <div className="login-brand">
                    <span className="login-icon">★</span>
                    <div>
                        <div className="login-title">Abarrotes Don Pepe</div>
                        <div className="login-subtitle">Sistema de Gestión</div>
                    </div>
                </div>

                <div className="login-tabs">
                    <button className={`tab-btn ${tab === 'login' ? 'active' : ''}`} onClick={() => setTab('login')}>
                        Iniciar sesión
                    </button>
                    <button className={`tab-btn ${tab === 'registro' ? 'active' : ''}`} onClick={() => setTab('registro')}>
                        Registrarse
                    </button>
                </div>

                {tab === 'login' ? (
                    <form onSubmit={handleLogin} className="login-form">
                        <div className="form-group">
                            <label className="label">Usuario</label>
                            <input
                                className="input"
                                placeholder="nombre de usuario"
                                value={form.username}
                                onChange={e => set('username', e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="label">Contraseña</label>
                            <input
                                className="input"
                                type="password"
                                placeholder="••••••••"
                                value={form.password}
                                onChange={e => set('password', e.target.value)}
                                required
                            />
                        </div>
                        <button className="btn btn-primary btn-lg" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
                            {loading ? <span className="spinner" /> : 'Entrar →'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleRegistro} className="login-form">
                        <div className="form-group">
                            <label className="label">Usuario</label>
                            <input className="input" placeholder="nombre de usuario" value={form.username} onChange={e => set('username', e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label className="label">Contraseña (mín. 6 chars)</label>
                            <input className="input" type="password" placeholder="••••••••" value={form.password} onChange={e => set('password', e.target.value)} required minLength={6} />
                        </div>
                        <div className="form-group">
                            <label className="label">Rol</label>
                            <select className="input" value={form.role} onChange={e => set('role', e.target.value)}>
                                <option>Vendedor</option>
                                <option>Almacenista</option>
                                <option>Admin</option>
                            </select>
                        </div>
                        <button className="btn btn-primary btn-lg" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
                                {loading ? <span className="spinner" /> : 'Crear cuenta →'}
                        </button>
                    </form>
                )}
            </div>

            <style>{`
        .login-bg {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg);
          position: relative;
          overflow: hidden;
        }
        .login-deco { position: absolute; inset: 0; pointer-events: none; }
        .deco-circle {
          position: absolute;
          border-radius: 50%;
          border: 1px solid var(--border);
        }
        .c1 { width: 500px; height: 500px; top: -120px; right: -100px; }
        .c2 { width: 300px; height: 300px; bottom: -60px; left: -80px; border-color: rgba(232,160,32,0.15); }
        .deco-grid {
          position: absolute;
          inset: 0;
          background-image: linear-gradient(var(--border) 1px, transparent 1px),
                            linear-gradient(90deg, var(--border) 1px, transparent 1px);
          background-size: 40px 40px;
          opacity: 0.3;
        }
        .login-card {
          background: var(--card);
          border: 1px solid var(--border2);
          border-radius: 20px;
          padding: 36px 40px;
          width: 100%;
          max-width: 420px;
          position: relative;
          z-index: 1;
          box-shadow: 0 24px 60px rgba(0,0,0,0.6);
          animation: slideUp 0.3s ease;
        }
        .login-brand {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 28px;
        }
        .login-icon {
          font-size: 2.4rem;
          color: var(--accent);
        }
        .login-title {
          font-family: 'Syne', sans-serif;
          font-size: 1.15rem;
          font-weight: 800;
        }
        .login-subtitle {
          font-size: 0.78rem;
          color: var(--text3);
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        .login-tabs {
          display: flex;
          border-bottom: 1px solid var(--border);
          margin-bottom: 24px;
        }
        .tab-btn {
          flex: 1;
          padding: 10px;
          background: none;
          color: var(--text3);
          font-size: 0.875rem;
          font-family: 'DM Sans', sans-serif;
          border-bottom: 2px solid transparent;
          margin-bottom: -1px;
          transition: all 0.15s;
        }
        .tab-btn.active { color: var(--accent); border-bottom-color: var(--accent); }
        .tab-btn:hover:not(.active) { color: var(--text2); }
        .login-form { display: flex; flex-direction: column; }
      `}</style>
        </div>
    )
}
