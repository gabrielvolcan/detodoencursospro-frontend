import { ShoppingCart, TrendingUp, Activity, DollarSign, Eye, Check, Trash2 } from 'lucide-react';
import { obtenerBandera, formatUSD } from '../../utils/formato';

const FILTROS = [
  { key: 'todas', label: 'Todas' },
  { key: 'aprobado', label: '✓ Aprobadas' },
  { key: 'pendiente', label: '◷ Pendientes' },
  { key: 'rechazado', label: '✕ Rechazadas' },
];

const ESTADO = {
  aprobado: { cls: 'on', txt: '✓ Aprobado' },
  pendiente: { cls: 'pend', txt: '◷ Pendiente' },
  rechazado: { cls: 'off', txt: '✕ Rechazado' },
};

const GestionVentas = ({ todasCompras, filtroCompras, setFiltroCompras, onVerDetalle, onAprobar, onEliminar }) => {
  const aprobadas = todasCompras.filter((c) => c.estadoPago === 'aprobado');
  const pendientes = todasCompras.filter((c) => c.estadoPago === 'pendiente');
  const totalRecaudado = aprobadas.reduce((sum, c) => sum + c.total, 0);

  return (
    <section>
      <div className="phead">
        <h1 className="h1">Todas las Ventas</h1>
        <div className="filters">
          {FILTROS.map((f) => (
            <button key={f.key} className={`fbtn ${filtroCompras === f.key ? 'on' : ''}`} onClick={() => setFiltroCompras(f.key)}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="statgrid4">
        <div className="statcard"><div className="sicon ico-purple"><ShoppingCart size={26} /></div><div><div className="sval">{todasCompras.length}</div><div className="slabel">Total Ventas</div></div></div>
        <div className="statcard"><div className="sicon ico-green"><TrendingUp size={26} /></div><div><div className="sval">{aprobadas.length}</div><div className="slabel">Aprobadas</div></div></div>
        <div className="statcard"><div className="sicon ico-orange"><Activity size={26} /></div><div><div className="sval">{pendientes.length}</div><div className="slabel">Pendientes</div></div></div>
        <div className="statcard"><div className="sicon ico-pink"><DollarSign size={26} /></div><div><div className="sval">{formatUSD(totalRecaudado)}</div><div className="slabel">Total Recaudado</div></div></div>
      </div>

      <div className="tblwrap" style={{ marginTop: 22 }}>
        <table className="tbl">
          <thead>
            <tr><th>ID</th><th>Usuario</th><th>Total</th><th>Método</th><th>País</th><th>Fecha</th><th>Estado</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            {todasCompras.map((c) => {
              const est = ESTADO[c.estadoPago] || { cls: 'off', txt: c.estadoPago };
              return (
                <tr key={c._id}>
                  <td className="muted">#{c._id.slice(-6)}</td>
                  <td>
                    <div className="uv-name">{c.usuario?.nombre}</div>
                    <div className="lv" style={{ color: '#83848b', fontSize: 13, marginTop: 4 }}>{c.usuario?.email}</div>
                  </td>
                  <td><b style={{ color: '#22e08a', fontSize: 16 }}>{formatUSD(c.total)}</b> <span className="muted">{c.moneda}</span></td>
                  <td><span className="chip">{c.metodoPago?.nombre}</span></td>
                  <td><span className="chip">{obtenerBandera(c.metodoPago?.pais || 'Internacional')} {c.metodoPago?.pais || 'N/A'}</span></td>
                  <td className="muted">{new Date(c.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                  <td><span className={`badge ${est.cls}`}>{est.txt}</span></td>
                  <td>
                    <div className="acts">
                      <button className="abtn" onClick={() => onVerDetalle(c)} title="Ver detalles"><Eye size={17} /></button>
                      {c.estadoPago === 'pendiente' && (
                        <button className="abtn" onClick={() => onAprobar(c._id)} title="Aprobar"><Check size={17} /></button>
                      )}
                      <button className="abtn del" onClick={() => onEliminar(c._id)} title="Eliminar"><Trash2 size={17} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {todasCompras.length === 0 && (
          <div className="empty-row">No hay ventas {filtroCompras !== 'todas' && `con estado "${filtroCompras}"`}</div>
        )}
      </div>
    </section>
  );
};

export default GestionVentas;
