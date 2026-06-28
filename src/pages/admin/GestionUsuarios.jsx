import { Edit2, Trash2 } from 'lucide-react';

const GestionUsuarios = ({ usuarios, onCambiarRol, onEditar, onEliminar }) => (
  <div className="gestion-usuarios">
    <h1>Gestión de Usuarios</h1>

    <div className="usuarios-stats">
      <div className="stat-mini">
        <h3>{usuarios.length}</h3>
        <p>Total Usuarios</p>
      </div>
      <div className="stat-mini">
        <h3>{usuarios.filter((u) => u.rol === 'admin').length}</h3>
        <p>Administradores</p>
      </div>
      <div className="stat-mini">
        <h3>{usuarios.filter((u) => u.cursosComprados.length > 0).length}</h3>
        <p>Con Cursos</p>
      </div>
    </div>

    <div className="usuarios-tabla">
      <table>
        <thead>
          <tr>
            <th>Usuario</th>
            <th>Email</th>
            <th>Teléfono</th>
            <th>Cursos Comprados</th>
            <th>Rol</th>
            <th>Registro</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((usuario) => (
            <tr key={usuario._id}>
              <td>
                <div className="usuario-info">
                  <strong>{usuario.nombre}</strong>
                </div>
              </td>
              <td>{usuario.email}</td>
              <td>{usuario.telefono || '-'}</td>
              <td>
                <span className="badge-cursos">{usuario.cursosComprados.length} cursos</span>
              </td>
              <td>
                <select
                  value={usuario.rol}
                  onChange={(e) => onCambiarRol(usuario._id, e.target.value)}
                  className="select-rol"
                >
                  <option value="usuario">Usuario</option>
                  <option value="admin">Admin</option>
                </select>
              </td>
              <td>{new Date(usuario.createdAt).toLocaleDateString()}</td>
              <td>
                <span className={`estado-badge ${usuario.activo ? 'activo' : 'inactivo'}`}>
                  {usuario.activo ? 'Activo' : 'Inactivo'}
                </span>
              </td>
              <td>
                <div className="acciones">
                  <button className="btn-icon" onClick={() => onEditar(usuario)} title="Editar">
                    <Edit2 size={18} />
                  </button>
                  <button className="btn-icon eliminar" onClick={() => onEliminar(usuario._id)} title="Eliminar">
                    <Trash2 size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default GestionUsuarios;
