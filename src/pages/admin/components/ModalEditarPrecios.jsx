import { X } from 'lucide-react';

const CAMPOS = [
  { name: 'precio_internacional', label: '🌍 Internacional (USD)', step: '0.01', valor: (c) => c.precioUSD || c.precios?.internacional?.monto || 0 },
  { name: 'precio_peru', label: '🇵🇪 Perú (PEN)', step: '0.01', valor: (c) => c.precios?.peru?.monto || 0 },
  { name: 'precio_chile', label: '🇨🇱 Chile (CLP)', step: '1', valor: (c) => c.precios?.chile?.monto || 0 },
  { name: 'precio_argentina', label: '🇦🇷 Argentina (ARS)', step: '1', valor: (c) => c.precios?.argentina?.monto || 0 },
  { name: 'precio_uruguay', label: '🇺🇾 Uruguay (UYU)', step: '1', valor: (c) => c.precios?.uruguay?.monto || 0 },
  { name: 'precio_venezuela', label: '🇻🇪 Venezuela (VES)', step: '1', valor: (c) => c.precios?.venezuela?.monto || 0 },
];

const ModalEditarPrecios = ({ curso, onClose, onSubmit }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal-content-large" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header">
        <h2>💰 Editar Precios - {curso.titulo}</h2>
        <button onClick={onClose}><X size={24} /></button>
      </div>
      <form onSubmit={onSubmit}>
        <div className="precios-grid">
          {CAMPOS.map((campo) => (
            <div className="form-group" key={campo.name}>
              <label>{campo.label}</label>
              <input type="number" name={campo.name} step={campo.step} defaultValue={campo.valor(curso)} required />
            </div>
          ))}
        </div>
        <div className="precio-ayuda">
          <strong>💡 Tip:</strong> El precio USD se usa como base. Los demás se ajustan según cada país.
        </div>
        <div className="modal-actions">
          <button type="button" onClick={onClose} className="btn-cancelar">Cancelar</button>
          <button type="submit" className="btn-guardar">💾 Guardar Precios</button>
        </div>
      </form>
    </div>
  </div>
);

export default ModalEditarPrecios;
