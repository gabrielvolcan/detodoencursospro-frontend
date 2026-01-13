import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Clock, Users, Star, ShoppingCart, Check, BookOpen, Award, Video, 
  ChevronDown, ChevronUp, Zap, Target, Sparkles, Rocket
} from 'lucide-react';
import { cursosAPI } from '../services/api';
import { useCarrito } from '../context/CarritoContext';
import { useAuth } from '../context/AuthContext';
import { usePais } from '../context/PaisContext';
import './DetalleCurso.css';

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

  const toggleModulo = (index) => {
    setModuloExpandido(moduloExpandido === index ? null : index);
  };

  // ========================================
  // 💰 OBTENER PRECIO USANDO PAISCONTEXT (UNIFICADO)
  // ========================================
  
  const obtenerPrecio = () => {
    if (!curso) return { formatted: '$0', simbolo: '$', precio: 0 };

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
              </div>
              
              <h1 className="hero-titulo">{curso.titulo}</h1>
              <p className="hero-subtitulo">De Cero a Experto en IA</p>
              
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
                <div className="precio-overlay">
                  <span className="precio-principal">{precioInfo.formatted}</span>
                  {curso.precioAnterior && (
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

              <div className="garantia-30dias">
                <strong>🛡️ Garantía de 30 días</strong>
                <p>Si no estás satisfecho, te devolvemos tu dinero</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA PRINCIPAL - ARRIBA */}
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
    </div>
  );
};

export default DetalleCurso;
