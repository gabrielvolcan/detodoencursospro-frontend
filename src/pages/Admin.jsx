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
            VISTA: DASHBOARD
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

            {/* Estadísticas principales */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #00ff88 0%, #00cc6e 100%)' }}>
                  <DollarSign size={24} />
                </div>
                <div className="stat-info">
                  <span className="stat-label">Ingresos Totales</span>
                  <span className="stat-value">${estadisticas.estadisticas.ingresosCompletados.toLocaleString()}</span>
                  <span className="stat-meta">
                    <TrendingUp size={14} />
                    +{estadisticas.estadisticas.ventasCompletadas} ventas
                  </span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                  <Users size={24} />
                </div>
                <div className="stat-info">
                  <span className="stat-label">Total Usuarios</span>
                  <span className="stat-value">{estadisticas.estadisticas.totalUsuarios}</span>
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
                  <span className="stat-value">{estadisticas.estadisticas.totalCursos}</span>
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

            {/* Resto del dashboard... (código que ya tienes) */}
          </div>
        )}

        {/* ========================================
            OTRAS VISTAS (cursos, usuarios, pagos, ventas)
        ======================================== */}
        {/* ... Tu código existente para las demás vistas ... */}

      </div>
    </div>
  );
};

export default Admin;