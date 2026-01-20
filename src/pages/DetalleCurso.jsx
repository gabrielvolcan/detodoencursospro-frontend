import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Clock, Users, Star, ShoppingCart, Check, BookOpen, Award, Video, 
  ChevronDown, ChevronUp, Zap, Target, Sparkles, Rocket, Gift
} from 'lucide-react';
import { cursosAPI } from '../services/api';
import { useCarrito } from '../context/CarritoContext';
import { useAuth } from '../context/AuthContext';
import { usePais } from '../context/PaisContext';
import './DetalleCurso.css';
import './cursosGratuitos.css';

const DetalleCurso = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [curso, setCurso] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [moduloExpandido, setModuloExpandido] = useState(null);
  const [estudiantesAnimados, setEstudiantesAnimados] = useState(0);
  
  const { agregarAlCarrito, estaEnCarrito } = useCarrito();
  const { usuario } = useAuth();
  const { convertirPrecio } = usePais();

  useEffect(() => {
    cargarCurso();
  }, [id]);

  // Animación de contador de estudiantes
  useEffect(() => {
    if (!curso) return;
    
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
    } catch (error) {
      console.error('Error cargando curso:', error);
      navigate('/cursos');
    } finally {
      setCargando(false);
    }
  };

  const handleAgregarCarrito = () => {
    if (agregarAlCarrito(curso)) {
      navigate('/carrito');
    }
  };

  const handleComprarAhora = () => {
    if (agregarAlCarrito(curso)) {
      navigate('/checkout');
    }
  };

  // 🆕 INSCRIPCIÓN GRATUITA
  const handleInscripcionGratuita = async () => {
    if (!usuario) {
      alert('Debes iniciar sesión para inscribirte');
      navigate('/login');
      return;
    }

    try {
      // Llamar al endpoint de inscripción gratuita
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/cursos/${id}/inscripcion-gratuita`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        alert('🎉 ¡Inscripción exitosa! Ya puedes acceder al curso');
        navigate(`/aprender/${id}`);
      } else {
        alert(data.error || 'Error en la inscripción');
      }
    } catch (error) {
      console.error('Error en inscripción:', error);
      alert('Error al inscribirte. Intenta nuevamente.');
    }
  };

  const toggleModulo = (index) => {
    setModuloExpandido(moduloExpandido === index ? null : index);
  };

  // ========================================
  // 💰 OBTENER PRECIO USANDO PAISCONTEXT (UNIFICADO)
  // ========================================
  
  const obtenerPrecio = () => {
    if (!curso) return { formatted: '$0', simbolo: '$', precio: 0 };

    // 🆕 SI ES GRATUITO, MOSTRAR "TOTALMENTE GRATIS"
    if (curso.esGratuito) {
      return {
        precio: 0,
        moneda: 'USD',
        simbolo: '',
        formatted: 'TOTALMENTE GRATIS',
        esGratuito: true
      };
    }

    // Usamos convertirPrecio del contexto
    if (curso.precioUSD && !isNaN(curso.precioUSD)) {
      return convertirPrecio(parseFloat(curso.precioUSD));
    }

    // Fallback
    if (curso.precio && !isNaN(curso.precio)) {
      return {
        precio: parseFloat(curso.precio),
        moneda: 'USD',
        simbolo: '$',
        formatted: `$${parseFloat(curso.precio).toFixed(2)}`
      };
    }

    return { formatted: 'Consultar precio', simbolo: '$', precio: 0 };
  };

  if (cargando) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando curso...</p>
      </div>
    );
  }

  if (!curso) return null;

  const yaComprado = usuario?.cursosComprados?.some(
    c => c.curso._id === curso._id || c.curso === curso._id
  );
  const enCarrito = estaEnCarrito(curso._id);
  const precioInfo = obtenerPrecio();

  return (
    <div className="detalle-curso-mejorado">
      {/* HERO IMPACTANTE */}
      <div className="curso-hero-mejorado">
        <div className="hero-background"></div>
        <div className="container">
          <div className="hero-grid">
            <div className="hero-content">
              <div className="badge-categoria">
                <Sparkles size={16} />
                {curso.categoria}
                {/* 🆕 BADGE GRATIS */}
                {curso.esGratuito && (
                  <span className="badge-gratis-hero">
                    <Gift size={14} />
                    GRATIS
                  </span>
                )}
              </div>
              
              <h1 className="hero-titulo">{curso.titulo}</h1>
              {curso.subtitulo && <p className="hero-subtitulo">{curso.subtitulo}</p>}
              
              <p className="hero-descripcion">{curso.descripcion}</p>

              <div className="hero-stats">
                <div className="stat">
                  <Star size={20} fill="var(--amarillo)" color="var(--amarillo)" />
                  <span>{curso.calificacion || 5} Rating</span>
                </div>
                <div className="stat">
                  <Users size={20} />
                  <span>{estudiantesAnimados}+ Estudiantes</span>
                </div>
                <div className="stat">
                  <Clock size={20} />
                  <span>{curso.duracion || '23 horas'}</span>
                </div>
                <div className="stat">
                  <Award size={20} />
                  <span>{curso.nivel}</span>
                </div>
              </div>

              <div className="hero-garantia">
                <Check size={20} />
                <span>✨ Acceso de por vida • 📱 Estudia a tu ritmo • 🎓 Certificado incluido</span>
              </div>
            </div>

            <div className="hero-card-compra">
              <div className="card-imagen">
                <img src={curso.imagen} alt={curso.titulo} />
                <div className={`precio-overlay ${curso.esGratuito ? 'precio-overlay-gratis' : ''}`}>
                  <span className={`precio-principal ${curso.esGratuito ? 'precio-gratis-detalle' : ''}`}>
                    {precioInfo.formatted}
                  </span>
                  {curso.precioAnterior && !curso.esGratuito && (
                    <span className="precio-anterior">{precioInfo.simbolo}{curso.precioAnterior}</span>
                  )}
                </div>
              </div>

              <div className="card-acciones">
                {yaComprado ? (
                  <button 
                    className="btn-acceder-principal"
                    onClick={() => navigate(`/aprender/${curso._id}`)}
                  >
                    <Rocket size={20} />
                    Acceder al Curso
                  </button>
                ) : curso.esGratuito ? (
                  // 🆕 BOTÓN DE INSCRIPCIÓN GRATUITA
                  <button 
                    className="btn-inscripcion-gratuita"
                    onClick={handleInscripcionGratuita}
                  >
                    <Gift size={20} />
                    Inscribirme GRATIS
                  </button>
                ) : (
                  <>
                    <button 
                      className="btn-comprar-ahora"
                      onClick={handleComprarAhora}
                    >
                      <Zap size={20} />
                      {enCarrito ? 'Ir al Checkout' : 'Comprar Ahora'}
                    </button>
                    {!enCarrito && (
                      <button 
                        className="btn-agregar-carrito"
                        onClick={handleAgregarCarrito}
                      >
                        <ShoppingCart size={20} />
                        Agregar al Carrito
                      </button>
                    )}
                  </>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* CTA PRINCIPAL - ARRIBA */}
      {!curso.esGratuito && (
        <div className="cta-principal">
          <div className="container">
            <div className="cta-content">
              <h2>¿Listo para transformar tu carrera?</h2>
              <p>Únete a {estudiantesAnimados}+ estudiantes que ya están generando resultados</p>
              
              {!yaComprado && (
                <button 
                  className="btn-cta-principal"
                  onClick={handleComprarAhora}
                >
                  <Zap size={24} />
                  {enCarrito ? 'Finalizar Compra' : `Comenzar Ahora por ${precioInfo.formatted}`}
                </button>
              )}

              <div className="garantias-cta">
                <div className="garantia-item">
                  <Check size={20} />
                  <span>Acceso de por vida</span>
                </div>
                <div className="garantia-item">
                  <Check size={20} />
                  <span>Actualizaciones gratis</span>
                </div>
                <div className="garantia-item">
                  <Check size={20} />
                  <span>Certificado incluido</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🆕 CTA ESPECIAL PARA CURSOS GRATUITOS */}
      {curso.esGratuito && !yaComprado && (
        <div className="cta-gratuito-especial">
          <div className="container">
            <div className="cta-gratuito-content">
              <Gift size={48} />
              <h2>🎉 Curso Completamente GRATUITO</h2>
              <p>Regístrate y accede inmediatamente a todo el contenido</p>
              <button 
                className="btn-cta-gratuito-grande"
                onClick={handleInscripcionGratuita}
              >
                Comenzar Ahora Gratis
              </button>
              <div className="beneficios-gratuito">
                <span>✨ Acceso inmediato</span>
                <span>📚 Contenido completo</span>
                <span>🎓 Certificado incluido</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LO QUE APRENDERÁS */}
      <div className="aprenderas-section-mejorada">
        <div className="container">
          <h2 className="section-title">
            <Target size={32} />
            Lo que dominarás al finalizar
          </h2>

          <div className="aprenderas-grid-mejorada">
            <div className="aprenderas-item-mejorado">
              <Check size={24} />
              <span>Dominar todas las herramientas y técnicas del curso</span>
            </div>
            <div className="aprenderas-item-mejorado">
              <Check size={24} />
              <span>Aplicar conocimientos en proyectos reales</span>
            </div>
            <div className="aprenderas-item-mejorado">
              <Check size={24} />
              <span>Desarrollar habilidades profesionales avanzadas</span>
            </div>
            <div className="aprenderas-item-mejorado">
              <Check size={24} />
              <span>Obtener certificación al completar el curso</span>
            </div>
            <div className="aprenderas-item-mejorado">
              <Check size={24} />
              <span>Acceso a recursos y materiales exclusivos</span>
            </div>
            <div className="aprenderas-item-mejorado">
              <Check size={24} />
              <span>Soporte continuo y actualizaciones</span>
            </div>
          </div>
        </div>
      </div>

      {/* TEMARIO DETALLADO */}
      <div className="temario-section-mejorado">
        <div className="container">
          <h2 className="section-title">
            <BookOpen size={32} />
            Contenido del Curso
          </h2>

          {curso.temario && curso.temario.length > 0 ? (
            <div className="modulos-lista">
              {curso.temario.map((modulo, index) => (
                <div key={index} className="modulo-card">
                  <button 
                    className="modulo-header-btn"
                    onClick={() => toggleModulo(index)}
                  >
                    <div className="modulo-info">
                      <Video size={20} />
                      <div>
                        <h3>Módulo {index + 1}: {modulo.titulo}</h3>
                        <span className="modulo-duracion">
                          {modulo.temas?.length || 0} lecciones
                        </span>
                      </div>
                    </div>
                    {moduloExpandido === index ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                  </button>

                  {moduloExpandido === index && (
                    <div className="modulo-contenido-expandido">
                      <p className="modulo-descripcion">{modulo.descripcion}</p>
                      {modulo.temas && modulo.temas.length > 0 && (
                        <div className="videos-lista">
                          {modulo.temas.map((tema, vIndex) => (
                            <div key={vIndex} className="video-item">
                              <Video size={16} />
                              <span>{tema.titulo}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="temario-placeholder">
              <BookOpen size={64} />
              <p>El temario detallado incluye lecciones prácticas y teóricas</p>
            </div>
          )}
        </div>
      </div>

      {/* CTA FINAL - RECORDATORIO */}
      {!curso.esGratuito && (
        <div className="cta-final-recordatorio">
          <div className="container">
            <div className="cta-content-small">
              <h3>¿Tienes dudas? Es tu momento</h3>
              <p>Únete a {estudiantesAnimados}+ estudiantes</p>
              
              {!yaComprado && !enCarrito && (
                <button 
                  className="btn-cta-small"
                  onClick={handleComprarAhora}
                >
                  <Zap size={20} />
                  Inscribirme por {precioInfo.formatted}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 🆕 CTA FINAL PARA CURSOS GRATUITOS */}
      {curso.esGratuito && !yaComprado && (
        <div className="cta-final-gratuito">
          <div className="container">
            <div className="cta-content-small">
              <h3>No pierdas esta oportunidad</h3>
              <p>Inscríbete GRATIS y empieza a aprender hoy</p>
              
              <button 
                className="btn-cta-gratuito-small"
                onClick={handleInscripcionGratuita}
              >
                <Gift size={20} />
                Comenzar Gratis Ahora
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetalleCurso;
