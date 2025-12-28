import axios from 'axios';

axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Interceptor para agregar token automáticamente
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  registro: (datos) => axios.post('/auth/registro', datos),
  login: (datos) => axios.post('/auth/login', datos),
  perfil: () => axios.get('/auth/perfil'),
  obtenerPerfil: () => axios.get('/auth/perfil') // ✅ AGREGADO para compatibilidad
};

// Cursos
export const cursosAPI = {
  obtenerTodos: (params) => axios.get('/cursos', { params }),
  obtenerPorId: (id) => axios.get(`/cursos/${id}`),
  crear: (datos) => axios.post('/cursos', datos),
  actualizar: (id, datos) => axios.put(`/cursos/${id}`, datos), // Cambiado a PUT
  eliminar: (id) => axios.delete(`/cursos/${id}`),
  obtenerCategorias: () => axios.get('/cursos/meta/categorias'),
  obtenerNiveles: () => axios.get('/cursos/meta/niveles'),
  
  // 🎥 REPRODUCTOR DE VIDEOS
  obtenerParaAprender: (id) => axios.get(`/cursos/${id}/aprender`),
  marcarVideoVisto: (cursoId, temaId) => axios.post(`/cursos/${cursoId}/marcar-visto`, { temaId }),
  desmarcarVideoVisto: (cursoId, temaId) => axios.post(`/cursos/${cursoId}/desmarcar-visto`, { temaId })
};

// Pagos Manuales
export const pagosAPI = {
  crearOrdenManual: (datos) => axios.post('/pagos-manual/crear-orden-manual', datos),
  subirComprobante: (compraId, formData) => axios.post(`/pagos-manual/subir-comprobante/${compraId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  misCompras: () => axios.get('/pagos-manual/mis-compras'),
  obtenerCompra: (id) => axios.get(`/pagos-manual/compra/${id}`)
};

// Admin
export const adminAPI = {
  obtenerDashboard: () => axios.get('/admin/dashboard'),
  obtenerTodosCursos: () => axios.get('/admin/cursos'),
  obtenerUsuarios: () => axios.get('/admin/usuarios'),
  cambiarRol: (usuarioId, rol) => axios.put(`/admin/usuario/${usuarioId}/rol`, { rol }),
  obtenerComprasPendientes: () => axios.get('/admin/compras-pendientes'),
  aprobarPago: (compraId) => axios.post(`/admin/aprobar-pago/${compraId}`),
  rechazarPago: (compraId, motivo) => axios.post(`/admin/rechazar-pago/${compraId}`, { motivo })
};

export default axios;
