import { ShoppingCart, Check, Clock, Users, Star } from 'lucide-react';
import { useCarrito } from '../context/CarritoContext';
import { useAuth } from '../context/AuthContext';
import { usePais } from '../context/PaisContext';
import { useNavigate } from 'react-router-dom';
import './CursoCard.css';
import './cursosGratuitos.css';

const CursoCard = ({ curso }) => {
  // ========================================
  // 🛡️ VALIDACIÓN CRÍTICA - PREVIENE ERROR NULL
  // ========================================
  if (!curso || !curso._id) {
    console.warn('CursoCard recibió un curso inválido:', curso);
    return null; // No renderiza nada si curso es null
  }

  const { agregarAlCarrito, estaEnCarrito } = useCarrito();
  const { usuario } = useAuth();
  const { convertirPrecio } = usePais();
  const navigate = useNavigate();

  // ========================================
  // 🛡️ VALIDACIÓN SEGURA DE CURSOS COMPRADOS - CORREGIDA
  // ========================================
  const yaComprado = usuario?.cursosComprados?.some(c => {
    // Validación estricta: verificar que c y c.curso existan
    if (!c || !c.curso) return false;
    
    // Extraer ID de forma segura
    let cursoId;
    if (typeof c.curso === 'object' && c.curso !== null && c.curso._id) {
      cursoId = c.curso._id;
    } else if (typeof c.curso === 'string') {
      cursoId = c.curso;
    } else {
      // Si no es ni objeto válido ni string, ignorar esta entrada
      return false;
    }
    
    return cursoId === curso._id;
  }) || false;

  const enCarrito = estaEnCarrito(curso._id);

  const handleAgregarCarrito = (e) => {
    e.stopPropagation();
    if (agregarAlCarrito(curso)) {
      // Feedback visual
    }
  };

  const handleClick = () => {
    navigate(`/curso/${curso._id}`);
  };

  const handleAccederCurso = (e) => {
    e.stopPropagation();
    navigate(`/aprender/${curso._id}`);
  };

  // ========================================
  // 🆕 LÓGICA PARA CURSOS GRATUITOS
  // ========================================
  const handleInscripcionGratuita = async (e) => {
    e.stopPropagation();
    
    if (!usuario) {
      // Guardar el ID del curso para redirigir después del registro
      localStorage.setItem('cursoGratuitoId', curso._id);
      navigate('/registro');
      return;
    }

    // Redirigir a la página del curso para que se inscriban
    navigate(`/curso/${curso._id}`);
  };

  // ========================================
  // 💰 OBTENER PRECIO USANDO PAISCONTEXT (UNIFICADO)
  // ========================================
  
  const obtenerPrecio = () => {
    // 🆕 DEBUG: Ver qué valores tiene el curso
    console.log('DEBUG - Curso:', curso.titulo);
    console.log('DEBUG - esGratuito:', curso.esGratuito);
    console.log('DEBUG - precioUSD:', curso.precioUSD);

    // 🆕 SI ES GRATUITO (por campo o por precio 0), MOSTRAR "GRATIS"
    if (curso.esGratuito === true || curso.precioUSD === 0) {
      console.log('✅ Detectado como GRATUITO');
      return {
        precio: 0,
        moneda: 'USD',
        simbolo: '',
        formatted: 'GRATIS',
        esGratuito: true
      };
    }

    // Si el curso tiene precioUSD, usamos convertirPrecio del contexto
    if (curso.precioUSD && !isNaN(curso.precioUSD)) {
      return convertirPrecio(parseFloat(curso.precioUSD));
    }
    
    // Fallback: precio antiguo sin conversión
    if (curso.precio && !isNaN(curso.precio)) {
      return {
        precio: parseFloat(curso.precio),
        moneda: 'USD',
        simbolo: '$',
        formatted: `$${parseFloat(curso.precio).toFixed(2)}`
      };
    }
    
    // Error: no hay precio válido
    console.warn('⚠️ Precio no disponible para:', curso.titulo);
    return {
      precio: 0,
      moneda: 'USD',
      simbolo: '$',
      formatted: 'Precio no disponible'
    };
  };

  const precioInfo = obtenerPrecio();

  return (
    <div className="curso-card" onClick={handleClick}>
      <div className="curso-imagen-container">
        <img 
          src={curso.imagen || '/placeholder-curso.jpg'} 
          alt={curso.titulo || 'Curso'}
          className="curso-imagen"
        />
        {curso.destacado && (
          <span className="curso-destacado-badge">Destacado</span>
        )}
        {/* 🆕 BADGE DE CURSO GRATUITO - DETECTA POR CAMPO O POR PRECIO */}
        {(curso.esGratuito === true || curso.precioUSD === 0) && (
          <span className="curso-gratuito-badge">GRATIS</span>
        )}
      </div>

      <div className="curso-content">
        <span className="curso-categoria">{curso.categoria || 'Sin categoría'}</span>
        
        <h3 className="curso-titulo">{curso.titulo || 'Curso sin título'}</h3>
        
        <p className="curso-descripcion">{curso.descripcionCorta || 'Sin descripción'}</p>

        <div className="curso-meta">
          <div className="curso-meta-item">
            <Clock size={16} />
            <span>{curso.duracion || 'Por definir'}</span>
          </div>
          <div className="curso-meta-item">
            <Users size={16} />
            <span>{curso.estudiantes || 0} estudiantes</span>
          </div>
          <div className="curso-meta-item">
            <Star size={16} fill="var(--amarillo)" color="var(--amarillo)" />
            <span>{curso.calificacion || 5}</span>
          </div>
        </div>

        <div className="curso-footer">
          <div className="curso-precio">
            {/* 🆕 MOSTRAR "GRATIS" EN VERDE */}
            <span className={`curso-precio-actual ${(curso.esGratuito === true || curso.precioUSD === 0) ? 'precio-gratis' : ''}`}>
              {precioInfo.formatted}
            </span>
          </div>

          {yaComprado ? (
            <button 
              className="curso-btn-acceder"
              onClick={handleAccederCurso}
            >
              Acceder al Curso
            </button>
          ) : (curso.esGratuito === true || curso.precioUSD === 0) ? (
            // 🆕 BOTÓN ESPECIAL PARA CURSOS GRATUITOS
            <button 
              className="curso-btn-gratuito"
              onClick={handleInscripcionGratuita}
            >
              Inscribirme Gratis
            </button>
          ) : enCarrito ? (
            <button className="curso-btn-en-carrito" disabled>
              <Check size={18} />
              En Carrito
            </button>
          ) : (
            <button 
              className="curso-btn-agregar"
              onClick={handleAgregarCarrito}
            >
              <ShoppingCart size={18} />
              Agregar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CursoCard;
