import { useEffect, useState } from 'react'
import { proveedoresApi } from '../services/api'
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

const emptyForm = { id: 0, nombre: '', contacto: '' }

export default function Proveedores() {
  const { isAdmin } = useAuth()
  const { success, error } = useToast()
  const [proveedores, setProveedores] = useState([])
  const [loading, setLoading]         = useState(true)
  const [buscar, setBuscar]           = useState('')
  const [modal, setModal]             = useState(null)
  const [form, setForm]               = useState(emptyForm)
  const [saving, setSaving]           = useState(false)

  async function load() {
    try {
      setProveedores(await proveedoresApi.getAll())
    } catch {
      error('Error cargando proveedores')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const openCrear  = ()  => { setForm(emptyForm); setModal('form') }
  const openEditar = (p) => { setForm({ id: p.id, nombre: p.nombre, contacto: p.contacto || '' }); setModal('form') }
  const openDelete = (p) => { setForm(p); setModal('delete') }

  const handleGuardar = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (form.id === 0) {
        await proveedoresApi.create({ nombre: form.nombre, contacto: form.contacto })
        success('Proveedor creado')
      } else {
        await proveedoresApi.update(form.id, { nombre: form.nombre, contacto: form.contacto })
        success('Proveedor actualizado')
      }
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
      await proveedoresApi.delete(form.id)
      success('Proveedor eliminado')
      setModal(null)
      load()
    } catch (e) {
      error(e.message)
    } finally {
      setSaving(false)
    }
  }

  const filtrados = proveedores.filter(p =>
    p.nombre.toLowerCase().includes(buscar.toLowerCase()) ||
    (p.contacto || '').toLowerCase().includes(buscar.toLowerCase())
  )

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Proveedores</h1>
          <div className="page-subtitle">{proveedores.length} proveedores registrados</div>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={openCrear}>+ Nuevo proveedor</button>
        )}
      </div>

      <div className="search-bar">
        <input
          className="input"
          placeholder="Buscar proveedor…"
          value={buscar}
          onChange={e => setBuscar(e.target.value)}
        />
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
          <span className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
        </div>
      ) : filtrados.length === 0 ? (
        <div className="empty-state">
          <div className="icon">⊟</div>
          <p>No se encontraron proveedores</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Nombre</th>
                <th>Contacto</th>
                {isAdmin && <th>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {filtrados.map(p => (
                <tr key={p.id}>
                  <td><span className="chip">#{p.id}</span></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="prov-avatar">{p.nombre[0].toUpperCase()}</div>
                      <strong>{p.nombre}</strong>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text2)' }}>{p.contacto || <span style={{ color: 'var(--text3)' }}>Sin contacto</span>}</td>
                  {isAdmin && (
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEditar(p)}>✎ Editar</button>
                        <button className="btn btn-danger btn-sm" onClick={() => openDelete(p)}>✕</button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal === 'form' && (
        <Modal title={form.id === 0 ? 'Nuevo Proveedor' : 'Editar Proveedor'} onClose={() => setModal(null)}>
          <form onSubmit={handleGuardar}>
            <div className="form-group">
              <label className="label">Nombre del proveedor</label>
              <input className="input" value={form.nombre} onChange={e => set('nombre', e.target.value)} placeholder="ej: Distribuidora García" required />
            </div>
            <div className="form-group">
              <label className="label">Contacto (opcional)</label>
              <input className="input" value={form.contacto} onChange={e => set('contacto', e.target.value)} placeholder="teléfono, email o nombre…" />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-ghost" onClick={() => setModal(null)}>Cancelar</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? <span className="spinner" /> : form.id === 0 ? 'Crear' : 'Guardar'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {modal === 'delete' && (
        <Modal title="Eliminar Proveedor" onClose={() => setModal(null)}>
          <p style={{ color: 'var(--text2)', marginBottom: 20 }}>
            ¿Eliminar el proveedor <strong style={{ color: 'var(--text)' }}>{form.nombre}</strong>? Los productos asociados podrían verse afectados.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancelar</button>
            <button className="btn btn-danger" style={{ background: 'var(--red)', color: '#fff' }} onClick={handleDelete} disabled={saving}>
              {saving ? <span className="spinner" /> : 'Eliminar'}
            </button>
          </div>
        </Modal>
      )}

      <style>{`
        .prov-avatar {
          width: 30px; height: 30px;
          border-radius: 50%;
          background: rgba(76,175,130,0.15);
          border: 1px solid rgba(76,175,130,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 0.8rem;
          color: var(--green);
          flex-shrink: 0;
        }
      `}</style>
    </div>
  )
}
