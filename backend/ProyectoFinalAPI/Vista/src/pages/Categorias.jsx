import { useEffect, useState } from 'react'
import { categoriasApi } from '../services/api'
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

export default function Categorias() {
  const { isAdmin } = useAuth()
  const { success, error } = useToast()
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading]       = useState(true)
  const [modal, setModal]           = useState(null)
  const [form, setForm]             = useState({ id: 0, nombre: '' })
  const [saving, setSaving]         = useState(false)

  async function load() {
    try {
      setCategorias(await categoriasApi.getAll())
    } catch {
      error('Error cargando categorías')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const openCrear  = ()  => { setForm({ id: 0, nombre: '' }); setModal('form') }
  const openEditar = (c) => { setForm({ id: c.id, nombre: c.nombre }); setModal('form') }
  const openDelete = (c) => { setForm(c); setModal('delete') }

  const handleGuardar = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (form.id === 0) {
        await categoriasApi.create({ nombre: form.nombre })
        success('Categoría creada')
      } else {
        await categoriasApi.update(form.id, { nombre: form.nombre })
        success('Categoría actualizada')
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
      await categoriasApi.delete(form.id)
      success('Categoría eliminada')
      setModal(null)
      load()
    } catch (e) {
      error(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Categorías</h1>
          <div className="page-subtitle">{categorias.length} categorías registradas</div>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={openCrear}>+ Nueva categoría</button>
        )}
      </div>

      {!isAdmin && (
        <div style={{ marginBottom: 20, padding: '10px 16px', background: 'rgba(74,144,196,0.1)', border: '1px solid rgba(74,144,196,0.25)', borderRadius: 'var(--radius)', color: 'var(--blue)', fontSize: '0.875rem' }}>
          Solo los administradores pueden modificar categorías.
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
          <span className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
        </div>
      ) : categorias.length === 0 ? (
        <div className="empty-state">
          <div className="icon">⊞</div>
          <p>No hay categorías registradas</p>
        </div>
      ) : (
        <div className="cats-grid">
          {categorias.map(c => (
            <div key={c.id} className="cat-card card">
              <div className="cat-icon">⊞</div>
              <div className="cat-id"><span className="chip">#{c.id}</span></div>
              <div className="cat-nombre">{c.nombre}</div>
              {isAdmin && (
                <div className="cat-actions">
                  <button className="btn btn-ghost btn-sm" onClick={() => openEditar(c)}>✎ Editar</button>
                  <button className="btn btn-danger btn-sm" onClick={() => openDelete(c)}>✕ Eliminar</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {modal === 'form' && (
        <Modal title={form.id === 0 ? 'Nueva Categoría' : 'Editar Categoría'} onClose={() => setModal(null)}>
          <form onSubmit={handleGuardar}>
            <div className="form-group">
              <label className="label">Nombre de la categoría</label>
              <input
                className="input"
                value={form.nombre}
                onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                placeholder="ej: Lácteos, Bebidas, Snacks…"
                required
              />
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
        <Modal title="Eliminar Categoría" onClose={() => setModal(null)}>
          <p style={{ color: 'var(--text2)', marginBottom: 20 }}>
            ¿Eliminar la categoría <strong style={{ color: 'var(--text)' }}>{form.nombre}</strong>? Los productos en esta categoría podrían verse afectados.
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
        .cats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 16px;
        }
        .cat-card {
          display: flex;
          flex-direction: column;
          gap: 8px;
          transition: border-color 0.15s, transform 0.15s;
        }
        .cat-card:hover { border-color: var(--border2); transform: translateY(-2px); }
        .cat-icon { font-size: 1.6rem; color: var(--accent); }
        .cat-nombre { font-family: 'Syne', sans-serif; font-size: 1rem; font-weight: 700; flex: 1; }
        .cat-actions { display: flex; gap: 8px; margin-top: 4px; }
      `}</style>
    </div>
  )
}
