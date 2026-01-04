import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  DollarSign, Users, BookOpen, TrendingUp, Plus, Edit2, Trash2, Eye, X, ShoppingCart, Bell
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { adminAPI, cursosAPI, BASE_URL } from '../services/api';
import { useNotificaciones } from '../hooks/useNotificaciones';
import './Admin.css';

const Admin = () => {
  const { esAdmin } = useAuth();
  const navigate = useNavigate();
  
  const [vista, setVista] = useState('dashboard');
  const [estadisticas, setEstadisticas] = useState(null);
  const [cursos, setCursos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [comprasPendientes, setComprasPendientes] = useState([]);
  const [todasCompras, setTodasCompras] = useState([]);
  const [filtroCompras, setFiltroCompras] = useState('todas');
  const [cargando, setCargando] = useState(true);
  
  // Modales
  const [modalEditarUsuario, setModalEditarUsuario] = useState(null);
  const [modalDetalleVenta, setModalDetalleVenta] = useState(null);
  
  // 🔔 Sistema de notificaciones
  const { contador, hayNuevas, marcarComoVistas, verificarNotificaciones } = useNotificaciones(true);
  const [mostrarToast, setMostrarToast] = useState(false);

  useEffect(() => {
    if (!esAdmin()) {
      navigate('/');
      return;
    }
    cargarDatos();
  }, []);

  useEffect(() => {
    if (vista === 'ventas') {
      cargarTodasCompras();
    }
  }, [vista, filtroCompras]);

  // 🔔 Mostrar toast cuando hay nuevas notificaciones
  useEffect(() => {
    if (hayNuevas && vista !== 'pagos') {
      setMostrarToast(true);
      setTimeout(() => setMostrarToast(false), 5000);
    }
  }, [hayNuevas, vista]);

  const cargarDatos = async () => {
    try {
      const [statsRes, cursosRes, usuariosRes, comprasRes] = await Promise.all([
        adminAPI.obtenerDashboard(),
        adminAPI.obtenerTodosCursos(),
        adminAPI.obtenerUsuarios(),
        adminAPI.obtenerComprasPendientes()
      ]);
      setEstadisticas(statsRes.data);
      setCursos(cursosRes.data);
      setUsuarios(usuariosRes.data);
      setComprasPendientes(comprasRes.data);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setCargando(false);
    }
  };

  const cargarTodasCompras = async () => {
    try {
      const params = {};
      if (filtroCompras !== 'todas') {
        params.estado = filtroCompras;
      }
      
      const { data } = await adminAPI.obtenerTodasCompras(params);
      setTodasCompras(data);
    } catch (error) {
      console.error('Error cargando compras:', error);
    }
  };

  const eliminarCurso = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este curso?')) return;
    
    try {
      await cursosAPI.eliminar(id);
      await cargarDatos();
      alert('Curso eliminado exitosamente');
    } catch (error) {
      console.error('Error eliminando curso:', error);
      alert('Error al eliminar el curso');
    }
  };

  const cambiarRol = async (usuarioId, nuevoRol) => {
    if (!confirm('¿Estás seguro de cambiar el rol de este usuario?')) return;
    
    try {
      await adminAPI.cambiarRol(usuarioId, nuevoRol);
      await cargarDatos();
      alert('Rol actualizado exitosamente');
    } catch (error) {
      console.error('Error cambiando rol:', error);
      alert('Error al cambiar el rol');
    }
  };

  const eliminarUsuario = async (usuarioId) => {
    if (!confirm('¿Eliminar este usuario? Esta acción no se puede deshacer.')) return;
    
    try {
      await adminAPI.eliminarUsuario(usuarioId);
      await cargarDatos();
      alert('✅ Usuario eliminado');
    } catch (error) {
      console.error('Error eliminando usuario:', error);
      alert('Error: ' + (error.response?.data?.error || error.message));
    }
  };

  const guardarEdicionUsuario = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const datos = {
      nombre: formData.get('nombre'),
      email: formData.get('email'),
      telefono: formData.get('telefono'),
      pais: formData.get('pais')
    };

    try {
      await adminAPI.editarUsuario(modalEditarUsuario._id, datos);
      await cargarDatos();
      setModalEditarUsuario(null);
      alert('✅ Usuario actualizado');
    } catch (error) {
      alert('Error al actualizar usuario');
    }
  };

  const aprobarPago = async (compraId) => {
    if (!confirm('¿Aprobar este pago? Se enviará email al usuario.')) return;
    
    try {
      await adminAPI.aprobarPago(compraId);
      await cargarDatos();
      if (vista === 'ventas') await cargarTodasCompras();
      alert('✅ Pago aprobado y email enviado');
    } catch (error) {
      console.error('Error aprobando pago:', error);
      alert('Error al aprobar el pago');
    }
  };

  const rechazarPago = async (compraId) => {
    const motivo = prompt('¿Motivo del rechazo?', 'Comprobante no válido');
    if (!motivo) return;
    
    try {
      await adminAPI.rechazarPago(compraId, motivo);
      await cargarDatos();
      if (vista === 'ventas') await cargarTodasCompras();
      alert('❌ Pago rechazado y usuario notificado');
    } catch (error) {
      console.error('Error rechazando pago:', error);
      alert('Error al rechazar el pago');
    }
  };

  const eliminarCompra = async (compraId) => {
    if (!confirm('¿Eliminar esta compra? Si estaba aprobada, se quitarán los cursos del usuario.')) return;
    
    try {
      await adminAPI.eliminarCompra(compraId);
      await cargarTodasCompras();
      await cargarDatos();
      alert('✅ Compra eliminada');
    } catch (error) {
      console.error('Error eliminando compra:', error);
      alert('Error al eliminar compra');
    }
  };

  if (cargando) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando panel admin...</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-sidebar">
        <h2>Panel Admin</h2>
        <nav className="admin-nav">
          <button 
            className={vista === 'dashboard' ? 'activo' : ''}
            onClick={() => setVista('dashboard')}
          >
            <TrendingUp size={18} />
            Dashboard
          </button>
          <button 
            className={vista === 'cursos' ? 'activo' : ''}
            onClick={() => setVista('cursos')}
          >
            <BookOpen size={18} />
            Gestión de Cursos
          </button>
          <button 
            className={vista === 'usuarios' ? 'activo' : ''}
            onClick={() => setVista('usuarios')}
          >
            <Users size={18} />
            Usuarios
          </button>
          <button 
            className={vista === 'pagos' ? 'activo' : ''}
            onClick={() => {
              setVista('pagos');
              marcarComoVistas();
            }}
          >
            <DollarSign size={18} />
            Pagos Pendientes
            {contador > 0 && (
              <span className={`badge-count ${hayNuevas ? 'badge-pulsante' : ''}`}>
                {contador}
              </span>
            )}
          </button>
          <button 
            className={vista === 'ventas' ? 'activo' : ''}
            onClick={() => setVista('ventas')}
          >
            <ShoppingCart size={18} />
            Todas las Ventas
          </button>
        </nav>
      </div>

      <div className="admin-content">
        {/* DASHBOARD */}
        {vista === 'dashboard' && (
          <div className="dashboard">
            <h1>Dashboard</h1>
            
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon" style={{background: 'linear-gradient(135deg, var(--acento) 0%, #00cc6e 100%)'}}>
                  <DollarSign size={32} />
                </div>
                <div className="stat-info">
                  <span className="stat-label">Ingresos Totales</span>
                  <span className="stat-value">${estadisticas?.estadisticas?.ingresosTotal?.toFixed(2) || 0}</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
                  <Users size={32} />
                </div>
                <div className="stat-info">
                  <span className="stat-label">Total Usuarios</span>
                  <span className="stat-value">{estadisticas?.estadisticas?.totalUsuarios || 0}</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon" style={{background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'}}>
                  <BookOpen size={32} />
                </div>
                <div className="stat-info">
                  <span className="stat-label">Total Cursos</span>
                  <span className="stat-value">{estadisticas?.estadisticas?.totalCursos || 0}</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon" style={{background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'}}>
                  <TrendingUp size={32} />
                </div>
                <div className="stat-info">
                  <span className="stat-label">Ventas Completadas</span>
                  <span className="stat-value">{estadisticas?.estadisticas?.ventasCompletadas || 0}</span>
                </div>
              </div>
            </div>

            <div className="dashboard-sections">
              <div className="section">
                <h2>Cursos Populares</h2>
                <div className="cursos-populares">
                  {estadisticas?.cursosPopulares?.map(curso => (
                    <div key={curso._id} className="curso-popular-item">
                      <img src={curso.imagen} alt={curso.titulo} />
                      <div>
                        <h4>{curso.titulo}</h4>
                        <p>{curso.estudiantes} estudiantes • ${curso.precio}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="section">
                <h2>Últimas Ventas</h2>
                <div className="ultimas-ventas">
                  {estadisticas?.ultimasVentas?.slice(0, 5).map(venta => (
                    <div key={venta._id} className="venta-item">
                      <div>
                        <strong>{venta.usuario?.nombre}</strong>
                        <p>{new Date(venta.createdAt).toLocaleDateString()}</p>
                      </div>
                      <span className="venta-total">${venta.total.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* GESTIÓN DE CURSOS */}
        {vista === 'cursos' && (
          <div className="gestion-cursos">
            <div className="cursos-header">
              <h1>Gestión de Cursos</h1>
              <button 
                className="btn-crear"
                onClick={() => navigate('/admin/curso/nuevo')}
              >
                <Plus size={20} />
                Crear Curso
              </button>
            </div>

            <div className="cursos-tabla">
              <table>
                <thead>
                  <tr>
                    <th>Curso</th>
                    <th>Categoría</th>
                    <th>Precio (USD)</th>
                    <th>Estudiantes</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {cursos.map(curso => (
                    <tr key={curso._id}>
                      <td>
                        <div className="curso-tabla-info">
                          <img src={curso.imagen} alt={curso.titulo} />
                          <div>
                            <strong>{curso.titulo}</strong>
                            <span>{curso.nivel}</span>
                          </div>
                        </div>
                      </td>
                      <td>{curso.categoria}</td>
                      <td>${curso.precioUSD || curso.precio || 0}</td>
                      <td>{curso.estudiantes || 0}</td>
                      <td>
                        <span className={`estado-badge ${curso.activo ? 'activo' : 'inactivo'}`}>
                          {curso.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td>
                        <div className="acciones">
                          <button 
                            className="btn-icon"
                            onClick={() => navigate(`/curso/${curso._id}`)}
                            title="Ver"
                          >
                            <Eye size={18} />
                          </button>
                          <button 
                            className="btn-icon"
                            onClick={() => navigate(`/admin/curso/${curso._id}/editar`)}
                            title="Editar"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button 
                            className="btn-icon eliminar"
                            onClick={() => eliminarCurso(curso._id)}
                            title="Eliminar"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* GESTIÓN DE USUARIOS */}
        {vista === 'usuarios' && (
          <div className="gestion-usuarios">
            <h1>Gestión de Usuarios</h1>

            <div className="usuarios-stats">
              <div className="stat-mini">
                <h3>{usuarios.length}</h3>
                <p>Total Usuarios</p>
              </div>
              <div className="stat-mini">
                <h3>{usuarios.filter(u => u.rol === 'admin').length}</h3>
                <p>Administradores</p>
              </div>
              <div className="stat-mini">
                <h3>{usuarios.filter(u => u.cursosComprados.length > 0).length}</h3>
                <p>Con Cursos</p>
              </div>
            </div>

            <div className="usuarios-tabla">
              <table>
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Email</th>
                    <th>Teléfono</th>
                    <th>Cursos Comprados</th>
                    <th>Rol</th>
                    <th>Registro</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map(usuario => (
                    <tr key={usuario._id}>
                      <td>
                        <div className="usuario-info">
                          <strong>{usuario.nombre}</strong>
                        </div>
                      </td>
                      <td>{usuario.email}</td>
                      <td>{usuario.telefono || '-'}</td>
                      <td>
                        <span className="badge-cursos">
                          {usuario.cursosComprados.length} cursos
                        </span>
                      </td>
                      <td>
                        <select 
                          value={usuario.rol}
                          onChange={(e) => cambiarRol(usuario._id, e.target.value)}
                          className="select-rol"
                        >
                          <option value="usuario">Usuario</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td>{new Date(usuario.createdAt).toLocaleDateString()}</td>
                      <td>
                        <span className={`estado-badge ${usuario.activo ? 'activo' : 'inactivo'}`}>
                          {usuario.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td>
                        <div className="acciones">
                          <button 
                            className="btn-icon"
                            onClick={() => setModalEditarUsuario(usuario)}
                            title="Editar"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button 
                            className="btn-icon eliminar"
                            onClick={() => eliminarUsuario(usuario._id)}
                            title="Eliminar"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PAGOS PENDIENTES */}
        {vista === 'pagos' && (
          <div className="gestion-pagos">
            <h1>Pagos Pendientes de Aprobación</h1>

            {comprasPendientes.length === 0 ? (
              <div className="sin-pendientes">
                <p>✅ No hay pagos pendientes por revisar</p>
              </div>
            ) : (
              <div className="pagos-lista">
                {comprasPendientes.map(compra => (
                  <div key={compra._id} className="pago-card">
                    <div className="pago-header">
                      <div>
                        <h3>{compra.usuario?.nombre}</h3>
                        <p>{compra.usuario?.email}</p>
                      </div>
                      <span className="pago-total">${compra.total.toFixed(2)} {compra.moneda}</span>
                    </div>

                    <div className="pago-detalles">
                      <p><strong>Método:</strong> {compra.metodoPago?.nombre}</p>
                      <p><strong>País:</strong> {compra.metodoPago?.pais}</p>
                      <p><strong>Fecha:</strong> {new Date(compra.createdAt).toLocaleString()}</p>
                      <p><strong>Estado:</strong> <span className="badge-estado">{compra.estadoPago}</span></p>
                    </div>

                    <div className="pago-cursos">
                      <strong>Cursos:</strong>
                      {compra.cursos.map(item => (
                        <div key={item._id} className="curso-mini">
                          • {item.curso?.titulo} - ${item.precio}
                        </div>
                      ))}
                    </div>

                    {compra.comprobante?.url && (
                      <div className="pago-comprobante">
                        <strong>Comprobante:</strong>
                        <a 
                          href={`${BASE_URL}${compra.comprobante.url}`} 
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-ver-comprobante"
                        >
                          📸 Ver Comprobante
                        </a>
                      </div>
                    )}

                    <div className="pago-acciones">
                      <button 
                        className="btn-aprobar"
                        onClick={() => aprobarPago(compra._id)}
                      >
                        ✓ Aprobar Pago
                      </button>
                      <button 
                        className="btn-rechazar"
                        onClick={() => rechazarPago(compra._id)}
                      >
                        ✗ Rechazar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TODAS LAS VENTAS */}
        {vista === 'ventas' && (
          <div className="gestion-ventas">
            <div className="ventas-header">
              <h1>Todas las Ventas</h1>
              <select 
                value={filtroCompras}
                onChange={(e) => setFiltroCompras(e.target.value)}
                className="filtro-ventas"
              >
                <option value="todas">Todas</option>
                <option value="aprobado">Aprobadas</option>
                <option value="pendiente">Pendientes</option>
                <option value="rechazado">Rechazadas</option>
              </select>
            </div>

            <div className="ventas-tabla">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Usuario</th>
                    <th>Total</th>
                    <th>Método</th>
                    <th>Fecha</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {todasCompras.map(compra => (
                    <tr key={compra._id}>
                      <td>#{compra._id.slice(-6)}</td>
                      <td>{compra.usuario?.nombre}</td>
                      <td>${compra.total.toFixed(2)} {compra.moneda}</td>
                      <td>{compra.metodoPago?.nombre}</td>
                      <td>{new Date(compra.createdAt).toLocaleDateString()}</td>
                      <td>
                        <span className={`estado-badge ${compra.estadoPago}`}>
                          {compra.estadoPago}
                        </span>
                      </td>
                      <td>
                        <div className="acciones">
                          <button 
                            className="btn-icon"
                            onClick={() => setModalDetalleVenta(compra)}
                            title="Ver detalles"
                          >
                            <Eye size={18} />
                          </button>
                          {compra.estadoPago === 'pendiente' && (
                            <button 
                              className="btn-icon"
                              onClick={() => aprobarPago(compra._id)}
                              title="Aprobar"
                            >
                              ✓
                            </button>
                          )}
                          <button 
                            className="btn-icon eliminar"
                            onClick={() => eliminarCompra(compra._id)}
                            title="Eliminar"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* MODAL EDITAR USUARIO */}
      {modalEditarUsuario && (
        <div className="modal-overlay" onClick={() => setModalEditarUsuario(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Editar Usuario</h2>
              <button onClick={() => setModalEditarUsuario(null)}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={guardarEdicionUsuario}>
              <div className="form-group">
                <label>Nombre</label>
                <input 
                  type="text" 
                  name="nombre" 
                  defaultValue={modalEditarUsuario.nombre} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input 
                  type="email" 
                  name="email" 
                  defaultValue={modalEditarUsuario.email} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Teléfono</label>
                <input 
                  type="text" 
                  name="telefono" 
                  defaultValue={modalEditarUsuario.telefono} 
                />
              </div>
              <div className="form-group">
                <label>País</label>
                <input 
                  type="text" 
                  name="pais" 
                  defaultValue={modalEditarUsuario.pais} 
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setModalEditarUsuario(null)} className="btn-cancelar">
                  Cancelar
                </button>
                <button type="submit" className="btn-guardar">
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DETALLE VENTA */}
      {modalDetalleVenta && (
        <div className="modal-overlay" onClick={() => setModalDetalleVenta(null)}>
          <div className="modal-content-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Detalle de Venta #{modalDetalleVenta._id.slice(-6)}</h2>
              <button onClick={() => setModalDetalleVenta(null)}>
                <X size={24} />
              </button>
            </div>
            <div className="detalle-venta">
              <div className="detalle-section">
                <h3>Cliente</h3>
                <p><strong>Nombre:</strong> {modalDetalleVenta.usuario?.nombre}</p>
                <p><strong>Email:</strong> {modalDetalleVenta.usuario?.email}</p>
                <p><strong>Teléfono:</strong> {modalDetalleVenta.usuario?.telefono}</p>
              </div>
              <div className="detalle-section">
                <h3>Pago</h3>
                <p><strong>Total:</strong> ${modalDetalleVenta.total.toFixed(2)} {modalDetalleVenta.moneda}</p>
                <p><strong>Método:</strong> {modalDetalleVenta.metodoPago?.nombre}</p>
                <p><strong>Estado:</strong> <span className={`estado-badge ${modalDetalleVenta.estadoPago}`}>{modalDetalleVenta.estadoPago}</span></p>
                <p><strong>Fecha:</strong> {new Date(modalDetalleVenta.createdAt).toLocaleString()}</p>
              </div>
              <div className="detalle-section">
                <h3>Cursos</h3>
                {modalDetalleVenta.cursos.map(item => (
                  <div key={item._id} className="curso-detalle">
                    <p>{item.curso?.titulo} - ${item.precio}</p>
                  </div>
                ))}
              </div>
              {modalDetalleVenta.comprobante?.url && (
                <div className="detalle-section">
                  <h3>Comprobante</h3>
                  <a 
                    href={`${BASE_URL}${modalDetalleVenta.comprobante.url}`} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-ver-comprobante"
                  >
                    📸 Ver Comprobante
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* 🔔 TOAST DE NOTIFICACIÓN */}
      {mostrarToast && (
        <div className="notification-toast">
          <Bell size={20} />
          <div className="toast-content">
            <strong>Nueva compra pendiente</strong>
            <p>Tienes {contador} {contador === 1 ? 'pago' : 'pagos'} pendiente{contador === 1 ? '' : 's'}</p>
          </div>
          <button 
            className="toast-btn"
            onClick={() => {
              setVista('pagos');
              setMostrarToast(false);
              marcarComoVistas();
            }}
          >
            Ver ahora
          </button>
          <button 
            className="toast-close"
            onClick={() => setMostrarToast(false)}
          >
            <X size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default Admin;