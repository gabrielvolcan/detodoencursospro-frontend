import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Play, Award, Clock, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePais } from '../context/PaisContext';
import axios from '../services/api';
import './MisCursos.css';

const MisCursos = () => {
  const { estaAutenticado, usuario } = useAuth();
  const { obtenerPrecio } = usePais();
  const navigate = useNavigate();
  const [cursos, setCursos] = useState([]);
  const [todosLosCursos, setTodosLosCursos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!estaAutenticado) {
      navigate('/login');
      return;
    }
    cargarDatos();
  }, [estaAutenticado]);

  const cargarDatos = async () => {
    try {
      // Cargar mis cursos
      const { data: misCursosData } = await axios.get('/auth/usuarios/mis-cursos');
      console.log('✅ Cursos cargados:', misCursosData);
      setCursos(misCursosData);

      // Cargar todos los cursos para la recomendación
      const { data: todosData } = await axios.get('/cursos');
      setTodosLosCursos(todosData);
    } catch (error) {
      console.error('❌ Error cargando datos:', error);
      setCursos([]);
      setTodosLosCursos([]);
    } finally {
      setCargando(false);
    }
  };

  const calcularProgreso = (curso) => {
    if (!curso.progresoVideos || curso.progresoVideos.length === 0) return 0;
    
    let totalVideos = 0;
    if (curso.curso.temario && curso.curso.temario.length > 0) {
      curso.curso.temario.forEach(modulo => {
        if (modulo.temas && modulo.temas.length > 0) {
          totalVideos += modulo.temas.length;
        }
      });
    }
    
    if (totalVideos === 0) return 0;
    
    const videosVistos = curso.progresoVideos.length;
    return Math.round((videosVistos / totalVideos) * 100);
  };

  // Verificar si el usuario tiene los prompts
  const tienePrompts = cursos.some(c => 
    c.curso?.titulo?.toLowerCase().includes('prompts') ||
    c.curso?.titulo?.toLowerCase().includes('30 prompts')
  );

  // Buscar el curso de IA
  const cursoIA = todosLosCursos.find(c => 
    c.titulo.toLowerCase().includes('inteligencia artificial') ||
    c.titulo.toLowerCase().includes('ia') ||
    c.categoria?.toLowerCase().includes('inteligencia artificial')
  );

  if (cargando) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando tus cursos...</p>
      </div>
    );
  }

  return (
    <div className="mis-cursos-page">
      <div className="mis-cursos-container">
        <div className="page-header">
          <div>
            <h1>Mis Cursos</h1>
            <p>Continúa tu aprendizaje donde lo dejaste</p>
          </div>
          <div className="header-stats">
            <div className="stat">
              <strong>{cursos.length}</strong>
              <span>Cursos</span>
            </div>
            <div className="stat">
              <strong>{cursos.filter(c => c.completado).length}</strong>
              <span>Completados</span>
            </div>
          </div>
        </div>

        {/* 🆕 BANNER RECOMENDACIÓN CURSO IA - Solo si tiene los prompts */}
        {tienePrompts && cursoIA && (
          <div className="banner-recomendacion-ia">
            <div className="banner-contenido">
              <div className="banner-icono">
                <Sparkles size={32} />
              </div>
              <div className="banner-texto">
                <h3>¿Listo para el siguiente nivel?</h3>
                <p>Ya dominas los prompts básicos. Aprende a crear prompts profesionales y automatiza tu trabajo con IA.</p>
              </div>
              <button 
                className="btn-banner-curso"
                onClick={() => navigate(`/curso/${cursoIA._id}`)}
              >
                Ver Curso de IA
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {cursos.length === 0 ? (
          <div className="sin-cursos">
            <BookOpen size={64} />
            <h2>No tienes cursos aún</h2>
            <p>Explora nuestro catálogo y comienza tu aprendizaje</p>
            <button className="btn-primary" onClick={() => navigate('/cursos')}>
              Explorar Cursos
            </button>
          </div>
        ) : (
          <div className="cursos-grid">
            {cursos.map(({ curso, completado, progresoVideos, certificado }) => {
              const progreso = calcularProgreso({ curso, progresoVideos });
              
              return (
                <div key={curso._id} className="curso-card-mis">
                  <div className="curso-imagen">
                    <img src={curso.imagen} alt={curso.titulo} />
                    {completado && (
                      <div className="badge-completado">
                        <Award size={20} />
                        Completado
                      </div>
                    )}
                  </div>

                  <div className="curso-content">
                    <h3>{curso.titulo}</h3>
                    <p className="curso-categoria">{curso.categoria} • {curso.nivel}</p>

                    <div className="progreso-bar">
                      <div className="progreso-fill" style={{ width: `${progreso}%` }}></div>
                    </div>
                    <p className="progreso-text">{progreso}% completado</p>

                    <div className="curso-info">
                      <span>
                        <Clock size={16} />
                        {curso.duracion || 'N/A'}
                      </span>
                      <span>
                        <BookOpen size={16} />
                        {curso.temario ? curso.temario.reduce((acc, m) => acc + (m.temas?.length || 0), 0) : 0} clases
                      </span>
                    </div>

                    <div className="curso-acciones">
                      <button 
                        className="btn-continuar"
                        onClick={() => navigate(`/aprender/${curso._id}`)}
                      >
                        <Play size={18} />
                        {progreso > 0 ? 'Continuar' : 'Comenzar'}
                      </button>

                      {completado && certificado?.generado && (
                        <button 
                          className="btn-certificado"
                          onClick={() => navigate(`/certificado/${curso._id}`)}
                        >
                          <Award size={18} />
                          Ver Certificado
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MisCursos;