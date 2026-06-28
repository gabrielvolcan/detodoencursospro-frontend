import {
  DollarSign, Users, BookOpen, TrendingUp, Globe, CreditCard, BarChart3,
  Activity, Mail, Clock,
} from 'lucide-react';
import { formatUSD } from '../../utils/formato';
import { tendencia, calcularTicketPromedio, calcularTasaConversion } from '../../utils/adminMetrics';
import Thumb from './components/Thumb';

const Trend = ({ actual, anterior, texto }) => {
  const t = tendencia(actual, anterior);
  return (
    <div className={`ssub ${t.signo === 'down' ? 'down' : ''}`}>
      {t.signo === 'up' ? '↑' : t.signo === 'down' ? '↓' : '•'} {t.pct}% {texto}
    </div>
  );
};

const DashboardAdmin = ({
  estadisticas, ventasPorPais, ventasSerie, metodosPago, cursosIngresos,
  productosIngresos, rangoDias, setRangoDias, onIrPagos, onEmailMasivo,
}) => {
  const s = estadisticas?.estadisticas || {};
  const maxSerie = Math.max(...ventasSerie.map((d) => d.total), 1);

  return (
    <section>
      <div className="phead">
        <h1 className="h1">Dashboard</h1>
        <button className="btn-green" onClick={onEmailMasivo}><Mail size={18} /> Email Masivo</button>
      </div>

      <div className="statgrid4">
        <div className="statcard">
          <div className="sicon ico-green"><DollarSign size={26} /></div>
          <div>
            <div className="slabel">Ingresos Totales</div>
            <div className="sval">{formatUSD(s.ingresosTotal)}</div>
            <Trend actual={s.ingresosMesTotal} anterior={s.ingresosMesAnterior} texto="este mes vs anterior" />
          </div>
        </div>
        <div className="statcard">
          <div className="sicon ico-blue"><Users size={26} /></div>
          <div>
            <div className="slabel">Total Usuarios</div>
            <div className="sval">{s.totalUsuarios || 0}</div>
            <Trend actual={s.usuariosMes} anterior={s.usuariosMesAnterior} texto="nuevos vs mes anterior" />
          </div>
        </div>
        <div className="statcard">
          <div className="sicon ico-purple"><BookOpen size={26} /></div>
          <div>
            <div className="slabel">Total Cursos</div>
            <div className="sval">{s.totalCursos || 0}</div>
          </div>
        </div>
        <div className="statcard">
          <div className="sicon ico-teal"><TrendingUp size={26} /></div>
          <div>
            <div className="slabel">Ventas Completadas</div>
            <div className="sval">{s.ventasCompletadas || 0}</div>
          </div>
        </div>
      </div>

      <div className="statgrid3">
        <button type="button" className="statcard clickable" onClick={onIrPagos}>
          <div className="sicon ico-gold"><Clock size={26} /></div>
          <div>
            <div className="slabel">Pagos Pendientes</div>
            <div className="sval">{s.pagosPendientes || 0}</div>
            <div className="slink">Revisar y aprobar →</div>
          </div>
        </button>
        <div className="statcard">
          <div className="sicon ico-gold"><Activity size={26} /></div>
          <div>
            <div className="slabel">Ticket Promedio</div>
            <div className="sval">${calcularTicketPromedio(estadisticas?.ultimasVentas)}</div>
          </div>
        </div>
        <div className="statcard">
          <div className="sicon ico-pink"><BarChart3 size={26} /></div>
          <div>
            <div className="slabel">Tasa de Conversión</div>
            <div className="sval">{calcularTasaConversion(estadisticas)}%</div>
          </div>
        </div>
      </div>

      <div className="pgrid3">
        <div className="panel">
          <div className="panel-h"><Globe size={20} /> Ventas por País</div>
          <div className="phr"></div>
          {ventasPorPais.length > 0 ? ventasPorPais.map((item, i) => (
            <div className="country-row" key={i}>
              <div className="cr-top">{item.bandera} {item.pais}</div>
              <div className="cr-amt"><b>{formatUSD(item.total)}</b><span>{item.porcentaje}%</span></div>
              <div className="bar"><i style={{ width: `${item.porcentaje}%` }}></i></div>
            </div>
          )) : <p className="sin-datos">No hay ventas registradas aún</p>}
        </div>

        <div className="panel">
          <div className="chart-head">
            <div className="chart-title"><TrendingUp size={20} /> Ventas (últimos {rangoDias} días)</div>
            <div className="seg">
              {[7, 14, 30].map((d) => (
                <button key={d} className={rangoDias === d ? 'on' : ''} onClick={() => setRangoDias(d)}>{d}d</button>
              ))}
            </div>
          </div>
          <div className="chart">
            {ventasSerie.map((dia, i) => {
              const esMax = dia.total === maxSerie && dia.total > 0;
              return (
                <div className={`cbar ${esMax ? 'hi' : ''}`} key={i}>
                  {esMax && <span className="v">${dia.total.toFixed(0)}</span>}
                  <i style={{ height: `${Math.max((dia.total / maxSerie) * 100, dia.total > 0 ? 4 : 2)}%` }} title={`${formatUSD(dia.total)} (${dia.cantidad} ventas)`}></i>
                  <small>{dia.fecha}</small>
                </div>
              );
            })}
          </div>
        </div>

        <div className="panel">
          <div className="panel-h"><CreditCard size={20} /> Métodos de Pago</div>
          <div className="phr"></div>
          {metodosPago.length > 0 ? metodosPago.map((m, i) => (
            <div className="mrow" key={i}><b>{m.metodo}</b><span>{m.cantidad} ventas</span></div>
          )) : <p className="sin-datos">No hay datos de métodos de pago</p>}
        </div>
      </div>

      <div className="pgrid2">
        <div className="panel">
          <div className="panel-h">Top Cursos por Ingresos</div>
          <div className="phr"></div>
          {cursosIngresos.length > 0 ? cursosIngresos.map((c, i) => (
            <div className="tl-row" key={c._id}>
              <Thumb src={c.imagen} title={c.titulo} index={i} />
              <div>
                <div className="tl-name">{c.titulo}</div>
                <div className="tl-sub">{c.estudiantes || 0} estudiantes · <b>{formatUSD(c.ingresos)} ingresos</b></div>
              </div>
            </div>
          )) : <p className="sin-datos">No hay cursos con ventas aún</p>}
        </div>
        <div className="panel">
          <div className="panel-h">Top Productos por Ingresos</div>
          <div className="phr"></div>
          {productosIngresos.length > 0 ? productosIngresos.map((p, i) => (
            <div className="tl-row" key={p._id}>
              <Thumb src={p.imagen} title={p.titulo} index={i + 5} />
              <div>
                <div className="tl-name">{p.titulo}</div>
                <div className="tl-sub">{p.ventas || 0} ventas · <b>{formatUSD(p.ingresos)} ingresos</b></div>
              </div>
            </div>
          )) : <p className="sin-datos">No hay productos vendidos aún</p>}
        </div>
      </div>

      <div className="panel" style={{ marginTop: 18 }}>
        <div className="panel-h">Últimas Ventas</div>
        <div className="phr"></div>
        {estadisticas?.ultimasVentas?.slice(0, 5).map((v) => (
          <div className="uv-row" key={v._id}>
            <div>
              <div className="uv-name">{v.usuario?.nombre}</div>
              <div className="uv-date">{new Date(v.createdAt).toLocaleDateString()}</div>
            </div>
            <div className="uv-amt">{formatUSD(v.total)}</div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default DashboardAdmin;
