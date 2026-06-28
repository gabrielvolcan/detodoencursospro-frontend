// Diálogo de confirmación reutilizable (estilo del panel admin).
// Reemplaza confirm()/prompt() nativos. Si withInput=true pide un texto.
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
    <div className="overlay" onClick={onCancel}>
      <div className="modal sm" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="modal-title">{title}</div>
          <button type="button" className="xbtn" onClick={onCancel}>×</button>
        </div>
        <div className="modal-hr"></div>
        <form onSubmit={handleSubmit}>
          {message && <div className="confirm-msg">{message}</div>}
          {withInput && (
            <div className="field">
              <label>{inputLabel}</label>
              <input className="input" name="valor" type="text" defaultValue={defaultValue} autoFocus />
            </div>
          )}
          <div className="modal-actions">
            <button type="button" className="btn-ghost" onClick={onCancel}>{cancelText}</button>
            <button type="submit" className={danger ? 'btn-danger' : 'btn-green'}>{confirmText}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConfirmDialog;
