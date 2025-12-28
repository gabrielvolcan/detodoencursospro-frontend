import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { PlayCircle, CheckCircle, Circle, ArrowLeft, Award, Clock } from 'lucide-react';
import { cursosAPI } from '../services/api';
import './AprendeCurso.css';

const AprendeCurso = () => {
  const { cursoId } = useParams();
  const navigate = useNavigate();
  
  const [curso, setCurso] = useState(null);
  const [progreso, setProgreso] = useState({ videosVistos: [], completado: false, porcentaje: 0 });
  const [videoActual, setVideoActual] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarCurso();
  }, [cursoId]);

  const cargarCurso = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await cursosAPI.obtenerParaAprender(cursoId, token);
      
      setCurso(data.curso);
      setProgreso(data.progreso);
      
      // Establecer primer video si no hay progreso
      if (data.curso.temario && data.curso.temario.length > 0) {
        const primerModulo = data.curso.temario[0];
        if (primerModulo.temas && primerModulo.temas.length > 0) {
          setVideoActual({
            ...primerModulo.temas[0],
            moduloTitulo: primerModulo.titulo,
            temaId: `${0}-${0}` // moduloIndex-temaIndex
          });
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setError(error.response?.data?.mensaje || 'No tienes acceso a este curso');
      setTimeout(() => navigate('/mis-cursos-aprender'), 2000);
    } finally {
      setCargando(false);
    }
  };

  const marcarComoVisto = async (temaId, marcar = true) => {
    try {
      const token = localStorage.getItem('token');
      
      if (marcar) {
        const { data } = await cursosAPI.marcarVideoVisto(cursoId, temaId, token);
        setProgreso(data.progreso);
      } else {
        const { data } = await cursosAPI.desmarcarVideoVisto(cursoId, temaId, token);
        setProgreso(data.progreso);
      }
    } catch (error) {
      console.error('Error actualizando progreso:', error);
    }
  };

  const seleccionarVideo = (tema, moduloTitulo, moduloIndex, temaIndex) => {
    const temaId = `${moduloIndex}-${temaIndex}`;
    setVideoActual({
      ...tema,
      moduloTitulo,
      temaId
    });
  };

  const extraerVideoId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  if (cargando) {
    return (
      <div className="aprender-loading">
        <div className="spinner"></div>
        <p>Cargando curso...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="aprender-error">
        <p>{error}</p>
        <Link to="/mis-cursos-aprender" className="btn-volver">Volver a Mis Cursos</Link>
      </div>
    );
  }

  if (!curso) return null;

  const videoId = videoActual?.videoUrl ? extraerVideoId(videoActual.videoUrl) : null;

  return (
    <div className="aprender-curso">
      {/* Header */}
      <div className="aprender-header">
        <button onClick={() => navigate('/mis-cursos-aprender')} className="btn-back">
          <ArrowLeft size={20} />
          Volver a Mis Cursos
        </button>
        <div className="header-info">
          <h1>{curso.titulo}</h1>
          <div className="progreso-header">
            <div className="progreso-barra">
              <div 
                className="progreso-fill" 
                style={{ width: `${progreso.porcentaje}%` }}
              ></div>
            </div>
            <span className="progreso-texto">{progreso.porcentaje}% completado</span>
            {progreso.completado && (
              <Link to={`/certificado/${cursoId}`} className="btn-certificado">
                <Award size={18} />
                Ver Certificado
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="aprender-contenido">
        {/* Sidebar - Lista de módulos */}
        <aside className="aprender-sidebar">
          <div className="sidebar-header">
            <h3>Contenido del Curso</h3>
            <p>{progreso.videosVistos.length} / {contarTotalTemas(curso)} videos</p>
          </div>
          
          <div className="modulos-lista">
            {curso.temario.map((modulo, moduloIndex) => (
              <div key={moduloIndex} className="modulo">
                <h4 className="modulo-titulo">
                  {modulo.titulo}
                </h4>
                <div className="temas-lista">
                  {modulo.temas.map((tema, temaIndex) => {
                    const temaId = `${moduloIndex}-${temaIndex}`;
                    const estaVisto = progreso.videosVistos.includes(temaId);
                    const esActivo = videoActual?.temaId === temaId;
                    
                    return (
                      <div
                        key={temaIndex}
                        className={`tema-item ${esActivo ? 'activo' : ''} ${estaVisto ? 'visto' : ''}`}
                        onClick={() => seleccionarVideo(tema, modulo.titulo, moduloIndex, temaIndex)}
                      >
                        <div className="tema-icon">
                          {estaVisto ? (
                            <CheckCircle size={20} className="check-icon" />
                          ) : (
                            <Circle size={20} />
                          )}
                        </div>
                        <div className="tema-info">
                          <p className="tema-titulo">{tema.titulo}</p>
                          {tema.duracion && (
                            <span className="tema-duracion">
                              <Clock size={14} />
                              {tema.duracion}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Reproductor */}
        <main className="aprender-reproductor">
          {videoId ? (
            <>
              <div className="video-container">
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
                  title={videoActual.titulo}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
              
              <div className="video-info">
                <div className="video-header">
                  <div>
                    <p className="video-modulo">{videoActual.moduloTitulo}</p>
                    <h2 className="video-titulo">{videoActual.titulo}</h2>
                  </div>
                  <label className="checkbox-visto">
                    <input
                      type="checkbox"
                      checked={progreso.videosVistos.includes(videoActual.temaId)}
                      onChange={(e) => marcarComoVisto(videoActual.temaId, e.target.checked)}
                    />
                    <span>Marcar como visto</span>
                  </label>
                </div>
              </div>
            </>
          ) : (
            <div className="no-video">
              <PlayCircle size={64} />
              <p>Selecciona un video para comenzar</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

// Función auxiliar
function contarTotalTemas(curso) {
  let total = 0;
  if (curso.temario) {
    curso.temario.forEach(modulo => {
      if (modulo.temas) total += modulo.temas.length;
    });
  }
  return total;
}

export default AprendeCurso;