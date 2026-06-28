const ModalEditarUsuario = ({ usuario, onClose, onSubmit }) => (
  <div className="overlay" onClick={onClose}>
    <div className="modal sm" onClick={(e) => e.stopPropagation()}>
      <div className="modal-head">
        <div className="modal-title">Editar Usuario</div>
        <button type="button" className="xbtn" onClick={onClose}>×</button>
      </div>
      <div className="modal-hr"></div>
      <form onSubmit={onSubmit}>
        <div className="field"><label>Nombre</label><input className="input" name="nombre" defaultValue={usuario.nombre} required /></div>
        <div className="field"><label>Email</label><input className="input" type="email" name="email" defaultValue={usuario.email} required /></div>
        <div className="field"><label>Teléfono</label><input className="input" name="telefono" defaultValue={usuario.telefono} /></div>
        <div className="field"><label>País</label><input className="input" name="pais" defaultValue={usuario.pais} /></div>
        <div className="modal-actions">
          <button type="button" className="btn-ghost" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn-green">Guardar Cambios</button>
        </div>
      </form>
    </div>
  </div>
);

export default ModalEditarUsuario;
