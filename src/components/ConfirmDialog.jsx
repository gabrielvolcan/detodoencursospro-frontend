import { X } from 'lucide-react';

// Diálogo de confirmación reutilizable. Reemplaza confirm()/prompt() nativos.
// Si withInput=true, pide un texto (ej. motivo de rechazo) y lo devuelve en onConfirm.
const ConfirmDialog = ({
  title, message, confirmText = 'Confirmar', cancelText = 'Cancelar',
  danger = false, withInput = false, inputLabel = '', defaultValue = '',
  onConfirm, onCancel,
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (withInput) {
      onConfirm(new FormData(e.target).get('valor'));
    } else {
      onConfirm(true);
    }
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button type="button" onClick={onCancel}><X size={24} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          {message && <p className="confirm-message">{message}</p>}
          {withInput && (
            <div className="form-group">
              <label>{inputLabel}</label>
              <input name="valor" type="text" defaultValue={defaultValue} autoFocus />
            </div>
          )}
          <div className="modal-actions">
            <button type="button" onClick={onCancel} className="btn-cancelar">{cancelText}</button>
            <button type="submit" className={danger ? 'btn-peligro' : 'btn-guardar'}>{confirmText}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConfirmDialog;
