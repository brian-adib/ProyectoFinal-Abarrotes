const BASE = '/api'

function getToken() {
    return localStorage.getItem('token')
}

function headers(requireAuth = true) {
    const h = { 'Content-Type': 'application/json' }
    if (requireAuth) {
        const t = getToken()
        if (t) h['Authorization'] = `Bearer ${t}`
    }
    return h
}

// Extrae el array aunque venga como { $values: [...] }
function extract(data) {
    if (!data) return []
    if (Array.isArray(data)) return data
    if (data['$values']) return data['$values']
    return data
}

async function request(method, path, body = null, auth = true) {
    const opts = { method, headers: headers(auth) }
    if (body) opts.body = JSON.stringify(body)
    const res = await fetch(`${BASE}${path}`, opts)
    if (res.status === 204) return null
    const data = await res.json().catch(() => null)
    if (!res.ok) {
        const msg = typeof data === 'string' ? data : data?.mensaje || data?.title || `Error ${res.status}`
        throw new Error(msg)
    }
    return data
}

async function requestList(method, path, body = null, auth = true) {
    const data = await request(method, path, body, auth)
    return extract(data)
}

// Auth
export const authApi = {
    login: (dto) => request('POST', '/auth/login', dto, false),
    registro: (dto) => request('POST', '/auth/registro', dto, false),
}

// Productos
export const productosApi = {
    getAll: () => requestList('GET', '/productos'),
    getById: (id) => request('GET', `/productos/${id}`),
    getStockBajo: (min = 5) => requestList('GET', `/productos/stockbajo?minimo=${min}`),
    create: (data) => request('POST', '/productos', data),
    update: (id, data) => request('PUT', `/productos/${id}`, data),
    ajustarStock: (id, qty) => request('PATCH', `/productos/${id}/stock?cantidad=${qty}`),
    delete: (id) => request('DELETE', `/productos/${id}`),
}

// Categorias
export const categoriasApi = {
    getAll: () => requestList('GET', '/categorias', null, false),
    create: (data) => request('POST', '/categorias', data),
    update: (id, d) => request('PUT', `/categorias/${id}`, { id, ...d }),
    delete: (id) => request('DELETE', `/categorias/${id}`),
}

// Proveedores
export const proveedoresApi = {
    getAll: () => requestList('GET', '/proveedores', null, false),
    create: (data) => request('POST', '/proveedores', data),
    update: (id, d) => request('PUT', `/proveedores/${id}`, { id, ...d }),
    delete: (id) => request('DELETE', `/proveedores/${id}`),
}

// Ventas
export const ventasApi = {
    getAll: () => requestList('GET', '/ventas'),
    getById: (id) => request('GET', `/ventas/${id}`),
    create: (data) => request('POST', '/ventas', data),
    delete: (id) => request('DELETE', `/ventas/${id}`),
}
