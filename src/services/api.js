import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const BASE_URL = API_URL.replace('/api', ''); // ✅ URL base sin /api para archivos estáticos

axios.defaults.baseURL = API_URL;

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
  obtenerPerfil: () => axios.get('/auth/perfil'),
  verificarEmail: (token) => axios.get(`/auth/verificar-email/${token}`), // ← AGREGADO
  recuperarContraseña: (email) => axios.post('/auth/recuperar-contraseña', { email }), // ← AGREGADO
  restablecerContraseña: (token, password) => axios.post(`/auth/restablecer-contraseña/${token}`, { password }) // ← AGREGADO
};

// Cursos
export const cursosAPI = {
  obtenerTodos: (params) => axios.get('/cursos', { params }),
  obtenerPorId: (id) => axios.get(`/cursos/${id}`),
  crear: (datos) => axios.post('/cursos', datos),
  actualizar: (id, datos) => axios.put(`/cursos/${id}`, datos),
  eliminar: (id) => axios.delete(`/cursos/${id}`),
  obtenerCategorias: () => axios.get('/cursos/meta/categorias'),
  obtenerNiveles: () => axios.get('/cursos/meta/niveles'),
obtenerCertificado: (id) => axios.get(`/cursos/${id}/certificado`),
  
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
  rechazarPago: (compraId, motivo) => axios.post(`/admin/rechazar-pago/${compraId}`, { motivo }),
  
  // 🆕 Gestión de usuarios
  editarUsuario: (usuarioId, datos) => axios.put(`/admin/usuario/${usuarioId}`, datos),
  eliminarUsuario: (usuarioId) => axios.delete(`/admin/usuario/${usuarioId}`),
  quitarCursoUsuario: (usuarioId, cursoId) => axios.delete(`/admin/usuario/${usuarioId}/curso/${cursoId}`),
  
  // 🆕 Gestión de compras/ventas
  obtenerTodasCompras: (params) => axios.get('/admin/todas-compras', { params }),
  actualizarEstadoCompra: (compraId, datos) => axios.put(`/admin/compra/${compraId}/estado`, datos),
  eliminarCompra: (compraId) => axios.delete(`/admin/compra/${compraId}`),
  
  // 🔔 Notificaciones
  obtenerContadorNotificaciones: () => axios.get('/admin/notificaciones/contador')
};


export default axios;
