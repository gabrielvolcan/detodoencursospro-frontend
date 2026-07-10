import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  PlayCircle, CheckCircle, Circle, ArrowLeft, Award, Clock, FileText, Copy, Check,
  ChevronLeft, ChevronRight, X,
} from 'lucide-react';
import { cursosAPI } from '../services/api';
import './AprendeCurso.css';

// Lista plana de todas las lecciones del curso (para reanudar y navegar).
const construirLecciones = (curso) => {
  const out = [];
  (curso?.temario || []).forEach((modulo, mi) => {
    (modulo.temas || []).forEach((tema, ti) => {
      out.push({ moduloIndex: mi, temaIndex: ti, temaId: `${mi}-${ti}`, moduloTitulo: modulo.titulo, tema });
    });
  });
  return out;
};

const AprendeCurso = () => {
  const { cursoId } = useParams();
  const navigate = useNavigate();

  const [curso, setCurso] = useState(null);
  const [progreso, setProgreso] = useState({ videosVistos: [], completado: false, porcentaje: 0 });
  const [videoActual, setVideoActual] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [copiado, setCopiado] = useState(false);
  const [reanudado, setReanudado] = useState(false); // mostró "continuar donde lo dejaste"
  const [laminaActual, setLaminaActual] = useState(0); // índice de lámina en lecciones de carrusel
  const irLaminaRef = useRef(null); // última función irLamina (null si la lección no es de láminas)
  const touchX = useRef(null); // inicio del swipe táctil

  useEffect(() => {
    cargarCurso();
  }, [cursoId]);

  // Al cambiar de lección, volvemos a la primera lámina
  useEffect(() => {
    setLaminaActual(0);
  }, [videoActual?.temaId]);

  // Navegación por teclado en el visor de láminas (← →)
  useEffect(() => {
    const onKey = (e) => {
      const t = e.target?.tagName;
      if (t === 'INPUT' || t === 'TEXTAREA') return; // no robar el teclado a los campos
      if (!irLaminaRef.current) return; // solo en lecciones de láminas
      if (e.key === 'ArrowRight') { e.preventDefault(); irLaminaRef.current(1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); irLaminaRef.current(-1); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const cargarCurso = async () => {
    try {
      const { data } = await cursosAPI.obtenerParaAprender(cursoId);
      setCurso(data.curso);
      setProgreso(data.progreso);

      // 🆕 REANUDAR: abrir la primera lección NO vista (donde se quedó)
      const lecciones = construirLecciones(data.curso);
      const vistos = data.progreso?.videosVistos || [];
      const idxNoVisto = lecciones.findIndex((l) => !vistos.includes(l.temaId));
      const inicio = idxNoVisto >= 0 ? lecciones[idxNoVisto] : lecciones[0];
      if (inicio) {
        setVideoActual({ ...inicio.tema, moduloTitulo: inicio.moduloTitulo, temaId: inicio.temaId });
        setReanudado(vistos.length > 0 && idxNoVisto > 0);
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err.response?.data?.mensaje || 'No tienes acceso a este curso');
      setTimeout(() => navigate('/mis-cursos-aprender'), 2000);
    } finally {
      setCargando(false);
    }
  };

  const marcarComoVisto = async (temaId, marcar = true) => {
    try {
      const { data } = marcar
        ? await cursosAPI.marcarVideoVisto(cursoId, temaId)
        : await cursosAPI.desmarcarVideoVisto(cursoId, temaId);
      setProgreso(data.progreso);
    } catch (err) {
      console.error('Error actualizando progreso:', err);
    }
  };

  const seleccionarVideo = (tema, moduloTitulo, moduloIndex, temaIndex) => {
    setReanudado(false);
    setVideoActual({ ...tema, moduloTitulo, temaId: `${moduloIndex}-${temaIndex}` });
    setCopiado(false);
  };

  // 🆕 Navegar entre lecciones. Avanza al instante y marca la actual en segundo plano.
  const irLeccion = (delta) => {
    const lecciones = construirLecciones(curso);
    const idx = lecciones.findIndex((l) => l.temaId === videoActual?.temaId);
    const sig = lecciones[idx + delta];
    if (!sig) return;
    if (delta > 0 && videoActual && !progreso.videosVistos.includes(videoActual.temaId)) {
      marcarComoVisto(videoActual.temaId, true); // sin await: no traba la navegación
    }
    setReanudado(false);
    setVideoActual({ ...sig.tema, moduloTitulo: sig.moduloTitulo, temaId: sig.temaId });
    setCopiado(false);
  };

  const copiarTexto = () => {
    if (videoActual?.descripcion) {
      navigator.clipboard.writeText(videoActual.descripcion);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    }
  };

  const extraerVideoInfo = (url) => {
    if (!url) return { tipo: null, id: null };
    const youtubeRegExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const youtubeMatch = url.match(youtubeRegExp);
    if (youtubeMatch && youtubeMatch[2].length === 11) {
      return { tipo: 'youtube', id: youtubeMatch[2] };
    }
    const driveRegExp = /\/file\/d\/([a-zA-Z0-9_-]+)/;
    const driveMatch = url.match(driveRegExp);
    if (driveMatch && driveMatch[1]) {
      return { tipo: 'drive', id: driveMatch[1] };
    }
    if (url.length > 20 && url.length < 50 && !url.includes('/')) {
      return { tipo: 'drive', id: url };
    }
    return { tipo: null, id: null };
  };

  const esContenidoTexto = (tema) => !tema?.videoUrl || tema.videoUrl.trim() === '';

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

  const laminas = Array.isArray(videoActual?.laminas) ? videoActual.laminas : [];
  const esLaminas = laminas.length > 0;
  const videoInfo = videoActual?.videoUrl ? extraerVideoInfo(videoActual.videoUrl) : { tipo: null, id: null };
  const mostrarVistaTexto = !esLaminas && esContenidoTexto(videoActual);
  const lecciones = construirLecciones(curso);
  const idxActual = lecciones.findIndex((l) => l.temaId === videoActual?.temaId);
  const hayAnterior = idxActual > 0;
  const haySiguiente = idxActual >= 0 && idxActual < lecciones.length - 1;

  // Navegación dentro del carrusel de láminas
  const irLamina = (delta) => {
    const n = laminaActual + delta;
    if (n < 0) { if (hayAnterior) irLeccion(-1); return; }
    if (n >= laminas.length) {
      if (videoActual && !progreso.videosVistos.includes(videoActual.temaId)) marcarComoVisto(videoActual.temaId, true);
      if (haySiguiente) irLeccion(1);
      return;
    }
    setLaminaActual(n);
    // Al ver la última lámina, marcamos la lección como vista
    if (n === laminas.length - 1 && videoActual && !progreso.videosVistos.includes(videoActual.temaId)) {
      marcarComoVisto(videoActual.temaId, true);
    }
  };
  // Exponer irLamina al listener de teclado (null si esta lección no es de láminas)
  irLaminaRef.current = esLaminas ? irLamina : null;

  // Swipe táctil sobre el visor de láminas
  const onLaminaTouchStart = (e) => { touchX.current = e.changedTouches[0].clientX; };
  const onLaminaTouchEnd = (e) => {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    touchX.current = null;
    if (Math.abs(dx) > 45) irLamina(dx < 0 ? 1 : -1);
  };

  return (
    <div className="aprender-curso">
      <div className="aprender-header">
        <button onClick={() => navigate('/mis-cursos-aprender')} className="btn-back">
          <ArrowLeft size={20} />
          Volver a Mis Cursos
        </button>
        <div className="header-info">
          <h1>{curso.titulo}</h1>
          <div className="progreso-header">
            <div className="progreso-barra">
              <div className="progreso-fill" style={{ width: `${progreso.porcentaje}%` }}></div>
            </div>
            <span className="progreso-texto">{Math.round(progreso.porcentaje)}% completado</span>
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
        <aside className="aprender-sidebar">
          <div className="sidebar-header">
            <h3>Contenido del Curso</h3>
            <p>{progreso.videosVistos.length} / {contarTotalTemas(curso)} lecciones</p>
          </div>

          <div className="modulos-lista">
            {curso.temario.map((modulo, moduloIndex) => (
              <div key={moduloIndex} className="modulo">
                <h4 className="modulo-titulo">{modulo.titulo}</h4>
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
                          {estaVisto ? <CheckCircle size={20} className="check-icon" /> : <Circle size={20} />}
                        </div>
                        <div className="tema-info">
                          <p className="tema-titulo">{tema.titulo}</p>
                          {tema.duracion && (
                            <span className="tema-duracion"><Clock size={14} />{tema.duracion}</span>
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

        <main className="aprender-reproductor">
          {reanudado && videoActual && (
            <div className="reanudar-banner">
              <span>📍 Continuaste donde lo dejaste: <strong>{videoActual.titulo}</strong></span>
              <button onClick={() => setReanudado(false)} aria-label="Cerrar"><X size={16} /></button>
            </div>
          )}

          {!videoActual ? (
            <div className="no-video">
              <PlayCircle size={64} />
              <p>Selecciona una lección para comenzar</p>
            </div>
          ) : esLaminas ? (
            <>
              <div className="laminas-stage" onTouchStart={onLaminaTouchStart} onTouchEnd={onLaminaTouchEnd}>
                <button className="lam-arrow lam-left" onClick={() => irLamina(-1)} disabled={laminaActual === 0} aria-label="Anterior">
                  <ChevronLeft size={26} />
                </button>
                <img className="lam-img" src={laminas[laminaActual]} alt={`${videoActual.titulo} — lámina ${laminaActual + 1}`} draggable={false} />
                <button className="lam-arrow lam-right" onClick={() => irLamina(1)} disabled={laminaActual >= laminas.length - 1} aria-label="Siguiente">
                  <ChevronRight size={26} />
                </button>
              </div>
              <div className="lam-dots">
                {laminas.map((_, i) => (
                  <button key={i} className={`lam-dot ${i === laminaActual ? 'on' : ''}`} onClick={() => setLaminaActual(i)} aria-label={`Lámina ${i + 1}`}></button>
                ))}
              </div>
              <div className="video-info">
                <div className="video-header">
                  <div>
                    <p className="video-modulo">{videoActual.moduloTitulo}</p>
                    <h2 className="video-titulo">{videoActual.titulo} <span className="lam-count">· Lámina {laminaActual + 1} de {laminas.length}</span></h2>
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
          ) : mostrarVistaTexto ? (
            <div className="vista-texto">
              <div className="texto-container">
                <div className="texto-header">
                  <div>
                    <p className="texto-modulo">{videoActual.moduloTitulo}</p>
                    <h2 className="texto-titulo">{videoActual.titulo}</h2>
                  </div>
                  <div className="texto-acciones">
                    <button className="btn-copiar" onClick={copiarTexto} title="Copiar contenido">
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
                  <div className="texto-icono"><FileText size={48} /></div>
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

          {/* 🆕 Navegación entre lecciones */}
          {videoActual && lecciones.length > 1 && (
            <div className="leccion-nav">
              <button className="nav-btn" onClick={() => irLeccion(-1)} disabled={!hayAnterior}>
                <ChevronLeft size={18} /> Anterior
              </button>
              <span className="nav-pos">Lección {idxActual + 1} de {lecciones.length}</span>
              <button className="nav-btn primary" onClick={() => irLeccion(1)} disabled={!haySiguiente}>
                Siguiente <ChevronRight size={18} />
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

function contarTotalTemas(curso) {
  let total = 0;
  if (curso.temario) {
    curso.temario.forEach((modulo) => {
      if (modulo.temas) total += modulo.temas.length;
    });
  }
  return total;
}

export default AprendeCurso;
