import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ProductoCard from '../components/ProductoCard';
import { productosAPI } from '../services/api';
import { 
  Search, Filter, SlidersHorizontal, Grid, List,
  BookOpen, FileText, Package, Download, Palette, Code
} from 'lucide-react';
import './Productos.css';

const Productos = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [productos, setProductos] = useState([]);
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  
  // Filtros
  const [busqueda, setBusqueda] = useState('');
  const [tipoSeleccionado, setTipoSeleccionado] = useState(searchParams.get('tipo') || 'todos');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('todas');
  const [ordenamiento, setOrdenamiento] = useState('recientes');
  const [vistaGrid, setVistaGrid] = useState(true);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  // Categorías disponibles
  const [categorias, setCategorias] = useState([]);
  
  // Tipos de productos
  const tiposProducto = [
    { valor: 'todos', label: 'Todos los productos', icono: Package },
    { valor: 'curso', label: 'Cursos', icono: BookOpen },
    { valor: 'libro', label: 'Libros PDF', icono: FileText },
    { valor: 'ebook', label: 'Ebooks', icono: BookOpen },
    { valor: 'plantilla', label: 'Plantillas', icono: Palette },
    { valor: 'guia', label: 'Guías', icono: FileText },
    { valor: 'software', label: 'Software', icono: Code },
    { valor: 'recurso', label: 'Recursos', icono: Package }
  ];

  useEffect(() => {
    cargarProductos();
  }, []);

  useEffect(() => {
    filtrarProductos();
  }, [productos, busqueda, tipoSeleccionado, categoriaSeleccionada, ordenamiento]);

  const cargarProductos = async () => {
    try {
      setCargando(true);
      const response = await productosAPI.obtenerTodos();
      
      // 🔍 Debug: ver qué estructura devuelve el backend
      console.log('Respuesta completa:', response);
      console.log('Response.data:', response.data);
      
      // ✅ CORRECCIÓN: Asegurarse de que siempre sea un array
      let productosData = [];
      
      if (Array.isArray(response.data)) {
        // Si response.data ya es un array
        productosData = response.data;
      } else if (response.data && Array.isArray(response.data.productos)) {
        // Si viene como { productos: [...] }
        productosData = response.data.productos;
      } else if (response.data && Array.isArray(response.data.data)) {
        // Si viene como { data: [...] }
        productosData = response.data.data;
      } else {
        // Si no es ninguno de los casos anteriores
        console.warn('Formato de respuesta inesperado:', response.data);
        productosData = [];
      }
      
      setProductos(productosData);
      
      // Extraer categorías únicas
      const categoriasUnicas = [...new Set(productosData.map(p => p.categoria))].filter(Boolean);
      setCategorias(categoriasUnicas);
      
    } catch (error) {
      console.error('Error cargando productos:', error);
      setError('Error al cargar productos');
      setProductos([]); // ✅ Asegurar que sea array vacío en caso de error
    } finally {
      setCargando(false);
    }
  };

  const filtrarProductos = () => {
    let resultado = [...productos];

    // Filtrar por búsqueda
    if (busqueda.trim()) {
      resultado = resultado.filter(p => 
        p.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.descripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.categoria?.toLowerCase().includes(busqueda.toLowerCase())
      );
    }

    // Filtrar por tipo
    if (tipoSeleccionado !== 'todos') {
      resultado = resultado.filter(p => p.tipo === tipoSeleccionado);
    }

    // Filtrar por categoría
    if (categoriaSeleccionada !== 'todas') {
      resultado = resultado.filter(p => p.categoria === categoriaSeleccionada);
    }

    // Ordenar
    switch (ordenamiento) {
      case 'recientes':
        resultado.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'antiguos':
        resultado.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'precio-asc':
        resultado.sort((a, b) => a.precioUSD - b.precioUSD);
        break;
      case 'precio-desc':
        resultado.sort((a, b) => b.precioUSD - a.precioUSD);
        break;
      case 'populares':
        resultado.sort((a, b) => (b.estudiantes || 0) - (a.estudiantes || 0));
        break;
      case 'valoracion':
        resultado.sort((a, b) => (b.valoracion?.promedio || 0) - (a.valoracion?.promedio || 0));
        break;
      default:
        break;
    }

    setProductosFiltrados(resultado);
  };

  const cambiarTipo = (tipo) => {
    setTipoSeleccionado(tipo);
    setSearchParams({ tipo: tipo });
  };

  if (cargando) {
    return (
      <div className="productos-loading">
        <div className="spinner"></div>
        <p>Cargando productos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="productos-error">
        <p>{error}</p>
        <button onClick={cargarProductos}>Reintentar</button>
      </div>
    );
  }

  return (
    <div className="productos-page">
      {/* ========================================
          HERO SECTION
      ======================================== */}
      <section className="productos-hero">
        <div className="container">
          <h1>Productos Digitales</h1>
          <p>Cursos, libros, plantillas y más recursos para ti</p>
        </div>
      </section>

      {/* ========================================
          FILTROS Y BÚSQUEDA
      ======================================== */}
      <section className="productos-controles">
        <div className="container">
          {/* Barra de búsqueda */}
          <div className="buscador">
            <Search size={20} />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          {/* Filtros rápidos por tipo */}
          <div className="tipos-filtros">
            {tiposProducto.map(tipo => {
              const Icono = tipo.icono;
              return (
                <button
                  key={tipo.valor}
                  className={`tipo-btn ${tipoSeleccionado === tipo.valor ? 'activo' : ''}`}
                  onClick={() => cambiarTipo(tipo.valor)}
                >
                  <Icono size={18} />
                  <span>{tipo.label}</span>
                </button>
              );
            })}
          </div>

          {/* Controles adicionales */}
          <div className="controles-adicionales">
            <button 
              className="btn-filtros"
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
            >
              <SlidersHorizontal size={18} />
              Filtros
            </button>

            <select 
              value={ordenamiento}
              onChange={(e) => setOrdenamiento(e.target.value)}
              className="select-orden"
            >
              <option value="recientes">Más recientes</option>
              <option value="antiguos">Más antiguos</option>
              <option value="precio-asc">Precio: menor a mayor</option>
              <option value="precio-desc">Precio: mayor a menor</option>
              <option value="populares">Más populares</option>
              <option value="valoracion">Mejor valorados</option>
            </select>

            <div className="vista-toggle">
              <button 
                className={vistaGrid ? 'activo' : ''}
                onClick={() => setVistaGrid(true)}
              >
                <Grid size={18} />
              </button>
              <button 
                className={!vistaGrid ? 'activo' : ''}
                onClick={() => setVistaGrid(false)}
              >
                <List size={18} />
              </button>
            </div>
          </div>

          {/* Panel de filtros avanzados */}
          {mostrarFiltros && (
            <div className="filtros-avanzados">
              <div className="filtro-grupo">
                <label>Categoría</label>
                <select 
                  value={categoriaSeleccionada}
                  onChange={(e) => setCategoriaSeleccionada(e.target.value)}
                >
                  <option value="todas">Todas las categorías</option>
                  {categorias.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <button 
                className="btn-limpiar-filtros"
                onClick={() => {
                  setBusqueda('');
                  setTipoSeleccionado('todos');
                  setCategoriaSeleccionada('todas');
                  setOrdenamiento('recientes');
                }}
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ========================================
          RESULTADOS
      ======================================== */}
      <section className="productos-resultados">
        <div className="container">
          <div className="resultados-info">
            <p>
              {productosFiltrados.length} producto{productosFiltrados.length !== 1 ? 's' : ''} encontrado{productosFiltrados.length !== 1 ? 's' : ''}
            </p>
          </div>

          {productosFiltrados.length === 0 ? (
            <div className="sin-resultados">
              <Package size={64} />
              <h3>No se encontraron productos</h3>
              <p>Intenta cambiar los filtros o la búsqueda</p>
              <button onClick={() => {
                setBusqueda('');
                setTipoSeleccionado('todos');
                setCategoriaSeleccionada('todas');
              }}>
                Ver todos los productos
              </button>
            </div>
          ) : (
            <div className={`productos-grid ${vistaGrid ? 'grid' : 'lista'}`}>
              {productosFiltrados.map(producto => (
                <ProductoCard key={producto._id} producto={producto} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Productos;