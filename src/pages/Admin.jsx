import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  DollarSign, Users, BookOpen, TrendingUp, Plus, Edit2, Trash2, Eye 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { adminAPI, cursosAPI } from '../services/api';
import './Admin.css';

const Admin = () => {
  const { esAdmin } = useAuth();
  const navigate = useNavigate();
  
  const [vista, setVista] = useState('dashboard'); // dashboard, cursos, usuarios, pagos
  const [estadisticas, setEstadisticas] = useState(null);
  const [cursos, setCursos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [comprasPendientes, setComprasPendientes] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!esAdmin()) {
      navigate('/');
      return;
    }
    cargarDatos();
  }, []);

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

  const aprobarPago = async (compraId) => {
    if (!confirm('¿Aprobar este pago? Se enviará email al usuario con sus credenciales.')) return;
    
    try {
      await adminAPI.aprobarPago(compraId);
      await cargarDatos();
      alert('✅ Pago aprobado y email enviado al usuario');
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
      alert('❌ Pago rechazado y usuario notificado');
    } catch (error) {
      console.error('Error rechazando pago:', error);
      alert('Error al rechazar el pago');
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
            onClick={() => setVista('pagos')}
          >
            <DollarSign size={18} />
            Pagos Pendientes
            {comprasPendientes.length > 0 && (
              <span className="badge-count">{comprasPendientes.length}</span>
            )}
          </button>
        </nav>
      </div>

      <div className="admin-content">
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
                    <th>Precio</th>
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
                      <td>${curso.precio}</td>
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

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
                          href={`http://localhost:5000${compra.comprobante.url}`} 
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
      </div>
    </div>
  );
};

export default Admin;