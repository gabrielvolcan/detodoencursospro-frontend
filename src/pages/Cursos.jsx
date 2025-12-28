import { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { cursosAPI } from '../services/api';
import CursoCard from '../components/CursoCard';
import './Cursos.css';

const Cursos = () => {
  const [cursos, setCursos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [categorias, setCategorias] = useState([]);
  const [niveles, setNiveles] = useState([]);
  
  const [filtros, setFiltros] = useState({
    categoria: 'Todos',
    nivel: 'Todos',
    busqueda: ''
  });

  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  useEffect(() => {
    cargarMetadata();
  }, []);

  useEffect(() => {
    cargarCursos();
  }, [filtros]);

  const cargarMetadata = async () => {
    try {
      const [categoriasRes, nivelesRes] = await Promise.all([
        cursosAPI.obtenerCategorias(),
        cursosAPI.obtenerNiveles()
      ]);
      setCategorias(['Todos', ...categoriasRes.data]);
      setNiveles(['Todos', ...nivelesRes.data]);
    } catch (error) {
      console.error('Error cargando metadata:', error);
    }
  };

  const cargarCursos = async () => {
    setCargando(true);
    try {
      const params = {};
      if (filtros.categoria !== 'Todos') params.categoria = filtros.categoria;
      if (filtros.nivel !== 'Todos') params.nivel = filtros.nivel;
      if (filtros.busqueda) params.busqueda = filtros.busqueda;

      const { data } = await cursosAPI.obtenerTodos(params);
      setCursos(data);
    } catch (error) {
      console.error('Error cargando cursos:', error);
    } finally {
      setCargando(false);
    }
  };

  const handleBusqueda = (e) => {
    setFiltros({ ...filtros, busqueda: e.target.value });
  };

  const handleFiltro = (tipo, valor) => {
    setFiltros({ ...filtros, [tipo]: valor });
  };

  const limpiarFiltros = () => {
    setFiltros({
      categoria: 'Todos',
      nivel: 'Todos',
      busqueda: ''
    });
  };

  const hayFiltrosActivos = filtros.categoria !== 'Todos' || 
                            filtros.nivel !== 'Todos' || 
                            filtros.busqueda !== '';

  return (
    <div className="cursos-page">
      <div className="cursos-header">
        <div className="container">
          <h1>Catálogo de Cursos</h1>
          <p>Encuentra el curso perfecto para tu nivel y objetivos</p>
        </div>
      </div>

      <div className="container py-4">
        {/* Barra de búsqueda y filtros */}
        <div className="filtros-container">
          <div className="busqueda-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Buscar cursos..."
              value={filtros.busqueda}
              onChange={handleBusqueda}
              className="input-busqueda"
            />
          </div>

          <button 
            className="btn-filtros-mobile"
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
          >
            <Filter size={20} />
            Filtros
          </button>

          <div className={`filtros-panel ${mostrarFiltros ? 'mostrar' : ''}`}>
            <div className="filtro-grupo">
              <label>Categoría</label>
              <div className="filtro-opciones">
                {categorias.map(cat => (
                  <button
                    key={cat}
                    className={`filtro-btn ${filtros.categoria === cat ? 'activo' : ''}`}
                    onClick={() => handleFiltro('categoria', cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="filtro-grupo">
              <label>Nivel</label>
              <div className="filtro-opciones">
                {niveles.map(nivel => (
                  <button
                    key={nivel}
                    className={`filtro-btn ${filtros.nivel === nivel ? 'activo' : ''}`}
                    onClick={() => handleFiltro('nivel', nivel)}
                  >
                    {nivel}
                  </button>
                ))}
              </div>
            </div>

            {hayFiltrosActivos && (
              <button className="btn-limpiar" onClick={limpiarFiltros}>
                <X size={18} />
                Limpiar Filtros
              </button>
            )}
          </div>
        </div>

        {/* Resultados */}
        <div className="cursos-resultados">
          <div className="resultados-header">
            <h2>{cursos.length} {cursos.length === 1 ? 'Curso' : 'Cursos'} Encontrado{cursos.length !== 1 ? 's' : ''}</h2>
          </div>

          {cargando ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Cargando cursos...</p>
            </div>
          ) : cursos.length > 0 ? (
            <div className="grid grid-3">
              {cursos.map(curso => (
                <CursoCard key={curso._id} curso={curso} />
              ))}
            </div>
          ) : (
            <div className="no-resultados">
              <Search size={64} />
              <h3>No se encontraron cursos</h3>
              <p>Intenta ajustar los filtros o buscar con otros términos</p>
              {hayFiltrosActivos && (
                <button className="btn-primary mt-3" onClick={limpiarFiltros}>
                  Ver Todos los Cursos
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cursos;
