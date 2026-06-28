const CAMPOS = [
  { name: 'precio_internacional', label: '🌎 Internacional (USD)', step: '0.01', valor: (c) => c.precioUSD || c.precios?.internacional?.monto || 0 },
  { name: 'precio_peru', label: '🇵🇪 Perú (PEN)', step: '0.01', valor: (c) => c.precios?.peru?.monto || 0 },
  { name: 'precio_chile', label: '🇨🇱 Chile (CLP)', step: '1', valor: (c) => c.precios?.chile?.monto || 0 },
  { name: 'precio_argentina', label: '🇦🇷 Argentina (ARS)', step: '1', valor: (c) => c.precios?.argentina?.monto || 0 },
  { name: 'precio_uruguay', label: '🇺🇾 Uruguay (UYU)', step: '1', valor: (c) => c.precios?.uruguay?.monto || 0 },
  { name: 'precio_venezuela', label: '🇻🇪 Venezuela (VES)', step: '1', valor: (c) => c.precios?.venezuela?.monto || 0 },
];

const ModalEditarPrecios = ({ curso, onClose, onSubmit }) => (
  <div className="overlay" onClick={onClose}>
    <div className="modal" onClick={(e) => e.stopPropagation()}>
      <div className="modal-head">
        <div className="modal-title">💰 Editar Precios - {curso.titulo}</div>
        <button type="button" className="xbtn" onClick={onClose}>×</button>
      </div>
      <div className="modal-hr"></div>
      <form onSubmit={onSubmit}>
        <div className="pricegrid">
          {CAMPOS.map((campo) => (
            <div key={campo.name}>
              <div className="pl">{campo.label}</div>
              <input className="input" type="number" name={campo.name} step={campo.step} defaultValue={campo.valor(curso)} required />
            </div>
          ))}
        </div>
        <div className="tip">💡 <div><b>Tip:</b> El precio USD se usa como base. Los demás se ajustan según cada país.</div></div>
        <div className="modal-actions">
          <button type="button" className="btn-ghost" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn-green">💾 Guardar Precios</button>
        </div>
      </form>
    </div>
  </div>
);

export default ModalEditarPrecios;
