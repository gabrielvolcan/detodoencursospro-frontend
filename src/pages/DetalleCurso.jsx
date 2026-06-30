import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Clock, Users, Star, ShoppingCart, Check, BookOpen, Award, Target,
  ChevronDown, Zap, Rocket, Gift, Play,
} from 'lucide-react';
import { cursosAPI } from '../services/api';
import { useCarrito } from '../context/CarritoContext';
import { useAuth } from '../context/AuthContext';
import { usePais } from '../context/PaisContext';
import PubThumb from '../components/publico/PubThumb';
import { trackViewItem } from '../utils/analytics';
import '../styles/publico.css';

const OUTCOMES = [
  'Dominar todas las herramientas y técnicas del curso',
  'Aplicar conocimientos en proyectos reales',
  'Desarrollar habilidades profesionales avanzadas',
  'Obtener certificación al completar el curso',
  'Acceso a recursos y materiales exclusivos',
  'Soporte continuo y actualizaciones',
];

const DetalleCurso = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [curso, setCurso] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [moduloExpandido, setModuloExpandido] = useState(0);
  const [estudiantesAnimados, setEstudiantesAnimados] = useState(0);

  const { agregarAlCarrito, estaEnCarrito } = useCarrito();
  const { usuario } = useAuth();
  const { precioDeItem } = usePais();

  useEffect(() => { cargarCurso(); }, [id]);

  // Animación de contador de estudiantes
  useEffect(() => {
    if (!curso) return undefined;
    const valorFinal = Math.max(curso.estudiantes || 0, 1247);
    let inicio = 0;
    const duracion = 2000;
    const incremento = valorFinal / (duracion / 16);
    const timer = setInterval(() => {
      inicio += incremento;
      if (inicio >= valorFinal) {
        setEstudiantesAnimados(valorFinal);
        clearInterval(timer);
      } else {
        setEstudiantesAnimados(Math.floor(inicio));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [curso]);

  const cargarCurso = async () => {
    try {
      const { data } = await cursosAPI.obtenerPorId(id);
      setCurso(data);
      trackViewItem({ id: data._id, name: data.titulo, category: data.categoria, price: data.precioUSD });
    } catch (error) {
      console.error('Error cargando curso:', error);
      navigate('/cursos');
    } finally {
      setCargando(false);
    }
  };

  // Si no hay sesión, guiamos a registrarse (guardando el curso para retomar)
  const irARegistro = () => { localStorage.setItem('intentoCompraCursoId', id); navigate('/registro'); };
  const handleAgregarCarrito = () => {
    if (!usuario) { irARegistro(); return; }
    if (agregarAlCarrito(curso)) navigate('/carrito');
  };
  const handleComprarAhora = () => {
    if (!usuario) { irARegistro(); return; }
    if (agregarAlCarrito(curso)) navigate('/checkout');
  };

  // Inscripción gratuita
  const handleInscripcionGratuita = async () => {
    if (!usuario) {
      localStorage.setItem('cursoGratuitoId', id);
      navigate('/registro');
      return;
    }
    try {
      await cursosAPI.inscripcionGratuita(id);
      localStorage.removeItem('cursoGratuitoId');
      alert('🎉 ¡Inscripción exitosa! Ya podés acceder al curso');
      navigate(`/aprender/${id}`);
    } catch (error) {
      console.error('Error en inscripción:', error);
      alert(error.response?.data?.error || 'Error al inscribirte. Intentá nuevamente.');
    }
  };

  const toggleModulo = (index) => setModuloExpandido(moduloExpandido === index ? -1 : index);

  // 💰 Precio unificado vía PaisContext
  const obtenerPrecio = () => {
    if (!curso) return { formatted: '$0', simbolo: '$', precio: 0 };
    if (curso.esGratuito === true || curso.precioUSD === 0) {
      return { precio: 0, moneda: 'USD', simbolo: '', formatted: 'GRATIS', esGratuito: true };
    }
    return precioDeItem(curso);
  };

  if (cargando) {
    return (
      <div className="pub"><section className="sec" style={{ paddingTop: 80 }}><div className="shell tc">
        <p className="muted">Cargando curso...</p>
      </div></section></div>
    );
  }
  if (!curso) return null;

  // 🛡️ ¿Ya comprado?
  const yaComprado = (() => {
    try {
      if (!usuario || !Array.isArray(usuario.cursosComprados)) return false;
      return usuario.cursosComprados.some((c) => {
        if (!c || !c.curso) return false;
        const cursoId = typeof c.curso === 'object' ? c.curso?._id : c.curso;
        return cursoId === curso._id;
      });
    } catch (error) {
      console.error('Error verificando yaComprado:', error);
      return false;
    }
  })();

  const esGratis = curso.esGratuito === true || curso.precioUSD === 0;
  const enCarrito = estaEnCarrito(curso._id);
  const precioInfo = obtenerPrecio();

  return (
    <div className="pub">
      {/* HERO */}
      <section className="cd-hero">
        <div className="hero-bg"></div>
        <div className="shell cd-in">
          <div>
            <span className="pill pill-g"><Target className="ic ic-s" />{curso.nivel || 'Todos los niveles'}{esGratis && <>&nbsp;· GRATIS</>}</span>
            <h1 className="h1 green" style={{ margin: '18px 0 0', fontSize: 46 }}>{curso.titulo}</h1>
            {curso.subtitulo && <p className="lead" style={{ marginTop: 10 }}>{curso.subtitulo}</p>}
            <div className="cd-meta">
              <span className="mi"><Star className="ic ic-s star" />{curso.calificacion || 5} Rating</span>
              <span className="mi"><Users className="ic ic-s" />{estudiantesAnimados}+ Estudiantes</span>
              <span className="mi"><Clock className="ic ic-s" />{curso.duracion || '23 horas'}</span>
              <span className="mi"><Award className="ic ic-s" />{curso.nivel}</span>
            </div>
            <p className="lead" style={{ maxWidth: 540, marginBottom: 24 }}>{curso.descripcion}</p>
            <div className="bullets" style={{ maxWidth: 420 }}>
              <span className="mi"><Check className="ic ic-s" />Acceso de por vida</span>
              <span className="mi"><Check className="ic ic-s" />Estudia a tu ritmo</span>
              <span className="mi"><Check className="ic ic-s" />Certificado incluido</span>
            </div>
          </div>

          <div className="buybox">
            <PubThumb src={curso.imagen} alt={curso.titulo} icon={BookOpen} className="thumb" />
            <div className="buybox-bd">
              <div className="buybox-price">{precioInfo.formatted}</div>
              {yaComprado ? (
                <button className="btn btnp btn-block btn-lg" onClick={() => navigate(`/aprender/${curso._id}`)}>
                  <Rocket className="ic" />Acceder al Curso
                </button>
              ) : esGratis ? (
                <button className="btn btnp btn-block btn-lg" onClick={handleInscripcionGratuita}>
                  <Gift className="ic" />Inscribirme gratis
                </button>
              ) : (
                <>
                  <button className="btn btnp btn-block btn-lg" style={{ marginBottom: 12 }} onClick={handleComprarAhora}>
                    <Zap className="ic" />{enCarrito ? 'Ir al Checkout' : 'Comprar Ahora'}
                  </button>
                  {!enCarrito && (
                    <button className="btn btno btn-block btn-lg" onClick={handleAgregarCarrito}>
                      <ShoppingCart className="ic" />Agregar al Carrito
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* LO QUE DOMINARÁS */}
      <section className="sec">
        <div className="shell">
          <div className="fx ac jc gap12" style={{ marginBottom: 36 }}><Target className="ic ic-lg green" /><h2 className="h2">Lo que dominarás al finalizar</h2></div>
          <div className="out" style={{ maxWidth: 920, margin: '0 auto' }}>
            {OUTCOMES.map((o) => (
              <div className="out-i" key={o}><Check className="ic" /><span>{o}</span></div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTENIDO DEL CURSO */}
      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="shell" style={{ maxWidth: 820 }}>
          <div className="fx ac jc gap12" style={{ marginBottom: 30 }}><BookOpen className="ic ic-lg green" /><h2 className="h2">Contenido del Curso</h2></div>
          {curso.temario && curso.temario.length > 0 ? (
            curso.temario.map((modulo, index) => {
              const abierto = moduloExpandido === index;
              return (
                <div className={`module ${abierto ? 'open' : ''}`} key={index}>
                  <div className="module-h" onClick={() => toggleModulo(index)} role="button" tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter') toggleModulo(index); }}>
                    <div className="module-ic"><Play className="ic ic-s" /></div>
                    <div>
                      <div className="fw7">Módulo {index + 1}: {modulo.titulo}</div>
                      <div className="muted xs" style={{ marginTop: 3 }}>{modulo.temas?.length || 0} lecciones</div>
                    </div>
                    <ChevronDown className="ic chev" />
                  </div>
                  {abierto && (
                    <div className="module-body">
                      {modulo.descripcion && <p className="muted sm" style={{ padding: '8px 0' }}>{modulo.descripcion}</p>}
                      {(modulo.temas || []).map((tema, vIndex) => (
                        <div className="lesson" key={vIndex}><Play className="ic ic-s" />{tema.titulo}</div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="empty">
              <div className="empty-ic"><BookOpen className="ic ic-lg" /></div>
              <p className="muted" style={{ marginTop: 8 }}>El temario detallado incluye lecciones prácticas y teóricas</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default DetalleCurso;
