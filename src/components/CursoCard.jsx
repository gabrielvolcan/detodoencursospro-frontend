import { ShoppingCart, Check, Clock, Users, Star } from 'lucide-react';
import { useCarrito } from '../context/CarritoContext';
import { useAuth } from '../context/AuthContext';
import { usePais } from '../context/PaisContext';
import { useNavigate } from 'react-router-dom';
import './CursoCard.css';

const CursoCard = ({ curso }) => {
  const { agregarAlCarrito, estaEnCarrito } = useCarrito();
  const { usuario } = useAuth();
  const { paisSeleccionado, obtenerMoneda } = usePais();
  const navigate = useNavigate();

  const yaComprado = usuario?.cursosComprados?.some(
    c => c.curso._id === curso._id || c.curso === curso._id
  );

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
  // 💰 OBTENER PRECIO SEGÚN PAÍS SELECCIONADO
  // ========================================
  
  const obtenerPrecio = () => {
    // Si el curso tiene el sistema nuevo de precios por país
    if (curso.precios && curso.precios[paisSeleccionado]) {
      const precioObj = curso.precios[paisSeleccionado];
      return {
        precio: precioObj.monto,
        moneda: precioObj.moneda,
        simbolo: obtenerSimbolo(precioObj.moneda),
        formatted: formatearPrecio(precioObj.monto, precioObj.moneda)
      };
    }
    
    // Fallback: si tiene precioUSD, convertir manualmente
    if (curso.precioUSD) {
      const moneda = obtenerMoneda();
      const tasas = {
        USD: 1,
        PEN: 3.75,
        CLP: 950,
        ARS: 1000,
        UYU: 39
      };
      const precio = curso.precioUSD * (tasas[moneda] || 1);
      
      return {
        precio,
        moneda,
        simbolo: obtenerSimbolo(moneda),
        formatted: formatearPrecio(precio, moneda)
      };
    }
    
    // Último fallback: si tiene precio antiguo
    if (curso.precio) {
      return {
        precio: curso.precio,
        moneda: 'USD',
        simbolo: '$',
        formatted: `$${curso.precio.toFixed(2)}`
      };
    }
    
    // Error: no hay precio
    return {
      precio: 0,
      moneda: 'USD',
      simbolo: '$',
      formatted: 'Gratis'
    };
  };

  const obtenerSimbolo = (moneda) => {
    const simbolos = {
      USD: '$',
      PEN: 'S/',
      CLP: '$',
      ARS: '$',
      UYU: '$',
      VES: 'Bs'
    };
    return simbolos[moneda] || '$';
  };

  const formatearPrecio = (precio, moneda) => {
    const simbolo = obtenerSimbolo(moneda);
    
    // Para monedas grandes (CLP, ARS), sin decimales
    if (moneda === 'CLP' || moneda === 'ARS') {
      return `${simbolo}${Math.round(precio).toLocaleString('es')}`;
    }
    
    // Para el resto, con 2 decimales
    return `${simbolo}${precio.toFixed(2)}`;
  };

  const precioInfo = obtenerPrecio();

  return (
    <div className="curso-card" onClick={handleClick}>
      <div className="curso-imagen-container">
        <img 
          src={curso.imagen} 
          alt={curso.titulo}
          className="curso-imagen"
        />
        {curso.destacado && (
          <span className="destacado-badge">Destacado</span>
        )}
      </div>

      <div className="curso-content">
        <span className="curso-categoria">{curso.categoria}</span>
        
        <h3 className="curso-titulo">{curso.titulo}</h3>
        
        <p className="curso-descripcion">{curso.descripcionCorta}</p>

        <div className="curso-meta">
          <div className="meta-item">
            <Clock size={16} />
            <span>{curso.duracion}</span>
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
