import { X } from 'lucide-react';
import { formatMonto } from '../../../utils/formato';

const ModalDetalleVenta = ({ venta, onClose, comprobanteCargando, onVerComprobante }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal-content-large" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header">
        <h2>Detalle de Venta #{venta._id.slice(-6)}</h2>
        <button onClick={onClose}><X size={24} /></button>
      </div>
      <div className="detalle-venta">
        <div className="detalle-section">
          <h3>Cliente</h3>
          <p><strong>Nombre:</strong> {venta.usuario?.nombre}</p>
          <p><strong>Email:</strong> {venta.usuario?.email}</p>
          <p><strong>Teléfono:</strong> {venta.usuario?.telefono}</p>
        </div>
        <div className="detalle-section">
          <h3>Pago</h3>
          <p><strong>Total:</strong> {formatMonto(venta.total, venta.moneda)}</p>
          <p><strong>Método:</strong> {venta.metodoPago?.nombre}</p>
          <p><strong>Estado:</strong> <span className={`estado-badge ${venta.estadoPago}`}>{venta.estadoPago}</span></p>
          <p><strong>Fecha:</strong> {new Date(venta.createdAt).toLocaleString()}</p>
        </div>
        <div className="detalle-section">
          <h3>Cursos</h3>
          {venta.cursos.map((item) => (
            <div key={item._id} className="curso-detalle">
              <p>{item.curso?.titulo} - ${item.precio}</p>
            </div>
          ))}
        </div>
        {venta.comprobante?.url && (
          <div className="detalle-section">
            <h3>Comprobante</h3>
            <button
              type="button"
              onClick={() => onVerComprobante(venta._id)}
              disabled={comprobanteCargando === venta._id}
              className="btn-ver-comprobante"
            >
              {comprobanteCargando === venta._id ? '⏳ Cargando...' : '📸 Ver Comprobante'}
            </button>
          </div>
        )}
      </div>
    </div>
  </div>
);

export default ModalDetalleVenta;
