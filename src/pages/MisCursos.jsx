import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Play, Award, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from '../services/api';
import PubThumb from '../components/publico/PubThumb';
import '../styles/publico.css';

const MisCursos = () => {
  const { estaAutenticado } = useAuth();
  const navigate = useNavigate();
  const [cursos, setCursos] = useState([]);
  const [todosLosCursos, setTodosLosCursos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!estaAutenticado) { navigate('/login'); return; }
    cargarDatos();
  }, [estaAutenticado]);

  const cargarDatos = async () => {
    try {
      const { data: misCursosData } = await axios.get('/auth/usuarios/mis-cursos');
      setCursos(misCursosData);
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
    if (curso.curso.temario?.length > 0) {
      curso.curso.temario.forEach((modulo) => {
        if (modulo.temas?.length > 0) totalVideos += modulo.temas.length;
      });
    }
    if (totalVideos === 0) return 0;
    return Math.round((curso.progresoVideos.length / totalVideos) * 100);
  };

  // ¿Tiene los prompts? → recomendar curso de IA
  const tienePrompts = cursos.some((c) =>
    c.curso?.titulo?.toLowerCase().includes('prompts')
    || c.curso?.titulo?.toLowerCase().includes('30 prompts'));
  const cursoIA = todosLosCursos.find((c) =>
    c.titulo.toLowerCase().includes('inteligencia artificial')
    || c.titulo.toLowerCase().includes('ia')
    || c.categoria?.toLowerCase().includes('inteligencia artificial'));

  if (cargando) {
    return (
      <div className="pub"><section className="sec" style={{ paddingTop: 80 }}><div className="shell tc">
        <p className="muted">Cargando tus cursos...</p>
      </div></section></div>
    );
  }

  return (
    <div className="pub">
      <div className="pagehead"><div className="hero-bg"></div><div className="shell">
        <h1 className="h1">Mis Cursos</h1>
        <p className="lead" style={{ marginTop: 12 }}>Continúa donde lo dejaste y sigue avanzando</p>
      </div></div>

      <section className="sec" style={{ paddingTop: 40 }}>
        <div className="shell">
          {/* Banner recomendación IA */}
          {tienePrompts && cursoIA && (
            <div className="card" style={{ padding: 24, marginBottom: 22, borderColor: 'rgba(22,224,138,.4)', background: 'rgba(22,224,138,.05)' }}>
              <div className="fx ac gap16 wrap">
                <div className="bene-ic"><Sparkles className="ic ic-lg" /></div>
                <div style={{ flex: 1, minWidth: 220 }}>
                  <h3 className="h3" style={{ margin: 0 }}>¿Listo para el siguiente nivel?</h3>
                  <p className="muted sm" style={{ margin: '6px 0 0' }}>Ya dominas los prompts básicos. Aprende a crear prompts profesionales y automatiza tu trabajo con IA.</p>
                </div>
                <button className="btn btnp noshrink" onClick={() => navigate(`/curso/${cursoIA._id}`)}>Ver Curso de IA<ArrowRight className="ic ic-s" /></button>
              </div>
            </div>
          )}

          {cursos.length === 0 ? (
            <div className="empty">
              <div className="empty-ic"><BookOpen className="ic ic-lg" /></div>
              <h2 className="h3">No tienes cursos aún</h2>
              <p className="muted" style={{ margin: '8px 0 22px' }}>Explora nuestro catálogo y comienza tu aprendizaje</p>
              <button className="btn btnp btn-lg" onClick={() => navigate('/cursos')}>Explorar Cursos</button>
            </div>
          ) : (
            cursos.map(({ curso, completado, progresoVideos, certificado }, i) => {
              const progreso = calcularProgreso({ curso, progresoVideos });
              return (
                <div key={curso._id} className="mc-row">
                  <PubThumb src={curso.imagen} alt={curso.titulo} index={i} icon={BookOpen} className="mc-thumb thumb" />
                  <div style={{ flex: 1 }}>
                    <span className="pill pill-d upper xs">{curso.categoria}{curso.nivel ? ` · ${curso.nivel}` : ''}</span>
                    <h3 className="h3" style={{ margin: '11px 0 0' }}>{curso.titulo}</h3>
                    <div className="prog"><div className="prog-bar" style={{ width: `${progreso}%` }}></div></div>
                    <div className="muted xs">{progreso}% completado{completado ? ' · ✓ Completado' : ''}</div>
                  </div>
                  <div className="fx gap8 wrap noshrink" style={{ flexDirection: 'column' }}>
                    <button className="btn btnp noshrink" onClick={() => navigate(`/aprender/${curso._id}`)}>
                      <Play className="ic ic-s" />{progreso > 0 ? 'Continuar' : 'Comenzar'}
                    </button>
                    {completado && certificado?.generado && (
                      <button className="btn btno noshrink" onClick={() => navigate(`/certificado/${curso._id}`)}>
                        <Award className="ic ic-s" />Certificado
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
};

export default MisCursos;
