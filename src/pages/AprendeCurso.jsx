import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { PlayCircle, CheckCircle, Circle, ArrowLeft, Award, Clock, FileText, Copy, Check } from 'lucide-react';
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
  const [copiado, setCopiado] = useState(false); // 🆕 Para el botón de copiar

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
    setCopiado(false); // 🆕 Resetear estado de copiado
  };

  // 🆕 FUNCIÓN PARA COPIAR TEXTO
  const copiarTexto = () => {
    if (videoActual?.descripcion) {
      navigator.clipboard.writeText(videoActual.descripcion);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    }
  };

  // ========================================
  // 🎥 EXTRAE ID DE YOUTUBE O GOOGLE DRIVE
  // ========================================
  const extraerVideoInfo = (url) => {
    if (!url) return { tipo: null, id: null };
    
    // Detectar YouTube
    const youtubeRegExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const youtubeMatch = url.match(youtubeRegExp);
    if (youtubeMatch && youtubeMatch[2].length === 11) {
      return { tipo: 'youtube', id: youtubeMatch[2] };
    }
    
    // Detectar Google Drive
    const driveRegExp = /\/file\/d\/([a-zA-Z0-9_-]+)/;
    const driveMatch = url.match(driveRegExp);
    if (driveMatch && driveMatch[1]) {
      return { tipo: 'drive', id: driveMatch[1] };
    }
    
    // Si es directamente un ID de Drive (33 caracteres aprox)
    if (url.length > 20 && url.length < 50 && !url.includes('/')) {
      return { tipo: 'drive', id: url };
    }
    
    return { tipo: null, id: null };
  };

  // 🆕 DETECTAR SI ES CONTENIDO DE SOLO TEXTO
  const esContenidoTexto = (tema) => {
    return !tema?.videoUrl || tema.videoUrl.trim() === '';
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

  const videoInfo = videoActual?.videoUrl ? extraerVideoInfo(videoActual.videoUrl) : { tipo: null, id: null };
  const mostrarVistaTexto = esContenidoTexto(videoActual); // 🆕 Determinar qué vista mostrar

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
            <p>{progreso.videosVistos.length} / {contarTotalTemas(curso)} lecciones</p>
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

        {/* 🆕 VISTA CONDICIONAL: TEXTO O VIDEO */}
        <main className="aprender-reproductor">
          {!videoActual ? (
            <div className="no-video">
              <PlayCircle size={64} />
              <p>Selecciona una lección para comenzar</p>
            </div>
          ) : mostrarVistaTexto ? (
            /* 🆕 VISTA DE TEXTO PARA PROMPTS */
            <div className="vista-texto">
              <div className="texto-container">
                <div className="texto-header">
                  <div>
                    <p className="texto-modulo">{videoActual.moduloTitulo}</p>
                    <h2 className="texto-titulo">{videoActual.titulo}</h2>
                  </div>
                  <div className="texto-acciones">
                    <button 
                      className="btn-copiar"
                      onClick={copiarTexto}
                      title="Copiar contenido"
                    >
                      {copiado ? <Check size={20} /> : <Copy size={20} />}
                      {copiado ? 'Copiado' : 'Copiar'}
                    </button>
                    <label className="checkbox-visto">
                      <input
                        type="checkbox"
                        checked={progreso.videosVistos.includes(videoActual.temaId)}
                        onChange={(e) => marcarComoVisto(videoActual.temaId, e.target.checked)}
                      />
                      <span>Marcar como leído</span>
                    </label>
                  </div>
                </div>

                <div className="texto-contenido">
                  <div className="texto-icono">
                    <FileText size={48} />
                  </div>
                  <div className="texto-body">
                    {videoActual.descripcion ? (
                      <pre className="texto-pre">{videoActual.descripcion}</pre>
                    ) : (
                      <p className="texto-placeholder">No hay contenido disponible para esta lección.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : videoInfo.id ? (
            /* VISTA DE VIDEO ORIGINAL */
            <>
              <div className="video-container">
                {videoInfo.tipo === 'youtube' && (
                  <iframe
                    src={`https://www.youtube.com/embed/${videoInfo.id}?rel=0&modestbranding=1`}
                    title={videoActual.titulo}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                )}
                
                {videoInfo.tipo === 'drive' && (
                  <iframe
                    src={`https://drive.google.com/file/d/${videoInfo.id}/preview`}
                    title={videoActual.titulo}
                    frameBorder="0"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                  ></iframe>
                )}
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