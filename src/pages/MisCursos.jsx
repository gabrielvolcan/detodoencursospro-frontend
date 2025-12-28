import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Play, Award, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from '../services/api';
import './MisCursos.css';

const MisCursos = () => {
  const { estaAutenticado, usuario } = useAuth();
  const navigate = useNavigate();
  const [cursos, setCursos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!estaAutenticado) {
      navigate('/login');
      return;
    }
    cargarCursos();
  }, [estaAutenticado]);

  const cargarCursos = async () => {
    try {
      // ✅ Obtener compras del usuario
      const { data } = await axios.get('/pagos-manual/mis-compras');
      
      // Filtrar solo las compras aprobadas/completadas con cursos
      const cursosAprobados = data
        .filter(compra => compra.estadoPago === 'aprobado' || compra.estadoPago === 'completado')
        .flatMap(compra => compra.cursos.map(c => ({
          curso: c.curso,
          completado: false,
          progresoVideos: [],
          certificado: { generado: false }
        })));
      
      setCursos(cursosAprobados);
    } catch (error) {
      console.error('Error cargando cursos:', error);
      setCursos([]);
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
      <div className="container py-4">
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

        {cursos.length === 0 ? (
          <div className="sin-cursos">
            <BookOpen size={64} />
            <h2>No tienes cursos aún</h2>
            <p>Tus compras pendientes de aprobación aparecerán aquí una vez aprobadas</p>
            <button className="btn-primary" onClick={() => navigate('/cursos')}>
              Explorar Cursos
            </button>
            <button className="btn-secondary mt-2" onClick={() => navigate('/mis-compras')}>
              Ver Mis Compras
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