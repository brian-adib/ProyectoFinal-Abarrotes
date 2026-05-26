import { useEffect, useState } from 'react'
import { ventasApi, productosApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'

function Modal({ title, onClose, children, wide }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={wide ? { maxWidth: 640 } : {}}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div className="modal-title">{title}</div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

export default function Ventas() {
  const { isAdmin } = useAuth()
  const { success, error } = useToast()
  const [ventas, setVentas]       = useState([])
  const [productos, setProductos] = useState([])
  const [loading, setLoading]     = useState(true)
  const [modal, setModal]         = useState(null)
  const [detalle, setDetalle]     = useState(null)
  const [carrito, setCarrito]     = useState([])
  const [productoId, setProductoId] = useState('')
  const [cantidad, setCantidad]   = useState(1)
  const [saving, setSaving]       = useState(false)

  async function load() {
    try {
      const [vs, ps] = await Promise.all([ventasApi.getAll(), productosApi.getAll()])
      setVentas(vs)
      setProductos(ps)
    } catch (e) {
      error('Error cargando ventas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const fmt = (n) => `$${Number(n).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`
  const fmtDate = (d) => new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  const agregarAlCarrito = () => {
    const prod = productos.find(p => p.id === parseInt(productoId))
    if (!prod) return
    const cant = parseInt(cantidad)
    if (cant <= 0) return
    if (cant > prod.stock) { error(`Solo hay ${prod.stock} unidades disponibles`); return }

    setCarrito(c => {
      const exists = c.find(x => x.productoId === prod.id)
      if (exists) {
        return c.map(x => x.productoId === prod.id ? { ...x, cantidad: x.cantidad + cant } : x)
      }
      return [...c, { productoId: prod.id, nombre: prod.nombre, precio: prod.precio, cantidad: cant }]
    })
    setProductoId('')
    setCantidad(1)
  }

  const quitarDelCarrito = (id) => setCarrito(c => c.filter(x => x.productoId !== id))

  const totalCarrito = carrito.reduce((s, x) => s + x.precio * x.cantidad, 0)

  const handleCrearVenta = async () => {
    if (carrito.length === 0) { error('Agrega al menos un producto'); return }
    setSaving(true)
    try {
      await ventasApi.create({ detalles: carrito.map(x => ({ productoId: x.productoId, cantidad: x.cantidad })) })
      success('Venta registrada exitosamente')
      setCarrito([])
      setModal(null)
      load()
    } catch (e) {
      error(e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await ventasApi.delete(id)
      success('Venta cancelada (stock devuelto)')
      load()
    } catch (e) {
      error(e.message)
    }
  }

  const openDetalle = async (id) => {
    try {
      const v = await ventasApi.getById(id)
      setDetalle(v)
      setModal('detalle')
    } catch (e) {
      error('No se pudo cargar el detalle')
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Ventas</h1>
          <div className="page-subtitle">{ventas.length} ventas registradas</div>
        </div>
        <button className="btn btn-primary" onClick={() => { setCarrito([]); setModal('nueva') }}>
          + Nueva venta
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
          <span className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
        </div>
      ) : ventas.length === 0 ? (
        <div className="empty-state">
          <div className="icon">◎</div>
          <p>No hay ventas registradas aún</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Fecha</th>
                <th>Vendedor</th>
                <th>Artículos</th>
                <th>Total</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {[...ventas].reverse().map(v => (
                <tr key={v.id}>
                  <td><span className="chip">#{v.id}</span></td>
                  <td style={{ color: 'var(--text2)', fontSize: '0.82rem' }}>{fmtDate(v.fecha)}</td>
                  <td>{v.usuario?.username || '—'}</td>
                  <td>
                    <span className="badge badge-blue">
                      {v['$values']
                        ? v['$values'].length
                        : v.detallesVenta?.['$values']?.length ?? v.detallesVenta?.length ?? '?'
                      } ítem(s)
                    </span>
                  </td>
                  <td><strong style={{ color: 'var(--green)' }}>{fmt(v.total)}</strong></td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => openDetalle(v.id)}>Ver</button>
                      {isAdmin && (
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(v.id)}>Cancelar</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal nueva venta */}
      {modal === 'nueva' && (
        <Modal title="Nueva Venta" onClose={() => setModal(null)} wide>
          <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'flex-end' }}>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label className="label">Producto</label>
              <select className="input" value={productoId} onChange={e => setProductoId(e.target.value)}>
                <option value="">Seleccionar…</option>
                {productos.filter(p => p.stock > 0).map(p => (
                  <option key={p.id} value={p.id}>{p.nombre} — ${p.precio} (stock: {p.stock})</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ width: 90, marginBottom: 0 }}>
              <label className="label">Cantidad</label>
              <input className="input" type="number" min="1" value={cantidad} onChange={e => setCantidad(e.target.value)} />
            </div>
            <button className="btn btn-ghost" onClick={agregarAlCarrito} disabled={!productoId}>
              + Agregar
            </button>
          </div>

          <div style={{ minHeight: 120, marginBottom: 16 }}>
            {carrito.length === 0 ? (
              <div className="empty-state" style={{ padding: '28px 0' }}>
                <p>El carrito está vacío</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {carrito.map(item => (
                  <div key={item.productoId} className="carrito-row">
                    <div>
                      <div style={{ fontWeight: 500 }}>{item.nombre}</div>
                      <div style={{ color: 'var(--text3)', fontSize: '0.8rem' }}>${item.precio} × {item.cantidad}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <strong style={{ color: 'var(--accent)' }}>${(item.precio * item.cantidad).toFixed(2)}</strong>
                      <button className="btn btn-danger btn-sm" onClick={() => quitarDelCarrito(item.productoId)}>✕</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="total-bar">
            <div>
              <div style={{ color: 'var(--text3)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total</div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.5rem', fontWeight: 800, color: 'var(--green)' }}>
                {fmt(totalCarrito)}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleCrearVenta} disabled={saving || carrito.length === 0}>
                {saving ? <span className="spinner" /> : 'Confirmar venta'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal detalle */}
      {modal === 'detalle' && detalle && (
        <Modal title={`Detalle — Venta #${detalle.id}`} onClose={() => setModal(null)} wide>
          <div style={{ marginBottom: 14, color: 'var(--text2)', fontSize: '0.85rem' }}>
            Fecha: {fmtDate(detalle.fecha)} · Vendedor: {detalle.usuario?.username}
          </div>
          <div className="table-wrap" style={{ border: 'none', marginBottom: 16 }}>
            <table>
              <thead><tr><th>Producto</th><th>Precio unit.</th><th>Cantidad</th><th>Subtotal</th></tr></thead>
              <tbody>
                {(detalle.detallesVenta?.['$values'] ?? detalle.detallesVenta ?? []).map(d => (
                  <tr key={d.id}>
                    <td>{d.producto?.nombre || `Prod #${d.productoId}`}</td>
                    <td>{fmt(d.precioUnitario)}</td>
                    <td><span className="chip">{d.cantidad}</span></td>
                    <td><strong style={{ color: 'var(--accent)' }}>{fmt(d.cantidad * d.precioUnitario)}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: 'var(--text2)', fontSize: '0.8rem' }}>TOTAL</div>
            <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.6rem', fontWeight: 800, color: 'var(--green)' }}>
              {fmt(detalle.total)}
            </div>
          </div>
        </Modal>
      )}

      <style>{`
        .carrito-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 14px;
          background: var(--bg3);
          border-radius: var(--radius);
          border: 1px solid var(--border);
        }
        .total-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          background: var(--bg3);
          border-radius: var(--radius);
          border: 1px solid var(--border);
        }
      `}</style>
    </div>
  )
}
