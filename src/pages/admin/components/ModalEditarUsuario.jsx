import { X } from 'lucide-react';

const ModalEditarUsuario = ({ usuario, onClose, onSubmit }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header">
        <h2>Editar Usuario</h2>
        <button onClick={onClose}><X size={24} /></button>
      </div>
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label>Nombre</label>
          <input type="text" name="nombre" defaultValue={usuario.nombre} required />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input type="email" name="email" defaultValue={usuario.email} required />
        </div>
        <div className="form-group">
          <label>Teléfono</label>
          <input type="text" name="telefono" defaultValue={usuario.telefono} />
        </div>
        <div className="form-group">
          <label>País</label>
          <input type="text" name="pais" defaultValue={usuario.pais} />
        </div>
        <div className="modal-actions">
          <button type="button" onClick={onClose} className="btn-cancelar">Cancelar</button>
          <button type="submit" className="btn-guardar">Guardar Cambios</button>
        </div>
      </form>
    </div>
  </div>
);

export default ModalEditarUsuario;
