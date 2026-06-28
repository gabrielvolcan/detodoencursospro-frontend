import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, BookOpen, Package, Users, DollarSign, ShoppingCart, Bell, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { adminAPI, cursosAPI, getComprobanteUrl } from '../services/api';
import { useNotificaciones } from '../hooks/useNotificaciones';
import { useConfirm } from '../hooks/useConfirm';
import { useToast } from '../hooks/useToast';
import ToastContainer from '../components/ToastContainer';
import {
  calcularVentasPorPais, calcularMetodosPago, calcularCursosIngresos, serieGrafico,
} from '../utils/adminMetrics';
import './Admin.css';

import DashboardAdmin from './admin/DashboardAdmin';
import GestionCursos from './admin/GestionCursos';
import GestionProductos from './admin/GestionProductos';
import GestionUsuarios from './admin/GestionUsuarios';
import PagosPendientes from './admin/PagosPendientes';
import GestionVentas from './admin/GestionVentas';
import ModalEditarUsuario from './admin/components/ModalEditarUsuario';
import ModalDetalleVenta from './admin/components/ModalDetalleVenta';
import ModalEditarPrecios from './admin/components/ModalEditarPrecios';

const NAV = [
  { key: 'dashboard', label: 'Dashboard', icon: TrendingUp },
  { key: 'cursos', label: 'Gestión de Cursos', icon: BookOpen },
  { key: 'productos', label: 'Gestión de Productos', icon: Package },
  { key: 'usuarios', label: 'Usuarios', icon: Users },
];

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

  // Notificaciones
  const { contador, hayNuevas, marcarComoVistas } = useNotificaciones(true);
  const [mostrarToast, setMostrarToast] = useState(false);

  // Diálogos y toasts propios (reemplazan alert/confirm/prompt nativos)
  const { confirm, confirmUI } = useConfirm();
  const { toasts, showToast } = useToast();

  // Datos calculados para el dashboard
  const [ventasPorPais, setVentasPorPais] = useState([]);
  const [metodosPago, setMetodosPago] = useState([]);
  const [cursosIngresos, setCursosIngresos] = useState([]);
  const [serieVentas, setSerieVentas] = useState([]);
  const [productosIngresos, setProductosIngresos] = useState([]);
  const [ventasPorDiaRaw, setVentasPorDiaRaw] = useState([]);
  const [rangoDias, setRangoDias] = useState(7);

  // Comprobantes: se obtienen vía endpoint autenticado y se abren como object URL.
  const [comprobanteCargando, setComprobanteCargando] = useState(null);

  const verComprobante = async (compraId) => {
    try {
      setComprobanteCargando(compraId);
      const url = await getComprobanteUrl(compraId);
      window.open(url, '_blank', 'noopener,noreferrer');
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (error) {
      console.error('Error cargando comprobante:', error);
      showToast('No se pudo cargar el comprobante.', 'error');
    } finally {
      setComprobanteCargando(null);
    }
  };

  useEffect(() => {
    if (!esAdmin()) {
      navigate('/');
      return;
    }
    cargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (vista === 'ventas') cargarTodasCompras();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vista, filtroCompras]);

  // Mostrar toast cuando hay nuevas notificaciones
  useEffect(() => {
    if (hayNuevas && vista !== 'pagos') {
      setMostrarToast(true);
      setTimeout(() => setMostrarToast(false), 5000);
    }
  }, [hayNuevas, vista]);

  // Recalcular la serie del gráfico cuando cambian los datos o el rango
  useEffect(() => {
    setSerieVentas(serieGrafico(ventasPorDiaRaw, rangoDias));
  }, [ventasPorDiaRaw, rangoDias]);

  const cargarDatos = async () => {
    try {
      const [statsRes, cursosRes, usuariosRes, comprasRes] = await Promise.all([
        adminAPI.obtenerDashboard(),
        adminAPI.obtenerTodosCursos(),
        adminAPI.obtenerUsuarios(),
        adminAPI.obtenerComprasPendientes(),
      ]);
      setEstadisticas(statsRes.data);
      setCursos(cursosRes.data);
      setUsuarios(usuariosRes.data);
      setComprasPendientes(comprasRes.data);
      setProductosIngresos(statsRes.data.productosIngresos || []);
      setVentasPorDiaRaw(statsRes.data.ventasPorDia || []);

      const ventas = statsRes.data.ultimasVentas || [];
      setVentasPorPais(calcularVentasPorPais(ventas));
      setMetodosPago(calcularMetodosPago(ventas));
      setCursosIngresos(calcularCursosIngresos(ventas, cursosRes.data));
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setCargando(false);
    }
  };

  const cargarTodasCompras = async () => {
    try {
      const params = {};
      if (filtroCompras !== 'todas') params.estado = filtroCompras;
      const { data } = await adminAPI.obtenerTodasCompras(params);
      setTodasCompras(data);
    } catch (error) {
      console.error('Error cargando compras:', error);
    }
  };

  const eliminarCurso = async (id) => {
    if (!(await confirm({ title: 'Eliminar curso', message: '¿Estás seguro de eliminar este curso?', confirmText: 'Eliminar', danger: true }))) return;
    try {
      await cursosAPI.eliminar(id);
      await cargarDatos();
      showToast('Curso eliminado exitosamente');
    } catch (error) {
      console.error('Error eliminando curso:', error);
      showToast('Error al eliminar el curso', 'error');
    }
  };

  const cambiarRol = async (usuarioId, nuevoRol) => {
    if (!(await confirm({ title: 'Cambiar rol', message: '¿Estás seguro de cambiar el rol de este usuario?', confirmText: 'Cambiar' }))) return;
    try {
      await adminAPI.cambiarRol(usuarioId, nuevoRol);
      await cargarDatos();
      showToast('Rol actualizado exitosamente');
    } catch (error) {
      console.error('Error cambiando rol:', error);
      showToast('Error al cambiar el rol', 'error');
    }
  };

  const eliminarUsuario = async (usuarioId) => {
    if (!(await confirm({ title: 'Eliminar usuario', message: 'Esta acción no se puede deshacer.', confirmText: 'Eliminar', danger: true }))) return;
    try {
      await adminAPI.eliminarUsuario(usuarioId);
      await cargarDatos();
      showToast('Usuario eliminado');
    } catch (error) {
      console.error('Error eliminando usuario:', error);
      showToast('Error: ' + (error.response?.data?.error || error.message), 'error');
    }
  };

  const guardarEdicionUsuario = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const datos = {
      nombre: formData.get('nombre'),
      email: formData.get('email'),
      telefono: formData.get('telefono'),
      pais: formData.get('pais'),
    };
    try {
      await adminAPI.editarUsuario(modalEditarUsuario._id, datos);
      await cargarDatos();
      setModalEditarUsuario(null);
      showToast('Usuario actualizado');
    } catch (error) {
      showToast('Error al actualizar usuario', 'error');
    }
  };

  const aprobarPago = async (compraId) => {
    if (!(await confirm({ title: 'Aprobar pago', message: 'Se enviará un email al usuario confirmando su compra.', confirmText: 'Aprobar' }))) return;
    try {
      await adminAPI.aprobarPago(compraId);
      await cargarDatos();
      if (vista === 'ventas') await cargarTodasCompras();
      showToast('Pago aprobado y email enviado');
    } catch (error) {
      console.error('Error aprobando pago:', error);
      showToast('Error al aprobar el pago', 'error');
    }
  };

  const rechazarPago = async (compraId) => {
    const motivo = await confirm({
      title: 'Rechazar pago', confirmText: 'Rechazar', danger: true,
      withInput: true, inputLabel: 'Motivo del rechazo', defaultValue: 'Comprobante no válido',
    });
    if (!motivo) return;
    try {
      await adminAPI.rechazarPago(compraId, motivo);
      await cargarDatos();
      if (vista === 'ventas') await cargarTodasCompras();
      showToast('Pago rechazado y usuario notificado');
    } catch (error) {
      console.error('Error rechazando pago:', error);
      showToast('Error al rechazar el pago', 'error');
    }
  };

  const eliminarCompra = async (compraId) => {
    if (!(await confirm({ title: 'Eliminar compra', message: 'Si estaba aprobada, se quitarán los cursos del usuario.', confirmText: 'Eliminar', danger: true }))) return;
    try {
      await adminAPI.eliminarCompra(compraId);
      await cargarTodasCompras();
      await cargarDatos();
      showToast('Compra eliminada');
    } catch (error) {
      console.error('Error eliminando compra:', error);
      showToast('Error al eliminar compra', 'error');
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
      venezuela: { monto: parseFloat(formData.get('precio_venezuela')), moneda: 'VES' },
    };
    const datos = { precioUSD: parseFloat(formData.get('precio_internacional')), precios };
    try {
      await cursosAPI.actualizar(modalEditarPrecios._id, datos);
      await cargarDatos();
      setModalEditarPrecios(null);
      showToast('Precios actualizados exitosamente');
    } catch (error) {
      console.error('Error actualizando precios:', error);
      showToast('Error al actualizar precios', 'error');
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
          {NAV.map(({ key, label, icon: Icon }) => (
            <button key={key} className={vista === key ? 'activo' : ''} onClick={() => setVista(key)}>
              <Icon size={18} />
              {label}
            </button>
          ))}
          <button
            className={vista === 'pagos' ? 'activo' : ''}
            onClick={() => { setVista('pagos'); marcarComoVistas(); }}
          >
            <DollarSign size={18} />
            Pagos Pendientes
            {contador > 0 && (
              <span className={`badge-count ${hayNuevas ? 'badge-pulsante' : ''}`}>{contador}</span>
            )}
          </button>
          <button className={vista === 'ventas' ? 'activo' : ''} onClick={() => setVista('ventas')}>
            <ShoppingCart size={18} />
            Todas las Ventas
          </button>
        </nav>
      </div>

      <div className="admin-content">
        {vista === 'dashboard' && (
          <DashboardAdmin
            estadisticas={estadisticas}
            ventasPorPais={ventasPorPais}
            ventasSerie={serieVentas}
            metodosPago={metodosPago}
            cursosIngresos={cursosIngresos}
            productosIngresos={productosIngresos}
            rangoDias={rangoDias}
            setRangoDias={setRangoDias}
            onIrPagos={() => setVista('pagos')}
            onEmailMasivo={() => navigate('/admin/email-masivo')}
          />
        )}

        {vista === 'cursos' && (
          <GestionCursos
            cursos={cursos}
            onCrear={() => navigate('/admin/curso/nuevo')}
            onVer={(id) => navigate(`/curso/${id}`)}
            onEditarPrecios={(curso) => setModalEditarPrecios(curso)}
            onEditar={(id) => navigate(`/admin/curso/${id}/editar`)}
            onEliminar={eliminarCurso}
          />
        )}

        {vista === 'productos' && <GestionProductos />}

        {vista === 'usuarios' && (
          <GestionUsuarios
            usuarios={usuarios}
            onCambiarRol={cambiarRol}
            onEditar={(usuario) => setModalEditarUsuario(usuario)}
            onEliminar={eliminarUsuario}
          />
        )}

        {vista === 'pagos' && (
          <PagosPendientes
            comprasPendientes={comprasPendientes}
            comprobanteCargando={comprobanteCargando}
            onVerComprobante={verComprobante}
            onAprobar={aprobarPago}
            onRechazar={rechazarPago}
          />
        )}

        {vista === 'ventas' && (
          <GestionVentas
            todasCompras={todasCompras}
            filtroCompras={filtroCompras}
            setFiltroCompras={setFiltroCompras}
            onVerDetalle={(compra) => setModalDetalleVenta(compra)}
            onAprobar={aprobarPago}
            onEliminar={eliminarCompra}
          />
        )}
      </div>

      {/* MODALES */}
      {modalEditarUsuario && (
        <ModalEditarUsuario
          usuario={modalEditarUsuario}
          onClose={() => setModalEditarUsuario(null)}
          onSubmit={guardarEdicionUsuario}
        />
      )}
      {modalDetalleVenta && (
        <ModalDetalleVenta
          venta={modalDetalleVenta}
          onClose={() => setModalDetalleVenta(null)}
          comprobanteCargando={comprobanteCargando}
          onVerComprobante={verComprobante}
        />
      )}
      {modalEditarPrecios && (
        <ModalEditarPrecios
          curso={modalEditarPrecios}
          onClose={() => setModalEditarPrecios(null)}
          onSubmit={guardarPrecios}
        />
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
            onClick={() => { setVista('pagos'); setMostrarToast(false); marcarComoVistas(); }}
          >
            Ver ahora
          </button>
          <button className="toast-close" onClick={() => setMostrarToast(false)}>
            <X size={18} />
          </button>
        </div>
      )}

      {confirmUI}
      <ToastContainer toasts={toasts} />
    </div>
  );
};

export default Admin;
