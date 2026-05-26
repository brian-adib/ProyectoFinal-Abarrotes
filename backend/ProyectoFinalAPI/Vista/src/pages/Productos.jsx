import { useEffect, useState } from 'react'
import { productosApi, categoriasApi, proveedoresApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'

function Modal({ title, onClose, children }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div className="modal-title">{title}</div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

const emptyForm = { id: 0, nombre: '', precio: '', stock: '', categoriaId: '', proveedorId: '' }

export default function Productos() {
  const { isAdmin, isAlmacenista } = useAuth()
  const { success, error } = useToast()
  const [productos, setProductos]   = useState([])
  const [categorias, setCategorias] = useState([])
  const [proveedores, setProveedores] = useState([])
  const [loading, setLoading]       = useState(true)
  const [buscar, setBuscar]         = useState('')
  const [modal, setModal]           = useState(null) // 'crear' | 'editar' | 'stock' | 'delete'
  const [form, setForm]             = useState(emptyForm)
  const [ajuste, setAjuste]         = useState('')
  const [saving, setSaving]         = useState(false)

  async function load() {
    try {
      const [prods, cats, provs] = await Promise.all([
        productosApi.getAll(),
        categoriasApi.getAll(),
        proveedoresApi.getAll(),
      ])
      setProductos(prods)
      setCategorias(cats)
      setProveedores(provs)
    } catch (e) {
      error('Error cargando datos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const openCrear = () => { setForm(emptyForm); setModal('crear') }
  const openEditar = (p) => {
    setForm({ id: p.id, nombre: p.nombre, precio: p.precio, stock: p.stock, categoriaId: p.categoriaId, proveedorId: p.proveedorId })
    setModal('editar')
  }
  const openStock = (p) => { setForm(p); setAjuste(''); setModal('stock') }
  const openDelete = (p) => { setForm(p); setModal('delete') }

  const handleGuardar = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        id: form.id,
        nombre: form.nombre,
        precio: parseFloat(form.precio),
        stock: parseInt(form.stock),
        categoriaId: parseInt(form.categoriaId),
        proveedorId: parseInt(form.proveedorId),
      }
      if (modal === 'crear') {
        await productosApi.create(payload)
        success('Producto creado')
      } else {
        await productosApi.update(form.id, payload)
        success('Producto actualizado')
      }
      setModal(null)
      load()
    } catch (e) {
      error(e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleStock = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await productosApi.ajustarStock(form.id, parseInt(ajuste))
      success(`Stock ajustado en ${ajuste > 0 ? '+' : ''}${ajuste}`)
      setModal(null)
      load()
    } catch (e) {
      error(e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setSaving(true)
    try {
      await productosApi.delete(form.id)
      success('Producto eliminado')
      setModal(null)
      load()
    } catch (e) {
      error(e.message)
    } finally {
      setSaving(false)
    }
  }

  const fmt = (n) => `$${Number(n).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`

  //const filtrados = productos.filter(p =>
  //  p.nombre.toLowerCase().includes(buscar.toLowerCase()) ||
  //  p.categoria?.nombre?.toLowerCase().includes(buscar.toLowerCase())
  //)
  const filtrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(buscar.toLowerCase()) ||
    (p.categoriaNombre && p.categoriaNombre.toLowerCase().includes(buscar.toLowerCase()))
  );

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Productos</h1>
          <div className="page-subtitle">{productos.length} productos en inventario</div>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={openCrear}>+ Nuevo producto</button>
        )}
      </div>

      <div className="search-bar">
        <input
          className="input"
          placeholder="Buscar por nombre o categoría…"
          value={buscar}
          onChange={e => setBuscar(e.target.value)}
        />
        {buscar && (
          <span style={{ color: 'var(--text2)', fontSize: '0.85rem' }}>{filtrados.length} resultado{filtrados.length !== 1 ? 's' : ''}</span>
        )}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
          <span className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
        </div>
      ) : filtrados.length === 0 ? (
        <div className="empty-state">
          <div className="icon">▦</div>
          <p>No se encontraron productos</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Proveedor</th>
                <th>Precio</th>
                <th>Stock</th>
                {(isAdmin || isAlmacenista) && <th>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {filtrados.map(p => (
                <tr key={p.id}>
                  <td><span className="chip">#{p.id}</span></td>
                  <td><strong>{p.nombre}</strong></td>
                {/*<td><span className="badge badge-blue">{p.categoria?.nombre || '—'}</span></td>*/}
                {/*<td style={{ color: 'var(--text2)' }}>{p.proveedor?.nombre || '—'}</td> */}
                  <td><span className="badge badge-blue">{p.categoriaNombre || '—'}</span></td>
		              <td style={{ color: 'var(--text2)' }}>{p.proveedorNombre || '—'}</td>
                  <td><strong style={{ color: 'var(--accent)' }}>{fmt(p.precio)}</strong></td>
                  <td>
                    <span className={`badge ${p.stock === 0 ? 'badge-red' : p.stock < 10 ? 'badge-yellow' : 'badge-green'}`}>
                      {p.stock} uds
                    </span>
                  </td>
                  {(isAdmin || isAlmacenista) && (
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {isAlmacenista && (
                          <button className="btn btn-ghost btn-sm" onClick={() => openStock(p)} title="Ajustar stock">± Stock</button>
                        )}
                        {isAdmin && (
                          <>
                            <button className="btn btn-ghost btn-sm" onClick={() => openEditar(p)}>✎ Editar</button>
                            <button className="btn btn-danger btn-sm" onClick={() => openDelete(p)}>✕</button>
                          </>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(modal === 'crear' || modal === 'editar') && (
        <Modal title={modal === 'crear' ? 'Nuevo Producto' : 'Editar Producto'} onClose={() => setModal(null)}>
          <form onSubmit={handleGuardar}>
            <div className="form-group">
              <label className="label">Nombre</label>
              <input className="input" value={form.nombre} onChange={e => set('nombre', e.target.value)} required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="label">Precio</label>
                <input className="input" type="number" step="0.01" min="0.01" value={form.precio} onChange={e => set('precio', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="label">Stock inicial</label>
                <input className="input" type="number" min="0" value={form.stock} onChange={e => set('stock', e.target.value)} required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="label">Categoría</label>
                <select className="input" value={form.categoriaId} onChange={e => set('categoriaId', e.target.value)} required>
                  <option value="">Seleccionar…</option>
                  {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="label">Proveedor</label>
                <select className="input" value={form.proveedorId} onChange={e => set('proveedorId', e.target.value)} required>
                  <option value="">Seleccionar…</option>
                  {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
              <button type="button" className="btn btn-ghost" onClick={() => setModal(null)}>Cancelar</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? <span className="spinner" /> : modal === 'crear' ? 'Crear' : 'Guardar'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {modal === 'stock' && (
        <Modal title={`Ajustar Stock — ${form.nombre}`} onClose={() => setModal(null)}>
          <div style={{ marginBottom: 16 }}>
            <p style={{ color: 'var(--text2)', fontSize: '0.9rem' }}>
              Stock actual: <strong style={{ color: 'var(--accent)' }}>{form.stock} unidades</strong>
            </p>
            <p style={{ color: 'var(--text3)', fontSize: '0.82rem', marginTop: 4 }}>
              Usa valores positivos para aumentar, negativos para restar.
            </p>
          </div>
          <form onSubmit={handleStock}>
            <div className="form-group">
              <label className="label">Cantidad a ajustar (ej: +10 o -3)</label>
              <input
                className="input"
                type="number"
                value={ajuste}
                onChange={e => setAjuste(e.target.value)}
                placeholder="ej: 20 o -5"
                required
              />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-ghost" onClick={() => setModal(null)}>Cancelar</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? <span className="spinner" /> : 'Aplicar ajuste'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {modal === 'delete' && (
        <Modal title="Eliminar Producto" onClose={() => setModal(null)}>
          <p style={{ color: 'var(--text2)', marginBottom: 20 }}>
            ¿Seguro que deseas eliminar <strong style={{ color: 'var(--text)' }}>{form.nombre}</strong>? Esta acción no se puede deshacer.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancelar</button>
            <button className="btn btn-danger" style={{ background: 'var(--red)', color: '#fff' }} onClick={handleDelete} disabled={saving}>
              {saving ? <span className="spinner" /> : 'Eliminar'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
