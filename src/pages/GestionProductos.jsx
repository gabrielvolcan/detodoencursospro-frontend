import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productosAPI } from '../../services/api';
import { Plus, Eye, Edit2, Trash2, DollarSign, Star, Gift, Package } from 'lucide-react';
import '../Admin.css';

const GestionProductos = () => {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtro, setFiltro] = useState('todos');

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      setCargando(true);
      const { data } = await productosAPI.obtenerTodosAdmin();
      setProductos(data);
    } catch (error) {
      console.error('Error cargando productos:', error);
    } finally {
      setCargando(false);
    }
  };

  const toggleActivo = async (id, activo) => {
    try {
      await productosAPI.actualizar(id, { activo: !activo });
      cargarProductos();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const toggleDestacado = async (id, destacado) => {
    try {
      await productosAPI.actualizar(id, { destacado: !destacado });
      cargarProductos();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const toggleGratis = async (id, gratis) => {
    try {
      await productosAPI.actualizar(id, { 
        gratis: !gratis,
        precioUSD: gratis ? 0 : 0
      });
      cargarProductos();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const eliminarProducto = async (id) => {
    if (!window.confirm('¿Eliminar este producto?')) return;
    
    try {
      await productosAPI.eliminar(id);
      cargarProductos();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const productosFiltrados = productos.filter(p => {
    if (filtro === 'activos') return p.activo;
    if (filtro === 'inactivos') return !p.activo;
    if (filtro === 'destacados') return p.destacado;
    if (filtro === 'gratis') return p.gratis;
    return true;
  });

  const tipoIcono = (tipo) => {
    const iconos = {
      libro: '📚', ebook: '📖', curso: '🎓', plantilla: '📄',
      guia: '📋', software: '💻', recurso: '🎨', bundle: '📦'
    };
    return iconos[tipo] || '📦';
  };

  if (cargando) return <div className="loading">Cargando...</div>;

  return (
    <div className="gestion-productos">
      <div className="cursos-header">
        <h1>Gestión de Productos</h1>
        <button onClick={() => navigate('/admin/productos/crear')} className="btn-crear">
          <Plus size={20} />
          Crear Producto
        </button>
      </div>

      {/* Filtros */}
      <div className="filtros-ventas">
        <button 
          className={`filtro-btn ${filtro === 'todos' ? 'activo' : ''}`}
          onClick={() => setFiltro('todos')}
        >
          Todos ({productos.length})
        </button>
        <button 
          className={`filtro-btn ${filtro === 'activos' ? 'activo' : ''}`}
          onClick={() => setFiltro('activos')}
        >
          Activos ({productos.filter(p => p.activo).length})
        </button>
        <button 
          className={`filtro-btn ${filtro === 'inactivos' ? 'activo' : ''}`}
          onClick={() => setFiltro('inactivos')}
        >
          Inactivos ({productos.filter(p => !p.activo).length})
        </button>
        <button 
          className={`filtro-btn ${filtro === 'destacados' ? 'activo' : ''}`}
          onClick={() => setFiltro('destacados')}
        >
          <Star size={16} /> Destacados ({productos.filter(p => p.destacado).length})
        </button>
        <button 
          className={`filtro-btn ${filtro === 'gratis' ? 'activo' : ''}`}
          onClick={() => setFiltro('gratis')}
        >
          <Gift size={16} /> Gratis ({productos.filter(p => p.gratis).length})
        </button>
      </div>

      {/* Tabla */}
      {productosFiltrados.length === 0 ? (
        <div className="sin-datos">
          <Package size={64} />
          <h3>No hay productos</h3>
          <button onClick={() => navigate('/admin/productos/crear')} className="btn-crear">
            <Plus size={20} />
            Crear Producto
          </button>
        </div>
      ) : (
        <div className="cursos-tabla">
          <table>
            <thead>
              <tr>
                <th>PRODUCTO</th>
                <th>CATEGORÍA</th>
                <th>PRECIO (USD)</th>
                <th>COMPRADORES</th>
                <th>ESTADO</th>
                <th>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {productosFiltrados.map(producto => (
                <tr key={producto._id}>
                  <td>
                    <div className="curso-tabla-info">
                      <img src={producto.imagen} alt={producto.titulo} />
                      <div>
                        <strong>{producto.titulo}</strong>
                        <span>{tipoIcono(producto.tipo)} {producto.tipo}</span>
                      </div>
                    </div>
                  </td>
                  <td>{producto.categoria}</td>
                  <td>
                    {producto.gratis ? (
                      <span className="estado-badge activo">GRATIS</span>
                    ) : (
                      <span style={{ color: 'var(--acento)', fontWeight: 'bold' }}>
                        ${producto.precioUSD}
                      </span>
                    )}
                  </td>
                  <td>
                    <span className="badge-cursos">
                      {producto.totalCompradores || 0}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span className={`estado-badge ${producto.activo ? 'activo' : 'inactivo'}`}>
                        {producto.activo ? 'Activo' : 'Inactivo'}
                      </span>
                      {producto.destacado && (
                        <span className="estado-badge" style={{ 
                          background: 'rgba(255, 193, 7, 0.2)', 
                          color: '#ffc107' 
                        }}>
                          <Star size={12} /> Destacado
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="acciones">
                      <button 
                        className="btn-icon"
                        onClick={() => window.open(`/producto/${producto._id}`, '_blank')}
                        title="Ver"
                      >
                        <Eye size={18} />
                      </button>

                      <button 
                        className={`btn-icon ${producto.destacado ? 'destacado' : ''}`}
                        onClick={() => toggleDestacado(producto._id, producto.destacado)}
                        title="Destacado"
                        style={producto.destacado ? { 
                          background: 'rgba(255, 193, 7, 0.2)', 
                          color: '#ffc107' 
                        } : {}}
                      >
                        <Star size={18} />
                      </button>

                      <button 
                        className={`btn-icon ${producto.gratis ? 'gratis' : ''}`}
                        onClick={() => toggleGratis(producto._id, producto.gratis)}
                        title="Gratis"
                      >
                        <Gift size={18} />
                      </button>

                      <button 
                        className="btn-icon"
                        onClick={() => navigate(`/admin/productos/editar/${producto._id}`)}
                        title="Editar"
                      >
                        <Edit2 size={18} />
                      </button>

                      <button 
                        className="btn-icon eliminar"
                        onClick={() => eliminarProducto(producto._id)}
                        title="Eliminar"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default GestionProductos;