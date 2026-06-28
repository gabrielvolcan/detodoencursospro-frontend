import {
  DollarSign, Users, BookOpen, TrendingUp, Globe, CreditCard, BarChart3,
  Activity, Mail, Clock, ArrowUp, ArrowDown,
} from 'lucide-react';
import { formatUSD } from '../../utils/formato';
import { tendencia, calcularTicketPromedio, calcularTasaConversion } from '../../utils/adminMetrics';

// Tarjeta de tendencia (flecha + %) reutilizable
const Tendencia = ({ actual, anterior, texto }) => {
  const t = tendencia(actual, anterior);
  return (
    <span className={`stat-trend ${t.signo}`}>
      {t.signo === 'up' && <ArrowUp size={13} />}
      {t.signo === 'down' && <ArrowDown size={13} />}
      {t.pct}% {texto}
    </span>
  );
};

const DashboardAdmin = ({
  estadisticas, ventasPorPais, ventasSerie, metodosPago, cursosIngresos,
  productosIngresos, rangoDias, setRangoDias, onIrPagos, onEmailMasivo,
}) => {
  const stats = estadisticas?.estadisticas;

  return (
    <div className="dashboard">
      <div className="dashboard-header-con-boton">
        <h1>Dashboard</h1>
        <button onClick={onEmailMasivo} className="btn-email-masivo">
          <Mail size={20} />
          Email Masivo
        </button>
      </div>

      {/* MÉTRICAS PRINCIPALES */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon ico-verde"><DollarSign size={28} /></div>
          <div className="stat-info">
            <span className="stat-label">Ingresos Totales</span>
            <span className="stat-value">{formatUSD(stats?.ingresosTotal)}</span>
            <Tendencia actual={stats?.ingresosMesTotal} anterior={stats?.ingresosMesAnterior} texto="este mes vs anterior" />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon ico-azul"><Users size={28} /></div>
          <div className="stat-info">
            <span className="stat-label">Total Usuarios</span>
            <span className="stat-value">{stats?.totalUsuarios || 0}</span>
            <Tendencia actual={stats?.usuariosMes} anterior={stats?.usuariosMesAnterior} texto="nuevos vs mes anterior" />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon ico-violeta"><BookOpen size={28} /></div>
          <div className="stat-info">
            <span className="stat-label">Total Cursos</span>
            <span className="stat-value">{stats?.totalCursos || 0}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon ico-cyan"><TrendingUp size={28} /></div>
          <div className="stat-info">
            <span className="stat-label">Ventas Completadas</span>
            <span className="stat-value">{stats?.ventasCompletadas || 0}</span>
          </div>
        </div>

        {/* Pagos pendientes — acceso rápido a aprobar */}
        <button
          type="button"
          className={`stat-card stat-card-accion ${(stats?.pagosPendientes || 0) > 0 ? 'pendiente-activo' : ''}`}
          onClick={onIrPagos}
        >
          <div className="stat-icon ico-ambar"><Clock size={28} /></div>
          <div className="stat-info">
            <span className="stat-label">Pagos Pendientes</span>
            <span className="stat-value">{stats?.pagosPendientes || 0}</span>
            <span className="stat-trend accion">Revisar y aprobar →</span>
          </div>
        </button>

        <div className="stat-card">
          <div className="stat-icon ico-ambar"><Activity size={28} /></div>
          <div className="stat-info">
            <span className="stat-label">Ticket Promedio</span>
            <span className="stat-value">${calcularTicketPromedio(estadisticas?.ultimasVentas)}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon ico-rosa"><BarChart3 size={28} /></div>
          <div className="stat-info">
            <span className="stat-label">Tasa de Conversión</span>
            <span className="stat-value">{calcularTasaConversion(estadisticas)}%</span>
          </div>
        </div>
      </div>

      {/* GRID DE 3 COLUMNAS */}
      <div className="dashboard-grid-mejorado">
        {/* VENTAS POR PAÍS */}
        <div className="dashboard-card">
          <h2><Globe size={24} /> Ventas por País</h2>
          <div className="ventas-pais-lista">
            {ventasPorPais.length > 0 ? (
              ventasPorPais.map((item, index) => (
                <div key={index} className="venta-pais-item">
                  <div className="pais-info">
                    <span className="bandera">{item.bandera}</span>
                    <span className="pais-nombre">{item.pais}</span>
                  </div>
                  <div className="pais-stats">
                    <span className="pais-total">{formatUSD(item.total)}</span>
                    <span className="pais-porcentaje">{item.porcentaje}%</span>
                  </div>
                  <div className="pais-barra">
                    <div className="pais-barra-fill" style={{ width: `${item.porcentaje}%` }}></div>
                  </div>
                </div>
              ))
            ) : (
              <p className="sin-datos">No hay ventas registradas aún</p>
            )}
          </div>
        </div>

        {/* VENTAS (rango seleccionable) */}
        <div className="dashboard-card">
          <div className="dashboard-card-head">
            <h2><TrendingUp size={24} /> Ventas (últimos {rangoDias} días)</h2>
            <div className="rango-selector">
              {[7, 14, 30].map((d) => (
                <button key={d} type="button" className={rangoDias === d ? 'activo' : ''} onClick={() => setRangoDias(d)}>
                  {d}d
                </button>
              ))}
            </div>
          </div>
          <div className="grafico-ventas">
            {ventasSerie.map((dia, index) => {
              const maxTotal = Math.max(...ventasSerie.map((d) => d.total), 1);
              const altura = (dia.total / maxTotal) * 100;
              return (
                <div key={index} className="dia-barra">
                  <div className="barra-container">
                    <div className="barra-fill" style={{ height: `${altura}%` }} title={`${formatUSD(dia.total)} (${dia.cantidad} ventas)`}>
                      <span className="barra-valor">${dia.total.toFixed(0)}</span>
                    </div>
                  </div>
                  <span className="dia-label">{dia.fecha}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* MÉTODOS DE PAGO */}
        <div className="dashboard-card">
          <h2><CreditCard size={24} /> Métodos de Pago</h2>
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
        <div className="section">
          <h2>Top Cursos por Ingresos</h2>
          <div className="cursos-populares">
            {cursosIngresos.length > 0 ? (
              cursosIngresos.map((curso) => (
                <div key={curso._id} className="curso-popular-item">
                  <img src={curso.imagen} alt={curso.titulo} />
                  <div>
                    <h4>{curso.titulo}</h4>
                    <p>{curso.estudiantes || 0} estudiantes • <strong>{formatUSD(curso.ingresos)} ingresos</strong></p>
                  </div>
                </div>
              ))
            ) : (
              <p className="sin-datos">No hay cursos con ventas aún</p>
            )}
          </div>
        </div>

        <div className="section">
          <h2>Top Productos por Ingresos</h2>
          <div className="cursos-populares">
            {productosIngresos.length > 0 ? (
              productosIngresos.map((prod) => (
                <div key={prod._id} className="curso-popular-item">
                  <img src={prod.imagen} alt={prod.titulo} />
                  <div>
                    <h4>{prod.titulo}</h4>
                    <p>{prod.ventas || 0} ventas • <strong>{formatUSD(prod.ingresos)} ingresos</strong></p>
                  </div>
                </div>
              ))
            ) : (
              <p className="sin-datos">No hay productos vendidos aún</p>
            )}
          </div>
        </div>

        <div className="section">
          <h2>Últimas Ventas</h2>
          <div className="ultimas-ventas">
            {estadisticas?.ultimasVentas?.slice(0, 5).map((venta) => (
              <div key={venta._id} className="venta-item">
                <div>
                  <strong>{venta.usuario?.nombre}</strong>
                  <p>{new Date(venta.createdAt).toLocaleDateString()}</p>
                </div>
                <span className="venta-total">{formatUSD(venta.total)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardAdmin;
