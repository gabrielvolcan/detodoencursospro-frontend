import { Plus, Edit2, Trash2, Eye, DollarSign } from 'lucide-react';

const GestionCursos = ({ cursos, onCrear, onVer, onEditarPrecios, onEditar, onEliminar }) => (
  <div className="gestion-cursos">
    <div className="cursos-header">
      <h1>Gestión de Cursos</h1>
      <button className="btn-crear" onClick={onCrear}>
        <Plus size={20} />
        Crear Curso
      </button>
    </div>

    <div className="cursos-tabla">
      <table>
        <thead>
          <tr>
            <th>Curso</th>
            <th>Categoría</th>
            <th>Precio (USD)</th>
            <th>Estudiantes</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {cursos.map((curso) => (
            <tr key={curso._id}>
              <td>
                <div className="curso-tabla-info">
                  <img src={curso.imagen} alt={curso.titulo} />
                  <div>
                    <strong>{curso.titulo}</strong>
                    <span>{curso.nivel}</span>
                  </div>
                </div>
              </td>
              <td>{curso.categoria}</td>
              <td>${curso.precioUSD || curso.precio || 0}</td>
              <td>{curso.estudiantes || 0}</td>
              <td>
                <span className={`estado-badge ${curso.activo ? 'activo' : 'inactivo'}`}>
                  {curso.activo ? 'Activo' : 'Inactivo'}
                </span>
              </td>
              <td>
                <div className="acciones">
                  <button className="btn-icon" onClick={() => onVer(curso._id)} title="Ver">
                    <Eye size={18} />
                  </button>
                  <button className="btn-icon" onClick={() => onEditarPrecios(curso)} title="Editar Precios">
                    <DollarSign size={18} />
                  </button>
                  <button className="btn-icon" onClick={() => onEditar(curso._id)} title="Editar">
                    <Edit2 size={18} />
                  </button>
                  <button className="btn-icon eliminar" onClick={() => onEliminar(curso._id)} title="Eliminar">
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

export default GestionCursos;
