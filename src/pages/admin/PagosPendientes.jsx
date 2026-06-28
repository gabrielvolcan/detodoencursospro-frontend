import { FileText } from 'lucide-react';
import { formatMonto } from '../../utils/formato';

const PagosPendientes = ({ comprasPendientes, comprobanteCargando, onVerComprobante, onAprobar, onRechazar }) => (
  <section>
    <h1 className="h1">Pagos Pendientes de Aprobación</h1>

    {comprasPendientes.length === 0 ? (
      <div className="empty-box">✅ No hay pagos pendientes por revisar</div>
    ) : (
      <div className="pay-grid">
        {comprasPendientes.map((compra) => (
          <div className="pay-card" key={compra._id}>
            <div className="pay-top">
              <div>
                <h3>{compra.usuario?.nombre}</h3>
                <p>{compra.usuario?.email}</p>
              </div>
              <span className="pay-amt">{formatMonto(compra.total, compra.moneda)}</span>
            </div>

            <div className="pay-kv"><b>Método:</b> {compra.metodoPago?.nombre}</div>
            <div className="pay-kv"><b>País:</b> {compra.metodoPago?.pais}</div>
            <div className="pay-kv"><b>Fecha:</b> {new Date(compra.createdAt).toLocaleString()}</div>
            <div className="pay-kv"><b>Estado:</b> <span className="badge pend">{compra.estadoPago}</span></div>

            <div className="pay-cursos">
              <b>Cursos:</b>
              {compra.cursos.map((item) => (
                <div className="cm" key={item._id}>• {item.curso?.titulo} - ${item.precio}</div>
              ))}
            </div>

            {compra.comprobante?.url && (
              <button
                type="button"
                className="btn-ghost"
                style={{ height: 44, display: 'inline-flex', alignItems: 'center', gap: 8 }}
                onClick={() => onVerComprobante(compra._id)}
                disabled={comprobanteCargando === compra._id}
              >
                <FileText size={17} /> {comprobanteCargando === compra._id ? 'Cargando...' : 'Ver Comprobante'}
              </button>
            )}

            <div className="pay-actions">
              <button className="btn-aprobar" onClick={() => onAprobar(compra._id)}>✓ Aprobar Pago</button>
              <button className="btn-rechazar" onClick={() => onRechazar(compra._id)}>✕ Rechazar</button>
            </div>
          </div>
        ))}
      </div>
    )}
  </section>
);

export default PagosPendientes;
