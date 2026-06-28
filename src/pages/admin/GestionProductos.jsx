import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Star, Edit2, Trash2 } from 'lucide-react';
import { productosAPI } from '../../services/api';
import { useConfirm } from '../../hooks/useConfirm';
import { useToast } from '../../hooks/useToast';
import ToastContainer from '../../components/ToastContainer';
import Thumb from './components/Thumb';

const GestionProductos = () => {
  const navigate = useNavigate();
  const { confirm, confirmUI } = useConfirm();
  const { toasts, showToast } = useToast();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      setLoading(true);
      const { data } = await productosAPI.obtenerTodosAdmin();
      setProductos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al cargar productos:', error);
      showToast('Error al cargar productos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleDestacado = async (id, destacadoActual) => {
    try {
      await productosAPI.actualizar(id, { destacado: !destacadoActual });
      showToast('Producto actualizado');
      cargarProductos();
    } catch (error) {
      console.error('Error:', error);
      showToast('Error al actualizar', 'error');
    }
  };

  const toggleActivo = async (id, activoActual) => {
    try {
      await productosAPI.actualizar(id, { activo: !activoActual });
      showToast('Estado actualizado');
      cargarProductos();
    } catch (error) {
      console.error('Error:', error);
      showToast('Error al actualizar', 'error');
    }
  };

  const eliminarProducto = async (id) => {
    if (!(await confirm({ title: 'Eliminar producto', message: '¿Estás seguro de eliminar este producto?', confirmText: 'Eliminar', danger: true }))) return;
    try {
      await productosAPI.eliminar(id);
      showToast('Producto eliminado correctamente');
      cargarProductos();
    } catch (error) {
      console.error('Error:', error);
      showToast('Error al eliminar producto', 'error');
    }
  };

  if (loading) {
    return <div className="admin-cargando">Cargando productos...</div>;
  }

  return (
    <section>
      <div className="phead">
        <h1 className="h1">Gestión de Productos Digitales</h1>
        <button className="btn-green" onClick={() => navigate('/admin/producto/nuevo')}><Plus size={18} /> Nuevo Producto</button>
      </div>
      <div className="divider-green"></div>

      <div className="tblwrap">
        <table className="tbl">
          <thead>
            <tr>
              <th>Producto</th><th>Tipo</th><th>Precio USD</th><th>Estado</th><th>Destacado</th><th>Activo</th><th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productos.length === 0 ? (
              <tr><td colSpan="7" className="tabla-vacia">No hay productos registrados. Crea tu primer producto digital.</td></tr>
            ) : (
              productos.map((p, i) => (
                <tr key={p._id}>
                  <td>
                    <div className="tcourse">
                      <Thumb src={p.imagen} title={p.titulo} index={i + 2} />
                      <div>
                        <div className="nm">{p.titulo}</div>
                        <div className="lv">{p.descripcion?.substring(0, 50)}{p.descripcion?.length > 50 ? '…' : ''}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="pill-green">{p.tipo}</span></td>
                  <td className="muted">${p.precioUSD}</td>
                  <td><span className={`badge ${p.gratis ? 'on' : 'pago'}`}>{p.gratis ? 'GRATIS' : 'PAGO'}</span></td>
                  <td>
                    <button className={`star ${p.destacado ? 'on' : ''}`} onClick={() => toggleDestacado(p._id, p.destacado)} title={p.destacado ? 'Quitar destacado' : 'Destacar'}>
                      <Star size={18} fill={p.destacado ? 'currentColor' : 'none'} />
                    </button>
                  </td>
                  <td><button className={`tgl ${p.activo ? 'on' : 'off'}`} onClick={() => toggleActivo(p._id, p.activo)}>{p.activo ? 'ACTIVO' : 'INACTIVO'}</button></td>
                  <td>
                    <div className="acts">
                      <button className="abtn" onClick={() => navigate(`/admin/producto/${p._id}/editar`)} title="Editar"><Edit2 size={17} /></button>
                      <button className="abtn del" onClick={() => eliminarProducto(p._id)} title="Eliminar"><Trash2 size={17} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {confirmUI}
      <ToastContainer toasts={toasts} />
    </section>
  );
};

export default GestionProductos;
