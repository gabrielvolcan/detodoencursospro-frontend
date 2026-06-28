import { ShoppingCart, TrendingUp, Activity, DollarSign, Eye, Trash2 } from 'lucide-react';
import { obtenerBandera, formatUSD, formatMonto } from '../../utils/formato';

const FILTROS = [
  { key: 'todas', label: 'Todas' },
  { key: 'aprobado', label: '✓ Aprobadas' },
  { key: 'pendiente', label: '⏱ Pendientes' },
  { key: 'rechazado', label: '✗ Rechazadas' },
];

const GestionVentas = ({ todasCompras, filtroCompras, setFiltroCompras, onVerDetalle, onAprobar, onEliminar }) => {
  const aprobadas = todasCompras.filter((c) => c.estadoPago === 'aprobado');
  const pendientes = todasCompras.filter((c) => c.estadoPago === 'pendiente');
  const totalRecaudado = aprobadas.reduce((sum, c) => sum + c.total, 0);

  return (
    <div className="gestion-ventas">
      <div className="ventas-header-mejorado">
        <h1>Todas las Ventas</h1>
        <div className="filtros-ventas">
          {FILTROS.map((f) => (
            <button
              key={f.key}
              className={`filtro-btn ${filtroCompras === f.key ? 'activo' : ''}`}
              onClick={() => setFiltroCompras(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ESTADÍSTICAS DE VENTAS */}
      <div className="ventas-stats-grid">
        <div className="venta-stat-card">
          <div className="stat-icono" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <ShoppingCart size={24} />
          </div>
          <div className="stat-datos">
            <span className="stat-numero">{todasCompras.length}</span>
            <span className="stat-texto">Total Ventas</span>
          </div>
        </div>

        <div className="venta-stat-card">
          <div className="stat-icono" style={{ background: 'linear-gradient(135deg, var(--acento) 0%, #00cc6e 100%)' }}>
            <TrendingUp size={24} />
          </div>
          <div className="stat-datos">
            <span className="stat-numero">{aprobadas.length}</span>
            <span className="stat-texto">Aprobadas</span>
          </div>
        </div>

        <div className="venta-stat-card">
          <div className="stat-icono" style={{ background: 'linear-gradient(135deg, #ffa500 0%, #ff8c00 100%)' }}>
            <Activity size={24} />
          </div>
          <div className="stat-datos">
            <span className="stat-numero">{pendientes.length}</span>
            <span className="stat-texto">Pendientes</span>
          </div>
        </div>

        <div className="venta-stat-card">
          <div className="stat-icono" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            <DollarSign size={24} />
          </div>
          <div className="stat-datos">
            <span className="stat-numero">{formatUSD(totalRecaudado)}</span>
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
              todasCompras.map((compra) => (
                <tr key={compra._id} className={`fila-venta ${compra.estadoPago}`}>
                  <td><span className="venta-id">#{compra._id.slice(-6)}</span></td>
                  <td>
                    <div className="usuario-venta">
                      <strong>{compra.usuario?.nombre}</strong>
                      <span className="email-venta">{compra.usuario?.email}</span>
                    </div>
                  </td>
                  <td>
                    <span className="venta-monto">{formatUSD(compra.total)} <span className="moneda">{compra.moneda}</span></span>
                  </td>
                  <td><span className="metodo-badge">{compra.metodoPago?.nombre}</span></td>
                  <td>
                    <span className="pais-badge">
                      {obtenerBandera(compra.metodoPago?.pais || 'Internacional')} {compra.metodoPago?.pais || 'N/A'}
                    </span>
                  </td>
                  <td>
                    <span className="fecha-venta">
                      {new Date(compra.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
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
                      <button className="btn-icon" onClick={() => onVerDetalle(compra)} title="Ver detalles">
                        <Eye size={18} />
                      </button>
                      {compra.estadoPago === 'pendiente' && (
                        <button className="btn-icon aprobar" onClick={() => onAprobar(compra._id)} title="Aprobar">
                          ✓
                        </button>
                      )}
                      <button className="btn-icon eliminar" onClick={() => onEliminar(compra._id)} title="Eliminar">
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
  );
};

export default GestionVentas;
