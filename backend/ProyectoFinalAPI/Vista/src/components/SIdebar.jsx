import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { to: '/',           icon: '◈', label: 'Dashboard',   roles: ['Admin','Vendedor','Almacenista'] },
  { to: '/productos',  icon: '▦', label: 'Productos',   roles: ['Admin','Vendedor','Almacenista'] },
  { to: '/ventas',     icon: '◎', label: 'Ventas',      roles: ['Admin','Vendedor'] },
  { to: '/categorias', icon: '⊞', label: 'Categorías',  roles: ['Admin'] },
  { to: '/proveedores',icon: '⊟', label: 'Proveedores', roles: ['Admin'] },
]

export default function Sidebar() {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const visible = navItems.filter(n => !user || n.roles.includes(user.role))

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="logo-icon">⬡</span>
        <div>
          <div className="logo-title">Abarrotes</div>
          <div className="logo-sub">Don Pepe</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {visible.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">{user?.username?.[0]?.toUpperCase() || '?'}</div>
          <div>
            <div className="user-name">{user?.username}</div>
            <div className={`badge chip role-${user?.role?.toLowerCase()}`}>{user?.role}</div>
          </div>
        </div>
        <button className="btn btn-ghost btn-sm logout-btn" onClick={handleLogout}>
          ⎋ Salir
        </button>
      </div>

      <style>{`
        .sidebar {
          width: 220px;
          min-width: 220px;
          background: var(--bg2);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          height: 100vh;
          position: sticky;
          top: 0;
        }
        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 24px 20px 20px;
          border-bottom: 1px solid var(--border);
        }
        .logo-icon {
          font-size: 1.8rem;
          color: var(--accent);
          line-height: 1;
        }
        .logo-title {
          font-family: 'Syne', sans-serif;
          font-size: 1rem;
          font-weight: 800;
          color: var(--text);
        }
        .logo-sub {
          font-size: 0.72rem;
          color: var(--text3);
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }
        .sidebar-nav {
          flex: 1;
          padding: 16px 12px;
          display: flex;
          flex-direction: column;
          gap: 2px;
          overflow-y: auto;
        }
        .nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 12px;
          border-radius: var(--radius);
          font-size: 0.875rem;
          color: var(--text2);
          transition: all 0.15s;
        }
        .nav-item:hover {
          background: var(--bg3);
          color: var(--text);
        }
        .nav-item.active {
          background: rgba(232,160,32,0.12);
          color: var(--accent);
          font-weight: 500;
        }
        .nav-icon {
          font-size: 1rem;
          width: 20px;
          text-align: center;
        }
        .sidebar-footer {
          padding: 16px 16px 20px;
          border-top: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .user-info {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .user-avatar {
          width: 34px; height: 34px;
          border-radius: 50%;
          background: rgba(232,160,32,0.15);
          border: 1px solid rgba(232,160,32,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 0.9rem;
          color: var(--accent);
          flex-shrink: 0;
        }
        .user-name {
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--text);
          margin-bottom: 3px;
        }
        .logout-btn { width: 100%; justify-content: center; }

        @media (max-width: 768px) {
          .sidebar { display: none; }
        }
      `}</style>
    </aside>
  )
}
