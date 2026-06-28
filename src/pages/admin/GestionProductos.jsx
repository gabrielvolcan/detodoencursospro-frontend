import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Star, Lock, Unlock, Edit2, Trash2 } from 'lucide-react';
import { productosAPI } from '../../services/api';
import { useConfirm } from '../../hooks/useConfirm';
import '../Admin.css';

const GestionProductos = () => {
  const navigate = useNavigate();
  const { confirm, confirmUI } = useConfirm();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  useEffect(() => {
    cargarProductos();
  }, []);

  const flash = (tipo, texto) => {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje({ tipo: '', texto: '' }), 3000);
  };

  const cargarProductos = async () => {
    try {
      setLoading(true);
      const { data } = await productosAPI.obtenerTodosAdmin();
      setProductos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al cargar productos:', error);
      setMensaje({ tipo: 'error', texto: 'Error al cargar productos' });
    } finally {
      setLoading(false);
    }
  };

  const toggleDestacado = async (id, destacadoActual) => {
    try {
      await productosAPI.actualizar(id, { destacado: !destacadoActual });
      flash('exito', 'Producto actualizado');
      cargarProductos();
    } catch (error) {
      console.error('Error:', error);
      setMensaje({ tipo: 'error', texto: 'Error al actualizar' });
    }
  };

  const toggleActivo = async (id, activoActual) => {
    try {
      await productosAPI.actualizar(id, { activo: !activoActual });
      flash('exito', 'Estado actualizado');
      cargarProductos();
    } catch (error) {
      console.error('Error:', error);
      setMensaje({ tipo: 'error', texto: 'Error al actualizar' });
    }
  };

  const eliminarProducto = async (id) => {
    if (!(await confirm({ title: 'Eliminar producto', message: '¿Estás seguro de eliminar este producto?', confirmText: 'Eliminar', danger: true }))) return;
    try {
      await productosAPI.eliminar(id);
      flash('exito', 'Producto eliminado correctamente');
      cargarProductos();
    } catch (error) {
      console.error('Error:', error);
      setMensaje({ tipo: 'error', texto: 'Error al eliminar producto' });
    }
  };

  if (loading) {
    return <div className="admin-cargando">Cargando productos...</div>;
  }

  return (
    <div className="gestion-cursos">
      <div className="cursos-header">
        <h1>Gestión de Productos Digitales</h1>
        <button className="btn-crear" onClick={() => navigate('/admin/producto/nuevo')}>
          <Plus size={20} />
          Nuevo Producto
        </button>
      </div>

      {mensaje.texto && (
        <div className={`admin-mensaje ${mensaje.tipo}`}>{mensaje.texto}</div>
      )}

      <div className="cursos-tabla">
        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Tipo</th>
              <th>Precio USD</th>
              <th>Estado</th>
              <th>Destacado</th>
              <th>Activo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productos.length === 0 ? (
              <tr>
                <td colSpan="7" className="tabla-vacia">
                  No hay productos registrados. Crea tu primer producto digital.
                </td>
              </tr>
            ) : (
              productos.map((producto) => (
                <tr key={producto._id}>
                  <td>
                    <div className="curso-tabla-info">
                      {producto.imagen && <img src={producto.imagen} alt={producto.titulo} />}
                      <div>
                        <strong>{producto.titulo}</strong>
                        <span>{producto.descripcion?.substring(0, 50)}...</span>
                      </div>
                    </div>
                  </td>
                  <td><span className="tipo-badge">{producto.tipo}</span></td>
                  <td>${producto.precioUSD}</td>
                  <td>
                    <span className={`estado-badge ${producto.gratis ? 'activo' : 'inactivo'}`}>
                      {producto.gratis ? 'GRATIS' : 'PAGO'}
                    </span>
                  </td>
                  <td>
                    <button
                      className={`btn-icon ${producto.destacado ? 'destacado-activo' : ''}`}
                      onClick={() => toggleDestacado(producto._id, producto.destacado)}
                      title={producto.destacado ? 'Quitar destacado' : 'Destacar producto'}
                    >
                      <Star size={18} fill={producto.destacado ? 'currentColor' : 'none'} />
                    </button>
                  </td>
                  <td>
                    <span className={`estado-badge ${producto.activo ? 'activo' : 'inactivo'}`}>
                      {producto.activo ? 'ACTIVO' : 'INACTIVO'}
                    </span>
                  </td>
                  <td>
                    <div className="acciones">
                      <button
                        className="btn-icon"
                        onClick={() => toggleActivo(producto._id, producto.activo)}
                        title={producto.activo ? 'Desactivar' : 'Activar'}
                      >
                        {producto.activo ? <Lock size={18} /> : <Unlock size={18} />}
                      </button>
                      <button
                        className="btn-icon"
                        onClick={() => navigate(`/admin/producto/${producto._id}/editar`)}
                        title="Editar producto"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        className="btn-icon eliminar"
                        onClick={() => eliminarProducto(producto._id)}
                        title="Eliminar producto"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {confirmUI}
    </div>
  );
};

export default GestionProductos;
