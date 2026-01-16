import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  DollarSign, Users, BookOpen, TrendingUp, Plus, Edit2, Trash2, Eye, X, ShoppingCart, Bell,
  Globe, CreditCard, BarChart3, TrendingDown, Activity, Mail, Package  // ← AGREGADO Package
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
  className={vista === 'productos' ? 'activo' : ''}
  onClick={() => setVista('productos')}
>
  <Package size={18} />
  Gestión de Productos
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
        {/* ========================================
            🆕 DASHBOARD MEJORADO
        ======================================== */}
        {vista === 'dashboard' && (
          <div className="dashboard">
            <div className="dashboard-header-con-boton">
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
            
            {/* MÉTRICAS PRINCIPALES */}
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

              {/* 🆕 MÉTRICAS ADICIONALES */}
              <div className="stat-card">
                <div className="stat-icon" style={{background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'}}>
                  <Activity size={32} />
                </div>
                <div className="stat-info">
                  <span className="stat-label">Ticket Promedio</span>
                  <span className="stat-value">${calcularTicketPromedio()}</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon" style={{background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'}}>
                  <BarChart3 size={32} />
                </div>
                <div className="stat-info">
                  <span className="stat-label">Tasa de Conversión</span>
                  <span className="stat-value">{calcularTasaConversion()}%</span>
                </div>
              </div>
            </div>

            {/* 🆕 GRID DE 3 COLUMNAS */}
            <div className="dashboard-grid-mejorado">
              
              {/* 🌎 VENTAS POR PAÍS */}
              <div className="dashboard-card">
                <h2>
                  <Globe size={24} />
                  Ventas por País
                </h2>
                <div className="ventas-pais-lista">
                  {ventasPorPais.length > 0 ? (
                    ventasPorPais.map((item, index) => (
                      <div key={index} className="venta-pais-item">
                        <div className="pais-info">
                          <span className="bandera">{item.bandera}</span>
                          <span className="pais-nombre">{item.pais}</span>
                        </div>
                        <div className="pais-stats">
                          <span className="pais-total">${item.total.toFixed(2)}</span>
                          <span className="pais-porcentaje">{item.porcentaje}%</span>
                        </div>
                        <div className="pais-barra">
                          <div 
                            className="pais-barra-fill" 
                            style={{width: `${item.porcentaje}%`}}
                          ></div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="sin-datos">No hay ventas registradas aún</p>
                  )}
                </div>
              </div>

              {/* 📈 VENTAS ÚLTIMOS 7 DÍAS */}
              <div className="dashboard-card">
                <h2>
                  <TrendingUp size={24} />
                  Ventas Últimos 7 Días
                </h2>
                <div className="grafico-ventas">
                  {ventasUltimos7Dias.map((dia, index) => {
                    const maxTotal = Math.max(...ventasUltimos7Dias.map(d => d.total), 1);
                    const altura = (dia.total / maxTotal) * 100;
                    return (
                      <div key={index} className="dia-barra">
                        <div className="barra-container">
                          <div 
                            className="barra-fill" 
                            style={{height: `${altura}%`}}
                            title={`$${dia.total.toFixed(2)} (${dia.cantidad} ventas)`}
                          >
                            <span className="barra-valor">${dia.total.toFixed(0)}</span>
                          </div>
                        </div>
                        <span className="dia-label">{dia.fecha}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 💳 MÉTODOS DE PAGO */}
              <div className="dashboard-card">
                <h2>
                  <CreditCard size={24} />
                  Métodos de Pago
                </h2>
                <div className="metodos-pago-lista">
                  {metodosPago.length > 0 ? (
                    metodosPago.map((item, index) => (
                      <div key={index} className="metodo-item">
                        <span className="metodo-nombre">{item.metodo}</span>
                        <span className="metodo-cantidad">{item.cantidad} ventas</span>
                      </div>
                    ))
                  ) : (
                    <p className="sin-datos">No hay datos de métodos de pago</p>
                  )}
                </div>
              </div>
            </div>

            {/* SECCIONES INFERIORES */}
            <div className="dashboard-sections">
              
              {/* 💰 TOP CURSOS POR INGRESOS */}
              <div className="section">
                <h2>Top Cursos por Ingresos</h2>
                <div className="cursos-populares">
                  {cursosIngresos.length > 0 ? (
                    cursosIngresos.map(curso => (
                      <div key={curso._id} className="curso-popular-item">
                        <img src={curso.imagen} alt={curso.titulo} />
                        <div>
                          <h4>{curso.titulo}</h4>
                          <p>{curso.estudiantes || 0} estudiantes • <strong>${curso.ingresos.toFixed(2)} ingresos</strong></p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="sin-datos">No hay cursos con ventas aún</p>
                  )}
                </div>
              </div>

              {/* ÚLTIMAS VENTAS */}
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

      
        {/* (GESTIÓN DE CURSOS, USUARIOS, PAGOS, VENTAS) */}
        
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
                            onClick={() => setModalEditarPrecios(curso)}
                            title="Editar Precios"
                          >
                            <DollarSign size={18} />
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

        {/* GESTIÓN DE PRODUCTOS */}
{vista === 'productos' && (
  <div className="gestion-cursos">
    <div className="cursos-header">
      <h1>Gestión de Productos</h1>
      <button 
        className="btn-crear"
        onClick={() => navigate('/admin/producto/nuevo')}
      >
        <Plus size={20} />
        Crear Producto
      </button>
    </div>

    <div className="admin-info-box">
      <p>📦 Gestiona tus productos digitales: libros, ebooks, plantillas, software y más.</p>
      <p>Aquí aparecerá la lista de productos cuando crees el primero.</p>
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

        {/* TODAS LAS VENTAS - MEJORADO */}
        {vista === 'ventas' && (
          <div className="gestion-ventas">
            <div className="ventas-header-mejorado">
              <h1>Todas las Ventas</h1>
              <div className="filtros-ventas">
                <button 
                  className={`filtro-btn ${filtroCompras === 'todas' ? 'activo' : ''}`}
                  onClick={() => setFiltroCompras('todas')}
                >
                  Todas
                </button>
                <button 
                  className={`filtro-btn ${filtroCompras === 'aprobado' ? 'activo' : ''}`}
                  onClick={() => setFiltroCompras('aprobado')}
                >
                  ✓ Aprobadas
                </button>
                <button 
                  className={`filtro-btn ${filtroCompras === 'pendiente' ? 'activo' : ''}`}
                  onClick={() => setFiltroCompras('pendiente')}
                >
                  ⏱ Pendientes
                </button>
                <button 
                  className={`filtro-btn ${filtroCompras === 'rechazado' ? 'activo' : ''}`}
                  onClick={() => setFiltroCompras('rechazado')}
                >
                  ✗ Rechazadas
                </button>
              </div>
            </div>

            {/* ESTADÍSTICAS DE VENTAS */}
            <div className="ventas-stats-grid">
              <div className="venta-stat-card">
                <div className="stat-icono" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
                  <ShoppingCart size={24} />
                </div>
                <div className="stat-datos">
                  <span className="stat-numero">{todasCompras.length}</span>
                  <span className="stat-texto">Total Ventas</span>
                </div>
              </div>

              <div className="venta-stat-card">
                <div className="stat-icono" style={{background: 'linear-gradient(135deg, var(--acento) 0%, #00cc6e 100%)'}}>
                  <TrendingUp size={24} />
                </div>
                <div className="stat-datos">
                  <span className="stat-numero">{todasCompras.filter(c => c.estadoPago === 'aprobado').length}</span>
                  <span className="stat-texto">Aprobadas</span>
                </div>
              </div>

              <div className="venta-stat-card">
                <div className="stat-icono" style={{background: 'linear-gradient(135deg, #ffa500 0%, #ff8c00 100%)'}}>
                  <Activity size={24} />
                </div>
                <div className="stat-datos">
                  <span className="stat-numero">{todasCompras.filter(c => c.estadoPago === 'pendiente').length}</span>
                  <span className="stat-texto">Pendientes</span>
                </div>
              </div>

              <div className="venta-stat-card">
                <div className="stat-icono" style={{background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'}}>
                  <DollarSign size={24} />
                </div>
                <div className="stat-datos">
                  <span className="stat-numero">
                    ${todasCompras
                      .filter(c => c.estadoPago === 'aprobado')
                      .reduce((sum, c) => sum + c.total, 0)
                      .toFixed(2)}
                  </span>
                  <span className="stat-texto">Total Recaudado</span>
                </div>
              </div>
            </div>

            {/* TABLA DE VENTAS */}
            <div className="ventas-tabla-mejorada">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Usuario</th>
                    <th>Total</th>
                    <th>Método</th>
                    <th>País</th>
                    <th>Fecha</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {todasCompras.length > 0 ? (
                    todasCompras.map(compra => (
                      <tr key={compra._id} className={`fila-venta ${compra.estadoPago}`}>
                        <td>
                          <span className="venta-id">#{compra._id.slice(-6)}</span>
                        </td>
                        <td>
                          <div className="usuario-venta">
                            <strong>{compra.usuario?.nombre}</strong>
                            <span className="email-venta">{compra.usuario?.email}</span>
                          </div>
                        </td>
                        <td>
                          <span className="venta-monto">${compra.total.toFixed(2)} <span className="moneda">{compra.moneda}</span></span>
                        </td>
                        <td>
                          <span className="metodo-badge">{compra.metodoPago?.nombre}</span>
                        </td>
                        <td>
                          <span className="pais-badge">{obtenerBandera(compra.metodoPago?.pais || 'Internacional')} {compra.metodoPago?.pais || 'N/A'}</span>
                        </td>
                        <td>
                          <span className="fecha-venta">{new Date(compra.createdAt).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}</span>
                        </td>
                        <td>
                          <span className={`estado-badge-mejorado ${compra.estadoPago}`}>
                            {compra.estadoPago === 'aprobado' && '✓ Aprobado'}
                            {compra.estadoPago === 'pendiente' && '⏱ Pendiente'}
                            {compra.estadoPago === 'rechazado' && '✗ Rechazado'}
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
                                className="btn-icon aprobar"
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
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="sin-ventas">
                        <ShoppingCart size={48} />
                        <p>No hay ventas {filtroCompras !== 'todas' && `con estado "${filtroCompras}"`}</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* MODALES */}
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
      
      {modalEditarPrecios && (
        <div className="modal-overlay" onClick={() => setModalEditarPrecios(null)}>
          <div className="modal-content-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>💰 Editar Precios - {modalEditarPrecios.titulo}</h2>
              <button onClick={() => setModalEditarPrecios(null)}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={guardarPrecios}>
              <div className="precios-grid">
                <div className="form-group">
                  <label>🌍 Internacional (USD)</label>
                  <input 
                    type="number" 
                    name="precio_internacional" 
                    step="0.01"
                    defaultValue={modalEditarPrecios.precioUSD || modalEditarPrecios.precios?.internacional?.monto || 0}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>🇵🇪 Perú (PEN)</label>
                  <input 
                    type="number" 
                    name="precio_peru" 
                    step="0.01"
                    defaultValue={modalEditarPrecios.precios?.peru?.monto || 0}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>🇨🇱 Chile (CLP)</label>
                  <input 
                    type="number" 
                    name="precio_chile" 
                    step="1"
                    defaultValue={modalEditarPrecios.precios?.chile?.monto || 0}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>🇦🇷 Argentina (ARS)</label>
                  <input 
                    type="number" 
                    name="precio_argentina" 
                    step="1"
                    defaultValue={modalEditarPrecios.precios?.argentina?.monto || 0}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>🇺🇾 Uruguay (UYU)</label>
                  <input 
                    type="number" 
                    name="precio_uruguay" 
                    step="1"
                    defaultValue={modalEditarPrecios.precios?.uruguay?.monto || 0}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>🇻🇪 Venezuela (VES)</label>
                  <input 
                    type="number" 
                    name="precio_venezuela" 
                    step="1"
                    defaultValue={modalEditarPrecios.precios?.venezuela?.monto || 0}
                    required 
                  />
                </div>
              </div>
              <div className="precio-ayuda">
                <strong>💡 Tip:</strong> El precio USD se usa como base. Los demás se ajustan según cada país.
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setModalEditarPrecios(null)} className="btn-cancelar">
                  Cancelar
                </button>
                <button type="submit" className="btn-guardar">
                  💾 Guardar Precios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
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