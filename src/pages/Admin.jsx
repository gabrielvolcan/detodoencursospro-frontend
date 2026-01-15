import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  DollarSign, Users, BookOpen, TrendingUp, Plus, Edit2, Trash2, Eye, X, ShoppingCart, Bell,
  Globe, CreditCard, BarChart3, TrendingDown, Activity, Mail
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
  const [modalEditarPrecios, setModalEditarPrecios] = useState(null);
  
  // 🔔 Sistema de notificaciones
  const { contador, hayNuevas, marcarComoVistas, verificarNotificaciones } = useNotificaciones(true);
  const [mostrarToast, setMostrarToast] = useState(false);

  // 📊 Datos calculados para dashboard
  const [ventasPorPais, setVentasPorPais] = useState([]);
  const [metodosPago, setMetodosPago] = useState([]);
  const [cursosIngresos, setCursosIngresos] = useState([]);
  const [ventasUltimos7Dias, setVentasUltimos7Dias] = useState([]);

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
      
      // Calcular métricas adicionales
      calcularVentasPorPais(statsRes.data.ultimasVentas || []);
      calcularMetodosPago(statsRes.data.ultimasVentas || []);
      calcularCursosIngresos(statsRes.data.ultimasVentas || [], cursosRes.data);
      calcularVentasUltimos7Dias(statsRes.data.ultimasVentas || []);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setCargando(false);
    }
  };

  // 🌎 Calcular ventas por país
  const calcularVentasPorPais = (ventas) => {
    const paisesMap = {};
    let totalVentas = 0;

    ventas.forEach(venta => {
      if (venta.estadoPago === 'aprobado') {
        const pais = venta.metodoPago?.pais || venta.usuario?.pais || 'Internacional';
        paisesMap[pais] = (paisesMap[pais] || 0) + venta.total;
        totalVentas += venta.total;
      }
    });

    const paisesArray = Object.entries(paisesMap).map(([pais, total]) => ({
      pais,
      total,
      porcentaje: totalVentas > 0 ? ((total / totalVentas) * 100).toFixed(1) : 0,
      bandera: obtenerBandera(pais)
    }));

    paisesArray.sort((a, b) => b.total - a.total);
    setVentasPorPais(paisesArray.slice(0, 6));
  };

  // 🏴 Obtener emoji de bandera
  const obtenerBandera = (pais) => {
    const banderas = {
      'Argentina': '🇦🇷',
      'Peru': '🇵🇪',
      'Perú': '🇵🇪',
      'Chile': '🇨🇱',
      'Uruguay': '🇺🇾',
      'Venezuela': '🇻🇪',
      'Colombia': '🇨🇴',
      'México': '🇲🇽',
      'Mexico': '🇲🇽',
      'Internacional': '🌍'
    };
    return banderas[pais] || '🌍';
  };

  // 💳 Calcular métodos de pago más usados
  const calcularMetodosPago = (ventas) => {
    const metodosMap = {};

    ventas.forEach(venta => {
      if (venta.estadoPago === 'aprobado') {
        const metodo = venta.metodoPago?.nombre || 'Otro';
        metodosMap[metodo] = (metodosMap[metodo] || 0) + 1;
      }
    });

    const metodosArray = Object.entries(metodosMap).map(([metodo, cantidad]) => ({
      metodo,
      cantidad
    }));

    metodosArray.sort((a, b) => b.cantidad - a.cantidad);
    setMetodosPago(metodosArray.slice(0, 5));
  };

  // 💰 Calcular top cursos por ingresos
  const calcularCursosIngresos = (ventas, cursos) => {
    const ingresosMap = {};

    ventas.forEach(venta => {
      if (venta.estadoPago === 'aprobado') {
        venta.cursos.forEach(item => {
          const cursoId = item.curso?._id || item.curso;
          ingresosMap[cursoId] = (ingresosMap[cursoId] || 0) + item.precio;
        });
      }
    });

    const cursosConIngresos = cursos.map(curso => ({
      ...curso,
      ingresos: ingresosMap[curso._id] || 0
    }));

    cursosConIngresos.sort((a, b) => b.ingresos - a.ingresos);
    setCursosIngresos(cursosConIngresos.slice(0, 5));
  };

  // 📈 Calcular ventas últimos 7 días
  const calcularVentasUltimos7Dias = (ventas) => {
    const hoy = new Date();
    const ultimos7Dias = [];

    for (let i = 6; i >= 0; i--) {
      const fecha = new Date(hoy);
      fecha.setDate(fecha.getDate() - i);
      const fechaStr = fecha.toISOString().split('T')[0];
      
      const ventasDia = ventas.filter(v => {
        if (v.estadoPago !== 'aprobado') return false;
        const ventaFecha = new Date(v.createdAt).toISOString().split('T')[0];
        return ventaFecha === fechaStr;
      });

      const totalDia = ventasDia.reduce((sum, v) => sum + v.total, 0);

      ultimos7Dias.push({
        fecha: fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
        total: totalDia,
        cantidad: ventasDia.length
      });
    }

    setVentasUltimos7Dias(ultimos7Dias);
  };

  // 💵 Calcular ticket promedio
  const calcularTicketPromedio = () => {
    if (!estadisticas?.ultimasVentas) return 0;
    const ventasAprobadas = estadisticas.ultimasVentas.filter(v => v.estadoPago === 'aprobado');
    if (ventasAprobadas.length === 0) return 0;
    const total = ventasAprobadas.reduce((sum, v) => sum + v.total, 0);
    return (total / ventasAprobadas.length).toFixed(2);
  };

  // 📊 Calcular tasa de conversión (simplificada)
  const calcularTasaConversion = () => {
    if (!estadisticas) return 0;
    const ventasAprobadas = estadisticas.estadisticas?.ventasCompletadas || 0;
    const totalUsuarios = estadisticas.estadisticas?.totalUsuarios || 1;
    return ((ventasAprobadas / totalUsuarios) * 100).toFixed(1);
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

  const guardarPrecios = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const precios = {
      internacional: { monto: parseFloat(formData.get('precio_internacional')), moneda: 'USD' },
      peru: { monto: parseFloat(formData.get('precio_peru')), moneda: 'PEN' },
      chile: { monto: parseFloat(formData.get('precio_chile')), moneda: 'CLP' },
      argentina: { monto: parseFloat(formData.get('precio_argentina')), moneda: 'ARS' },
      uruguay: { monto: parseFloat(formData.get('precio_uruguay')), moneda: 'UYU' },
      venezuela: { monto: parseFloat(formData.get('precio_venezuela')), moneda: 'VES' }
    };

    const datos = {
      precioUSD: parseFloat(formData.get('precio_internacional')),
      precios
    };

    try {
      await cursosAPI.actualizar(modalEditarPrecios._id, datos);
      await cargarDatos();
      setModalEditarPrecios(null);
      alert('✅ Precios actualizados exitosamente');
    } catch (error) {
      console.error('Error actualizando precios:', error);
      alert('Error al actualizar precios');
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
        {/* 🔔 Toast de nuevas notificaciones */}
        {mostrarToast && (
          <div className="toast-notificacion">
            <Bell size={20} />
            <span>¡Tienes {contador} pago(s) pendiente(s) por revisar!</span>
            <button onClick={() => {
              setVista('pagos');
              marcarComoVistas();
              setMostrarToast(false);
            }}>
              Ver ahora
            </button>
          </div>
        )}

        {/* ========================================
            VISTA: DASHBOARD ✅ CORREGIDO
        ======================================== */}
        {vista === 'dashboard' && estadisticas && (
          <div className="admin-dashboard">
            <div className="dashboard-header">
              <h1>Dashboard</h1>
              
              {/* 🆕 BOTÓN EMAIL MASIVO */}
              <button 
                onClick={() => navigate('/admin/email-masivo')} 
                className="btn-email-masivo"
              >
                <Mail size={20} />
                Email Masivo
              </button>
            </div>

            {/* Estadísticas principales - CON VALIDACIÓN ✅ */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #00ff88 0%, #00cc6e 100%)' }}>
                  <DollarSign size={24} />
                </div>
                <div className="stat-info">
                  <span className="stat-label">Ingresos Totales</span>
                  <span className="stat-value">
                    ${(estadisticas?.estadisticas?.ingresosCompletados || 0).toLocaleString()}
                  </span>
                  <span className="stat-meta">
                    <TrendingUp size={14} />
                    +{estadisticas?.estadisticas?.ventasCompletadas || 0} ventas
                  </span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                  <Users size={24} />
                </div>
                <div className="stat-info">
                  <span className="stat-label">Total Usuarios</span>
                  <span className="stat-value">{estadisticas?.estadisticas?.totalUsuarios || 0}</span>
                  <span className="stat-meta">
                    <Activity size={14} />
                    {calcularTasaConversion()}% conversión
                  </span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                  <BookOpen size={24} />
                </div>
                <div className="stat-info">
                  <span className="stat-label">Cursos Activos</span>
                  <span className="stat-value">{estadisticas?.estadisticas?.totalCursos || 0}</span>
                  <span className="stat-meta">
                    <Globe size={14} />
                    Plataforma activa
                  </span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' }}>
                  <CreditCard size={24} />
                </div>
                <div className="stat-info">
                  <span className="stat-label">Ticket Promedio</span>
                  <span className="stat-value">${calcularTicketPromedio()}</span>
                  <span className="stat-meta">
                    <BarChart3 size={14} />
                    Por transacción
                  </span>
                </div>
              </div>
            </div>

            {/* Gráfico de ventas últimos 7 días */}
            {ventasUltimos7Dias.length > 0 && (
              <div className="ventas-chart">
                <h3>📈 Ventas Últimos 7 Días</h3>
                <div className="chart-bars">
                  {ventasUltimos7Dias.map((dia, idx) => {
                    const maxTotal = Math.max(...ventasUltimos7Dias.map(d => d.total), 1);
                    return (
                      <div key={idx} className="chart-bar-container">
                        <div 
                          className="chart-bar" 
                          style={{ 
                            height: `${(dia.total / maxTotal) * 100}%`,
                            minHeight: dia.total > 0 ? '20px' : '5px'
                          }}
                        >
                          <span className="bar-value">${dia.total}</span>
                        </div>
                        <span className="bar-label">{dia.fecha}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Ventas por país */}
            {ventasPorPais.length > 0 && (
              <div className="section-grid">
                <div className="paises-section">
                  <h3>🌍 Ventas por País</h3>
                  <div className="paises-list">
                    {ventasPorPais.map((item, idx) => (
                      <div key={idx} className="pais-item">
                        <span className="pais-bandera">{item.bandera}</span>
                        <div className="pais-info">
                          <span className="pais-nombre">{item.pais}</span>
                          <div className="pais-barra">
                            <div 
                              className="pais-progreso" 
                              style={{ width: `${item.porcentaje}%` }}
                            ></div>
                          </div>
                        </div>
                        <span className="pais-total">${item.total.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Métodos de pago */}
                {metodosPago.length > 0 && (
                  <div className="metodos-section">
                    <h3>💳 Métodos de Pago</h3>
                    <div className="metodos-list">
                      {metodosPago.map((item, idx) => (
                        <div key={idx} className="metodo-item">
                          <span className="metodo-nombre">{item.metodo}</span>
                          <span className="metodo-cantidad">{item.cantidad} ventas</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Top cursos por ingresos */}
            {cursosIngresos.length > 0 && (
              <div className="top-cursos-section">
                <h3>🏆 Top Cursos por Ingresos</h3>
                <div className="top-cursos-list">
                  {cursosIngresos.filter(c => c.ingresos > 0).slice(0, 5).map((curso, idx) => (
                    <div key={curso._id} className="top-curso-item">
                      <span className="curso-ranking">#{idx + 1}</span>
                      <div className="curso-info-top">
                        <span className="curso-titulo-top">{curso.titulo}</span>
                        <span className="curso-categoria">{curso.categoria}</span>
                      </div>
                      <span className="curso-ingresos">${curso.ingresos.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================
            VISTA: GESTIÓN DE CURSOS
        ======================================== */}
        {vista === 'cursos' && (
          <div className="admin-cursos">
            <div className="cursos-header">
              <h1>Gestión de Cursos</h1>
              <button onClick={() => navigate('/admin/curso/nuevo')} className="btn-nuevo">
                <Plus size={20} />
                Nuevo Curso
              </button>
            </div>

            <div className="cursos-grid">
              {cursos.map(curso => (
                <div key={curso._id} className="curso-card-admin">
                  {curso.imagenPortada && (
                    <img 
                      src={`${BASE_URL}${curso.imagenPortada}`} 
                      alt={curso.titulo}
                      className="curso-img-admin"
                    />
                  )}
                  <div className="curso-info-admin">
                    <h3>{curso.titulo}</h3>
                    <p className="curso-categoria">{curso.categoria} • {curso.nivel}</p>
                    <p className="curso-precio">${curso.precioUSD}</p>
                    <div className="curso-acciones">
                      <button onClick={() => navigate(`/curso/${curso._id}`)} className="btn-ver">
                        <Eye size={18} />
                        Ver
                      </button>
                      <button onClick={() => navigate(`/admin/curso/${curso._id}/editar`)} className="btn-editar">
                        <Edit2 size={18} />
                        Editar
                      </button>
                      <button onClick={() => setModalEditarPrecios(curso)} className="btn-precios">
                        <DollarSign size={18} />
                        Precios
                      </button>
                      <button onClick={() => eliminarCurso(curso._id)} className="btn-eliminar">
                        <Trash2 size={18} />
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================
            VISTA: USUARIOS
        ======================================== */}
        {vista === 'usuarios' && (
          <div className="admin-usuarios">
            <h1>Gestión de Usuarios ({usuarios.length})</h1>
            
            <div className="usuarios-tabla-container">
              <table className="usuarios-tabla">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Rol</th>
                    <th>País</th>
                    <th>Cursos</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map(usuario => (
                    <tr key={usuario._id}>
                      <td>{usuario.nombre}</td>
                      <td>{usuario.email}</td>
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
                      <td>{usuario.pais || 'N/A'}</td>
                      <td>{usuario.cursosComprados?.length || 0}</td>
                      <td>
                        <div className="acciones-usuario">
                          <button 
                            onClick={() => setModalEditarUsuario(usuario)} 
                            className="btn-editar-small"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => eliminarUsuario(usuario._id)} 
                            className="btn-eliminar-small"
                          >
                            <Trash2 size={16} />
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

        {/* ========================================
            VISTA: PAGOS PENDIENTES
        ======================================== */}
        {vista === 'pagos' && (
          <div className="admin-pagos">
            <h1>Pagos Pendientes ({comprasPendientes.length})</h1>
            
            {comprasPendientes.length === 0 ? (
              <div className="sin-pendientes">
                <p>✅ No hay pagos pendientes</p>
              </div>
            ) : (
              <div className="compras-grid">
                {comprasPendientes.map(compra => (
                  <div key={compra._id} className="compra-card">
                    <div className="compra-header">
                      <span className="compra-id">#{compra._id.slice(-6)}</span>
                      <span className="compra-fecha">
                        {new Date(compra.createdAt).toLocaleDateString('es-ES')}
                      </span>
                    </div>

                    <div className="compra-usuario">
                      <strong>{compra.usuario?.nombre}</strong>
                      <span>{compra.usuario?.email}</span>
                    </div>

                    <div className="compra-detalles">
                      <p><strong>Total:</strong> ${compra.total}</p>
                      <p><strong>Método:</strong> {compra.metodoPago?.nombre}</p>
                      <p><strong>Cursos:</strong> {compra.cursos.length}</p>
                    </div>

                    {compra.comprobante && (
                      <a 
                        href={`${BASE_URL}${compra.comprobante}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn-ver-comprobante"
                      >
                        Ver Comprobante
                      </a>
                    )}

                    <div className="compra-acciones">
                      <button 
                        onClick={() => aprobarPago(compra._id)} 
                        className="btn-aprobar"
                      >
                        ✅ Aprobar
                      </button>
                      <button 
                        onClick={() => rechazarPago(compra._id)} 
                        className="btn-rechazar"
                      >
                        ❌ Rechazar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================
            VISTA: TODAS LAS VENTAS
        ======================================== */}
        {vista === 'ventas' && (
          <div className="admin-ventas">
            <div className="ventas-header">
              <h1>Todas las Ventas ({todasCompras.length})</h1>
              
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

            <div className="ventas-tabla-container">
              <table className="ventas-tabla">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Fecha</th>
                    <th>Usuario</th>
                    <th>Total</th>
                    <th>Método</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {todasCompras.map(compra => (
                    <tr key={compra._id}>
                      <td>#{compra._id.slice(-6)}</td>
                      <td>{new Date(compra.createdAt).toLocaleDateString('es-ES')}</td>
                      <td>{compra.usuario?.nombre}</td>
                      <td>${compra.total}</td>
                      <td>{compra.metodoPago?.nombre}</td>
                      <td>
                        <span className={`estado-badge ${compra.estadoPago}`}>
                          {compra.estadoPago}
                        </span>
                      </td>
                      <td>
                        <div className="acciones-venta">
                          <button 
                            onClick={() => setModalDetalleVenta(compra)} 
                            className="btn-ver-detalle"
                          >
                            <Eye size={16} />
                          </button>
                          {compra.estadoPago === 'pendiente' && (
                            <>
                              <button 
                                onClick={() => aprobarPago(compra._id)} 
                                className="btn-aprobar-small"
                              >
                                ✅
                              </button>
                              <button 
                                onClick={() => rechazarPago(compra._id)} 
                                className="btn-rechazar-small"
                              >
                                ❌
                              </button>
                            </>
                          )}
                          <button 
                            onClick={() => eliminarCompra(compra._id)} 
                            className="btn-eliminar-small"
                          >
                            <Trash2 size={16} />
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

        {/* ========================================
            MODALES
        ======================================== */}
        
        {/* Modal Editar Usuario */}
        {modalEditarUsuario && (
          <div className="modal-overlay" onClick={() => setModalEditarUsuario(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Editar Usuario</h2>
                <button onClick={() => setModalEditarUsuario(null)} className="btn-cerrar-modal">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={guardarEdicionUsuario} className="form-editar-usuario">
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
                    defaultValue={modalEditarUsuario.telefono || ''} 
                  />
                </div>

                <div className="form-group">
                  <label>País</label>
                  <input 
                    type="text" 
                    name="pais" 
                    defaultValue={modalEditarUsuario.pais || ''} 
                  />
                </div>

                <div className="modal-acciones">
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

        {/* Modal Detalle Venta */}
        {modalDetalleVenta && (
          <div className="modal-overlay" onClick={() => setModalDetalleVenta(null)}>
            <div className="modal-content modal-detalle" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Detalle de Venta #{modalDetalleVenta._id.slice(-6)}</h2>
                <button onClick={() => setModalDetalleVenta(null)} className="btn-cerrar-modal">
                  <X size={24} />
                </button>
              </div>

              <div className="detalle-venta-content">
                <div className="detalle-seccion">
                  <h3>Usuario</h3>
                  <p><strong>Nombre:</strong> {modalDetalleVenta.usuario?.nombre}</p>
                  <p><strong>Email:</strong> {modalDetalleVenta.usuario?.email}</p>
                  <p><strong>País:</strong> {modalDetalleVenta.usuario?.pais || 'N/A'}</p>
                </div>

                <div className="detalle-seccion">
                  <h3>Pago</h3>
                  <p><strong>Total:</strong> ${modalDetalleVenta.total}</p>
                  <p><strong>Método:</strong> {modalDetalleVenta.metodoPago?.nombre}</p>
                  <p><strong>Estado:</strong> <span className={`estado-badge ${modalDetalleVenta.estadoPago}`}>{modalDetalleVenta.estadoPago}</span></p>
                  <p><strong>Fecha:</strong> {new Date(modalDetalleVenta.createdAt).toLocaleString('es-ES')}</p>
                </div>

                <div className="detalle-seccion">
                  <h3>Cursos ({modalDetalleVenta.cursos.length})</h3>
                  <ul className="lista-cursos-detalle">
                    {modalDetalleVenta.cursos.map((item, idx) => (
                      <li key={idx}>
                        <span>{item.curso?.titulo || 'Curso eliminado'}</span>
                        <span>${item.precio}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {modalDetalleVenta.comprobante && (
                  <div className="detalle-seccion">
                    <h3>Comprobante</h3>
                    <a 
                      href={`${BASE_URL}${modalDetalleVenta.comprobante}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn-ver-comprobante-modal"
                    >
                      Ver Comprobante de Pago
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal Editar Precios */}
        {modalEditarPrecios && (
          <div className="modal-overlay" onClick={() => setModalEditarPrecios(null)}>
            <div className="modal-content modal-precios" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Editar Precios: {modalEditarPrecios.titulo}</h2>
                <button onClick={() => setModalEditarPrecios(null)} className="btn-cerrar-modal">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={guardarPrecios} className="form-editar-precios">
                <div className="precios-grid">
                  <div className="form-group">
                    <label>🌍 Internacional (USD)</label>
                    <input 
                      type="number" 
                      name="precio_internacional" 
                      defaultValue={modalEditarPrecios.precioUSD} 
                      step="0.01"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>🇵🇪 Perú (PEN)</label>
                    <input 
                      type="number" 
                      name="precio_peru" 
                      defaultValue={modalEditarPrecios.precios?.peru?.monto || 0} 
                      step="0.01"
                    />
                  </div>

                  <div className="form-group">
                    <label>🇨🇱 Chile (CLP)</label>
                    <input 
                      type="number" 
                      name="precio_chile" 
                      defaultValue={modalEditarPrecios.precios?.chile?.monto || 0} 
                      step="0.01"
                    />
                  </div>

                  <div className="form-group">
                    <label>🇦🇷 Argentina (ARS)</label>
                    <input 
                      type="number" 
                      name="precio_argentina" 
                      defaultValue={modalEditarPrecios.precios?.argentina?.monto || 0} 
                      step="0.01"
                    />
                  </div>

                  <div className="form-group">
                    <label>🇺🇾 Uruguay (UYU)</label>
                    <input 
                      type="number" 
                      name="precio_uruguay" 
                      defaultValue={modalEditarPrecios.precios?.uruguay?.monto || 0} 
                      step="0.01"
                    />
                  </div>

                  <div className="form-group">
                    <label>🇻🇪 Venezuela (VES)</label>
                    <input 
                      type="number" 
                      name="precio_venezuela" 
                      defaultValue={modalEditarPrecios.precios?.venezuela?.monto || 0} 
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="modal-acciones">
                  <button type="button" onClick={() => setModalEditarPrecios(null)} className="btn-cancelar">
                    Cancelar
                  </button>
                  <button type="submit" className="btn-guardar">
                    Guardar Precios
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;