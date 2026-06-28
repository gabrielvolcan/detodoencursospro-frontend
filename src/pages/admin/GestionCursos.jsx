import { Plus, Eye, DollarSign, Edit2, Trash2 } from 'lucide-react';
import Thumb from './components/Thumb';

const GestionCursos = ({ cursos, onCrear, onVer, onEditarPrecios, onEditar, onEliminar }) => (
  <section>
    <div className="phead">
      <h1 className="h1">Gestión de Cursos</h1>
      <button className="btn-green" onClick={onCrear}><Plus size={18} /> Crear Curso</button>
    </div>
    <div className="divider-green"></div>

    <div className="tblwrap">
      <table className="tbl">
        <thead>
          <tr>
            <th>Curso</th><th>Categoría</th><th>Precio (USD)</th><th>Estudiantes</th><th>Estado</th><th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {cursos.map((curso, i) => (
            <tr key={curso._id}>
              <td>
                <div className="tcourse">
                  <Thumb src={curso.imagen} title={curso.titulo} index={i} />
                  <div>
                    <div className="nm">{curso.titulo}</div>
                    <div className="lv">{curso.nivel}</div>
                  </div>
                </div>
              </td>
              <td className="muted">{curso.categoria}</td>
              <td className="muted">${curso.precioUSD || curso.precio || 0}</td>
              <td className="muted">{curso.estudiantes || 0}</td>
              <td><span className={`badge ${curso.activo ? 'on' : 'off'}`}>{curso.activo ? 'Activo' : 'Inactivo'}</span></td>
              <td>
                <div className="acts">
                  <button className="abtn" onClick={() => onVer(curso._id)} title="Ver"><Eye size={17} /></button>
                  <button className="abtn" onClick={() => onEditarPrecios(curso)} title="Editar precios"><DollarSign size={17} /></button>
                  <button className="abtn" onClick={() => onEditar(curso._id)} title="Editar"><Edit2 size={17} /></button>
                  <button className="abtn del" onClick={() => onEliminar(curso._id)} title="Eliminar"><Trash2 size={17} /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>
);

export default GestionCursos;
