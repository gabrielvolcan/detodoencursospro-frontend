import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Users, Star, ShoppingCart, Check, BookOpen, Award, Video, ChevronDown, ChevronUp } from 'lucide-react';
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
  
  const { agregarAlCarrito, estaEnCarrito } = useCarrito();
  const { usuario } = useAuth();
  const { convertirPrecio } = usePais();

  useEffect(() => {
    cargarCurso();
  }, [id]);

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

  const toggleModulo = (index) => {
    setModuloExpandido(moduloExpandido === index ? null : index);
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
  const precioConvertido = convertirPrecio(curso.precio);
  const precioAnteriorConvertido = curso.precioAnterior ? convertirPrecio(curso.precioAnterior) : null;

  return (
    <div className="detalle-curso">
      {/* Hero del curso */}
      <div className="curso-hero">
        <div className="container">
          <div className="curso-hero-content">
            <div className="curso-info">
              <span className="curso-badge">{curso.categoria}</span>
              <h1>{curso.titulo}</h1>
              <p className="curso-descripcion-hero">{curso.descripcion}</p>
              
              <div className="curso-stats">
                <div className="stat-item">
                  <Star size={18} fill="var(--amarillo)" color="var(--amarillo)" />
                  <span>{curso.calificacion || 5} Calificación</span>
                </div>
                <div className="stat-item">
                  <Users size={18} />
                  <span>{curso.estudiantes || 0} Estudiantes</span>
                </div>
                <div className="stat-item">
                  <Clock size={18} />
                  <span>{curso.duracion}</span>
                </div>
                <div className="stat-item">
                  <Award size={18} />
                  <span>{curso.nivel}</span>
                </div>
              </div>
            </div>

            <div className="curso-compra-card">
              <img src={curso.imagen} alt={curso.titulo} />
              
              <div className="precio-section">
                {precioAnteriorConvertido && (
                  <span className="precio-anterior">{precioAnteriorConvertido.formatted}</span>
                )}
                <span className="precio-actual">{precioConvertido.formatted}</span>
              </div>

              {yaComprado ? (
                <button 
                  className="btn-acceder-curso"
                  onClick={() => navigate(`/curso/${curso._id}/ver`)}
                >
                  Acceder al Curso
                </button>
              ) : enCarrito ? (
                <button 
                  className="btn-en-carrito"
                  onClick={() => navigate('/carrito')}
                >
                  <Check size={18} />
                  Ir al Carrito
                </button>
              ) : (
                <button 
                  className="btn-comprar"
                  onClick={handleAgregarCarrito}
                >
                  <ShoppingCart size={18} />
                  Agregar al Carrito
                </button>
              )}

              <div className="garantia-box">
                <strong>✓ Acceso de por vida</strong>
                <p>Estudia a tu propio ritmo</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido del curso */}
      <div className="container py-5">
        <div className="curso-contenido">
          {/* Temario */}
          <div className="temario-section">
            <h2>
              <BookOpen size={24} />
              Contenido del Curso
            </h2>
            
            {curso.contenido && curso.contenido.length > 0 ? (
              <div className="temario-lista">
                {curso.contenido.map((modulo, index) => (
                  <div key={index} className="modulo-item">
                    <button 
                      className="modulo-header"
                      onClick={() => toggleModulo(index)}
                    >
                      <div className="modulo-titulo">
                        <Video size={18} />
                        <span>Módulo {index + 1}: {modulo.titulo}</span>
                      </div>
                      {moduloExpandido === index ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                    
                    {moduloExpandido === index && (
                      <div className="modulo-contenido">
                        <p>{modulo.descripcion}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="sin-temario">
                <BookOpen size={48} />
                <p>El temario detallado estará disponible próximamente</p>
              </div>
            )}
          </div>

          {/* Qué aprenderás */}
          <div className="aprenderas-section">
            <h2>¿Qué aprenderás?</h2>
            <div className="aprenderas-grid">
              {curso.contenido?.slice(0, 4).map((item, index) => (
                <div key={index} className="aprenderas-item">
                  <Check size={20} />
                  <span>{item.titulo}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetalleCurso;
