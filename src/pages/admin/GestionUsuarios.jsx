import { Edit2, Trash2 } from 'lucide-react';

const GestionUsuarios = ({ usuarios, onCambiarRol, onEditar, onEliminar }) => (
  <section>
    <h1 className="h1">Gestión de Usuarios</h1>

    <div className="statgrid3">
      <div className="statcard center">
        <div className="sval">{usuarios.length}</div>
        <div className="slabel">Total Usuarios</div>
      </div>
      <div className="statcard center">
        <div className="sval">{usuarios.filter((u) => u.rol === 'admin').length}</div>
        <div className="slabel">Administradores</div>
      </div>
      <div className="statcard center">
        <div className="sval">{usuarios.filter((u) => u.cursosComprados.length > 0).length}</div>
        <div className="slabel">Con Cursos</div>
      </div>
    </div>

    <div className="tblwrap" style={{ marginTop: 22 }}>
      <table className="tbl">
        <thead>
          <tr>
            <th>Usuario</th><th>Email</th><th>Teléfono</th><th>Cursos Comprados</th>
            <th>Rol</th><th>Registro</th><th>Estado</th><th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((u) => (
            <tr key={u._id}>
              <td><b style={{ color: '#fff' }}>{u.nombre}</b></td>
              <td className="muted">{u.email}</td>
              <td className="muted">{u.telefono || '-'}</td>
              <td><span className="pill-green">{u.cursosComprados.length} cursos</span></td>
              <td>
                <select className="rolesel" value={u.rol} onChange={(e) => onCambiarRol(u._id, e.target.value)}>
                  <option value="usuario">Usuario</option>
                  <option value="admin">Admin</option>
                </select>
              </td>
              <td className="muted">{new Date(u.createdAt).toLocaleDateString()}</td>
              <td><span className={`badge ${u.activo ? 'on' : 'off'}`}>{u.activo ? 'Activo' : 'Inactivo'}</span></td>
              <td>
                <div className="acts">
                  <button className="abtn" onClick={() => onEditar(u)} title="Editar"><Edit2 size={17} /></button>
                  <button className="abtn del" onClick={() => onEliminar(u._id)} title="Eliminar"><Trash2 size={17} /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>
);

export default GestionUsuarios;
