import { ShoppingCart, Check, Clock, Users, Star } from 'lucide-react';
import { useCarrito } from '../context/CarritoContext';
import { useAuth } from '../context/AuthContext';
import { usePais } from '../context/PaisContext';
import { useNavigate } from 'react-router-dom';
import './CursoCard.css';

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
  // 🛡️ VALIDACIÓN SEGURA DE CURSOS COMPRADOS
  // ========================================
  const yaComprado = usuario?.cursosComprados?.some(c => {
    if (!c || !c.curso) return false; // Protección contra null
    const cursoId = typeof c.curso === 'object' ? c.curso._id : c.curso;
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
  // 💰 OBTENER PRECIO USANDO PAISCONTEXT (UNIFICADO)
  // ========================================
  
  const obtenerPrecio = () => {
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
          <span className="destacado-badge">Destacado</span>
        )}
      </div>

      <div className="curso-content">
        <span className="curso-categoria">{curso.categoria || 'Sin categoría'}</span>
        
        <h3 className="curso-titulo">{curso.titulo || 'Curso sin título'}</h3>
        
        <p className="curso-descripcion">{curso.descripcionCorta || 'Sin descripción'}</p>

        <div className="curso-meta">
          <div className="meta-item">
            <Clock size={16} />
            <span>{curso.duracion || 'Por definir'}</span>
          </div>
          <div className="meta-item">
            <Users size={16} />
            <span>{curso.estudiantes || 0} estudiantes</span>
          </div>
          <div className="meta-item">
            <Star size={16} fill="var(--amarillo)" color="var(--amarillo)" />
            <span>{curso.calificacion || 5}</span>
          </div>
        </div>

        <div className="curso-footer">
          <div className="curso-precio">
            <span className="precio-actual">{precioInfo.formatted}</span>
          </div>

          {yaComprado ? (
            <button 
              className="btn-acceder"
              onClick={handleAccederCurso}
            >
              Acceder al Curso
            </button>
          ) : enCarrito ? (
            <button className="btn-en-carrito" disabled>
              <Check size={18} />
              En Carrito
            </button>
          ) : (
            <button 
              className="btn-agregar"
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
