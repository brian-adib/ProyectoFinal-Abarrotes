import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { productosApi, ventasApi, categoriasApi, proveedoresApi } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  const { user, isAdmin, isVendedor } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({ productos: 0, ventas: 0, categorias: 0, proveedores: 0, stockBajo: 0 })
  const [ventasRecientes, setVentasRecientes] = useState([])
  const [stockAlertas, setStockAlertas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [productos, cats, provs] = await Promise.all([
          productosApi.getAll(),
          categoriasApi.getAll(),
          proveedoresApi.getAll(),
        ])

        let ventas = [], stockBajo = []
        if (isAdmin || isVendedor) {
          ventas = await ventasApi.getAll().catch(() => [])
        }
        if (isAdmin || user?.role === 'Almacenista') {
          stockBajo = await productosApi.getStockBajo(10).catch(() => [])
        }

        setStats({
          productos:   productos.length,
          ventas:      ventas.length,
          categorias:  cats.length,
          proveedores: provs.length,
          stockBajo:   stockBajo.length,
        })
        setVentasRecientes(ventas.slice(-5).reverse())
        setStockAlertas(stockBajo.slice(0, 5))
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const fmt = (n) => `$${Number(n).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`
  const fmtDate = (d) => new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <div className="page-subtitle">
            Bienvenido, <strong style={{ color: 'var(--accent)' }}>{user?.username}</strong> · {user?.role}
          </div>
        </div>
        <div className="dash-date">{new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
          <span className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
        </div>
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card yellow" style={{ cursor: 'pointer' }} onClick={() => navigate('/productos')}>
              <div className="stat-icon">▦</div>
              <div className="stat-value">{stats.productos}</div>
              <div className="stat-label">Productos</div>
            </div>
            {(isAdmin || isVendedor) && (
              <div className="stat-card green" style={{ cursor: 'pointer' }} onClick={() => navigate('/ventas')}>
                <div className="stat-icon">◎</div>
                <div className="stat-value">{stats.ventas}</div>
                <div className="stat-label">Ventas totales</div>
              </div>
            )}
            <div className="stat-card blue" style={{ cursor: 'pointer' }} onClick={() => navigate('/categorias')}>
              <div className="stat-icon">⊞</div>
              <div className="stat-value">{stats.categorias}</div>
              <div className="stat-label">Categorías</div>
            </div>
            <div className="stat-card blue" style={{ cursor: 'pointer' }} onClick={() => navigate('/proveedores')}>
              <div className="stat-icon">⊟</div>
              <div className="stat-value">{stats.proveedores}</div>
              <div className="stat-label">Proveedores</div>
            </div>
            {stats.stockBajo > 0 && (
              <div className="stat-card red">
                <div className="stat-icon">⚠</div>
                <div className="stat-value">{stats.stockBajo}</div>
                <div className="stat-label">Stock bajo (&lt; 10)</div>
              </div>
            )}
          </div>

          <div className="dash-grid">
            {(isAdmin || isVendedor) && ventasRecientes.length > 0 && (
              <div className="card dash-section">
                <h3 className="section-title">Ventas recientes</h3>
                <div className="table-wrap" style={{ border: 'none' }}>
                  <table>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Fecha</th>
                        <th>Total</th>
                        <th>Vendedor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ventasRecientes.map(v => (
                        <tr key={v.id}>
                          <td><span className="chip">#{v.id}</span></td>
                          <td style={{ color: 'var(--text2)', fontSize: '0.82rem' }}>{fmtDate(v.fecha)}</td>
                          <td><strong style={{ color: 'var(--green)' }}>{fmt(v.total)}</strong></td>
                          <td style={{ color: 'var(--text2)' }}>{v.usuario?.username || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {stockAlertas.length > 0 && (
              <div className="card dash-section">
                <h3 className="section-title">⚠ Alertas de stock bajo</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
                  {stockAlertas.map(p => (
                    <div key={p.id} className="stock-alert-row">
                      <div>
                        <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{p.nombre}</div>
                        <div style={{ color: 'var(--text3)', fontSize: '0.78rem' }}>{p.categoria?.nombre}</div>
                      </div>
                      <span className={`badge ${p.stock === 0 ? 'badge-red' : 'badge-yellow'}`}>
                        {p.stock} uds
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      <style>{`
        .dash-date { color: var(--text3); font-size: 0.82rem; letter-spacing: 0.03em; }
        .dash-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 20px; }
        .section-title { font-family: 'Syne', sans-serif; font-size: 0.95rem; font-weight: 700; margin-bottom: 16px; color: var(--text2); text-transform: uppercase; letter-spacing: 0.05em; }
        .dash-section { min-height: 180px; }
        .stock-alert-row { display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: var(--bg3); border-radius: var(--radius); border: 1px solid var(--border); }
      `}</style>
    </div>
  )
}
