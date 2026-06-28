import { formatMonto } from '../../utils/formato';

const PagosPendientes = ({ comprasPendientes, comprobanteCargando, onVerComprobante, onAprobar, onRechazar }) => (
  <div className="gestion-pagos">
    <h1>Pagos Pendientes de Aprobación</h1>

    {comprasPendientes.length === 0 ? (
      <div className="sin-pendientes">
        <p>✅ No hay pagos pendientes por revisar</p>
      </div>
    ) : (
      <div className="pagos-lista">
        {comprasPendientes.map((compra) => (
          <div key={compra._id} className="pago-card">
            <div className="pago-header">
              <div>
                <h3>{compra.usuario?.nombre}</h3>
                <p>{compra.usuario?.email}</p>
              </div>
              <span className="pago-total">{formatMonto(compra.total, compra.moneda)}</span>
            </div>

            <div className="pago-detalles">
              <p><strong>Método:</strong> {compra.metodoPago?.nombre}</p>
              <p><strong>País:</strong> {compra.metodoPago?.pais}</p>
              <p><strong>Fecha:</strong> {new Date(compra.createdAt).toLocaleString()}</p>
              <p><strong>Estado:</strong> <span className="badge-estado">{compra.estadoPago}</span></p>
            </div>

            <div className="pago-cursos">
              <strong>Cursos:</strong>
              {compra.cursos.map((item) => (
                <div key={item._id} className="curso-mini">
                  • {item.curso?.titulo} - ${item.precio}
                </div>
              ))}
            </div>

            {compra.comprobante?.url && (
              <div className="pago-comprobante">
                <strong>Comprobante:</strong>
                <button
                  type="button"
                  onClick={() => onVerComprobante(compra._id)}
                  disabled={comprobanteCargando === compra._id}
                  className="btn-ver-comprobante"
                >
                  {comprobanteCargando === compra._id ? '⏳ Cargando...' : '📸 Ver Comprobante'}
                </button>
              </div>
            )}

            <div className="pago-acciones">
              <button className="btn-aprobar" onClick={() => onAprobar(compra._id)}>
                ✓ Aprobar Pago
              </button>
              <button className="btn-rechazar" onClick={() => onRechazar(compra._id)}>
                ✗ Rechazar
              </button>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

export default PagosPendientes;
