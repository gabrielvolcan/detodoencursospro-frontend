// frontend/src/pages/GestionProductos.jsx
import { useState, useEffect } from 'react';
import { productosAPI } from '../services/api';
import './Admin.css';

const GestionProductos = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      setLoading(true);
      const data = await productosAPI.obtenerTodosAdmin();
      setProductos(data);
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
      setMensaje({ tipo: 'exito', texto: 'Producto actualizado' });
      setTimeout(() => setMensaje({ tipo: '', texto: '' }), 3000);
      cargarProductos();
    } catch (error) {
      console.error('Error:', error);
      setMensaje({ tipo: 'error', texto: 'Error al actualizar' });
    }
  };

  const toggleActivo = async (id, activoActual) => {
    try {
      await productosAPI.actualizar(id, { activo: !activoActual });
      setMensaje({ tipo: 'exito', texto: 'Estado actualizado' });
      setTimeout(() => setMensaje({ tipo: '', texto: '' }), 3000);
      cargarProductos();
    } catch (error) {
      console.error('Error:', error);
      setMensaje({ tipo: 'error', texto: 'Error al actualizar' });
    }
  };

  const eliminarProducto = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este producto?')) return;
    
    try {
      await productosAPI.eliminar(id);
      setMensaje({ tipo: 'exito', texto: 'Producto eliminado correctamente' });
      setTimeout(() => setMensaje({ tipo: '', texto: '' }), 3000);
      cargarProductos();
    } catch (error) {
      console.error('Error:', error);
      setMensaje({ tipo: 'error', texto: 'Error al eliminar producto' });
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--gris-claro)' }}>
        Cargando productos...
      </div>
    );
  }

  return (
    <div className="gestion-cursos">
      <div className="cursos-header">
        <h1>Gestión de Productos Digitales</h1>
        <button 
          className="btn-crear"
          onClick={() => window.location.href = '/admin/productos/nuevo'}
        >
          + Nuevo Producto
        </button>
      </div>

      {mensaje.texto && (
        <div style={{
          padding: '15px 20px',
          marginBottom: '20px',
          borderRadius: '8px',
          background: mensaje.tipo === 'exito' ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255, 68, 68, 0.1)',
          border: `1px solid ${mensaje.tipo === 'exito' ? 'var(--acento)' : '#ff4444'}`,
          color: mensaje.tipo === 'exito' ? 'var(--acento)' : '#ff4444',
          fontWeight: '500'
        }}>
          {mensaje.texto}
        </div>
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
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--gris-claro)' }}>
                  No hay productos registrados. Crea tu primer producto digital.
                </td>
              </tr>
            ) : (
              productos.map(producto => (
                <tr key={producto._id}>
                  <td>
                    <div className="curso-tabla-info">
                      {producto.imagenURL && (
                        <img 
                          src={producto.imagenURL} 
                          alt={producto.titulo}
                          style={{ width: '60px', height: '45px', objectFit: 'cover', borderRadius: '6px' }}
                        />
                      )}
                      <div>
                        <strong>{producto.titulo}</strong>
                        <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--gris-claro)', marginTop: '4px' }}>
                          {producto.descripcionCorta?.substring(0, 50)}...
                        </span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{
                      background: 'var(--gris-oscuro)',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      color: 'var(--acento)',
                      textTransform: 'capitalize'
                    }}>
                      {producto.tipo}
                    </span>
                  </td>
                  <td>
                    <span style={{ color: 'var(--blanco)', fontWeight: '600' }}>
                      ${producto.precioUSD}
                    </span>
                  </td>
                  <td>
                    <span className={`estado-badge ${producto.gratis ? 'activo' : 'inactivo'}`}>
                      {producto.gratis ? 'GRATIS' : 'PAGO'}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn-icon"
                      onClick={() => toggleDestacado(producto._id, producto.destacado)}
                      style={{
                        background: producto.destacado ? 'var(--acento)' : 'var(--gris-oscuro)',
                        color: producto.destacado ? 'var(--negro)' : 'var(--gris-claro)',
                        fontSize: '1.2rem',
                        padding: '8px 12px'
                      }}
                      title={producto.destacado ? 'Quitar destacado' : 'Destacar producto'}
                    >
                      {producto.destacado ? '★' : '☆'}
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
                        {producto.activo ? '🔒' : '🔓'}
                      </button>
                      <button 
                        className="btn-icon"
                        onClick={() => window.location.href = `/admin/productos/editar/${producto._id}`}
                        title="Editar producto"
                      >
                        ✏️
                      </button>
                      <button 
                        className="btn-icon eliminar"
                        onClick={() => eliminarProducto(producto._id)}
                        title="Eliminar producto"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GestionProductos;