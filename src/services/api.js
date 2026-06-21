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

// Interceptor para manejar errores de autenticación
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ========================================
// AUTH
// ========================================
export const authAPI = {
  registro: (datos) => axios.post('/auth/registro', datos),
  login: (datos) => axios.post('/auth/login', datos),
  perfil: () => axios.get('/auth/perfil'),
  obtenerPerfil: () => axios.get('/auth/perfil'),
  verificarEmail: (token) => axios.get(`/auth/verificar-email/${token}`),
  recuperarContrasena: (email) => axios.post('/auth/recuperar-contrasena', { email }),
  restablecerContrasena: (token, password) => axios.post(`/auth/restablecer-contrasena/${token}`, { password })
};

// ========================================
// CURSOS (Sistema actual - mantener)
// ========================================
export const cursosAPI = {
  obtenerTodos: (params) => axios.get('/cursos', { params }),
  obtenerPorId: (id) => axios.get(`/cursos/${id}`),
  crear: (datos) => axios.post('/cursos', datos),
  actualizar: (id, datos) => axios.put(`/cursos/${id}`, datos),
  eliminar: (id) => axios.delete(`/cursos/${id}`),
  obtenerCategorias: () => axios.get('/cursos/meta/categorias'),
  obtenerNiveles: () => axios.get('/cursos/meta/niveles'),
  obtenerCertificado: (id) => axios.get(`/cursos/${id}/certificado`),
  
  // 🆕 VERIFICAR CERTIFICADO (ruta pública)
  verificarCertificado: (codigo) => axios.get(`/cursos/verificar-certificado/${codigo}`),
  
  // 🎥 REPRODUCTOR DE VIDEOS
  obtenerParaAprender: (id) => axios.get(`/cursos/${id}/aprender`),
  marcarVideoVisto: (cursoId, temaId) => axios.post(`/cursos/${cursoId}/marcar-visto`, { temaId }),
  desmarcarVideoVisto: (cursoId, temaId) => axios.post(`/cursos/${cursoId}/desmarcar-visto`, { temaId }),

  // 🎁 INSCRIPCIÓN A CURSO GRATUITO
  inscripcionGratuita: (id) => axios.post(`/cursos/${id}/inscripcion-gratuita`)
};

// ========================================
// ✅ PRODUCTOS DIGITALES
// ========================================
export const productosAPI = {
  // Público
  obtenerTodos: (params) => axios.get('/productos', { params }),
  obtenerPorId: (id) => axios.get(`/productos/${id}`),
  
  // Descargas
  descargaGratuita: (id) => axios.post(`/productos/${id}/descarga-gratuita`),
  descargar: (id, archivoId) => axios.get(`/productos/${id}/archivos/${archivoId}/descargar`),

  // Admin
  obtenerTodosAdmin: () => axios.get('/productos/admin/todos'),
  obtenerPorIdAdmin: (id) => axios.get(`/productos/admin/${id}`),
  crear: (datos) => axios.post('/productos', datos),
  actualizar: (id, datos) => axios.put(`/productos/${id}`, datos),
  eliminar: (id) => axios.delete(`/productos/${id}`)
};

// ========================================
// PAGOS MANUALES
// ========================================
export const pagosAPI = {
  crearOrdenManual: (datos) => axios.post('/pagos-manual/crear-orden-manual', datos),
  subirComprobante: (compraId, formData) => axios.post(`/pagos-manual/subir-comprobante/${compraId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  misCompras: () => axios.get('/pagos-manual/mis-compras'),
  obtenerCompra: (id) => axios.get(`/pagos-manual/compra/${id}`)
};

// ========================================
// COMPROBANTES (endpoint autenticado)
// El backend ya NO sirve /uploads públicamente. El comprobante se obtiene
// SOLO vía GET /pagos-manual/comprobante/:compraId con Authorization Bearer.
// Como <img src> / <a href> no pueden enviar el header, descargamos el blob
// y devolvemos un object URL para usarlo como src o abrirlo con window.open.
// IMPORTANTE: quien llame debe liberar el object URL con URL.revokeObjectURL.
// ========================================
export const getComprobanteUrl = async (compraId) => {
  const { data } = await axios.get(`/pagos-manual/comprobante/${compraId}`, {
    responseType: 'blob'
  });
  return URL.createObjectURL(data);
};

// ========================================
// ADMIN
// ========================================
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

// ========================================
// EMAIL MASIVO
// ========================================
export const emailMasivoAPI = {
  enviar: (datos) => axios.post('/email-masivo/enviar', datos),
  previsualizar: (datos) => axios.post('/email-masivo/previsualizar', datos)
};

export default axios;
