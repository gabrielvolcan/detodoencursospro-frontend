import { FileText } from 'lucide-react';
import { formatMonto } from '../../../utils/formato';

const ModalDetalleVenta = ({ venta, onClose, comprobanteCargando, onVerComprobante }) => (
  <div className="overlay" onClick={onClose}>
    <div className="modal" onClick={(e) => e.stopPropagation()}>
      <div className="modal-head">
        <div className="modal-title">Detalle de Venta #{venta._id.slice(-6)}</div>
        <button type="button" className="xbtn" onClick={onClose}>×</button>
      </div>
      <div className="modal-hr"></div>

      <div className="msec">
        <div className="msec-h">Cliente</div>
        <div className="kv"><b>Nombre:</b><span>{venta.usuario?.nombre}</span></div>
        <div className="kv"><b>Email:</b><span>{venta.usuario?.email}</span></div>
        <div className="kv"><b>Teléfono:</b><span>{venta.usuario?.telefono || '—'}</span></div>
      </div>

      <div className="msec">
        <div className="msec-h">Pago</div>
        <div className="kv"><b>Total:</b><span>{formatMonto(venta.total, venta.moneda)}</span></div>
        <div className="kv"><b>Método:</b><span>{venta.metodoPago?.nombre}</span></div>
        <div className="kv"><b>Estado:</b><span className="pill-green">{venta.estadoPago}</span></div>
        <div className="kv"><b>Fecha:</b><span>{new Date(venta.createdAt).toLocaleString()}</span></div>
      </div>

      <div className="msec">
        <div className="msec-h">Cursos</div>
        {venta.cursos?.length ? venta.cursos.map((item) => (
          <div className="kv" key={item._id}><span>{item.curso?.titulo} - ${item.precio}</span></div>
        )) : <div className="muted">Sin cursos asociados a esta venta.</div>}
      </div>

      {venta.comprobante?.url && (
        <div className="msec">
          <div className="msec-h">Comprobante</div>
          <button
            type="button"
            className="btn-ghost"
            style={{ height: 44, display: 'inline-flex', alignItems: 'center', gap: 8 }}
            onClick={() => onVerComprobante(venta._id)}
            disabled={comprobanteCargando === venta._id}
          >
            <FileText size={17} /> {comprobanteCargando === venta._id ? 'Cargando...' : 'Ver Comprobante'}
          </button>
        </div>
      )}
    </div>
  </div>
);

export default ModalDetalleVenta;
