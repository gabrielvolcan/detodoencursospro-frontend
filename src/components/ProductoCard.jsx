// ========================================
// 🎴 COMPONENTE CARD GENÉRICO DE PRODUCTO
// Se adapta según el tipo de producto
// ========================================

import { Link } from 'react-router-dom';
import { 
  Video, FileText, Package, Download, Star, Users, Clock 
} from 'lucide-react';
import './ProductoCard.css';

const ProductoCard = ({ producto }) => {
  
  // Icono según tipo de producto
  const renderIconoTipo = () => {
    const iconos = {
      curso: <Video size={20} />,
      libro: <FileText size={20} />,
      ebook: <FileText size={20} />,
      plantilla: <Package size={20} />,
      guia: <FileText size={20} />,
      software: <Download size={20} />,
      bundle: <Package size={20} />,
      recurso: <Package size={20} />
    };
    return iconos[producto.tipo] || <Package size={20} />;
  };
  
  // Badge de tipo
  const renderTipoBadge = () => {
    const badges = {
      curso: '🎓 Curso',
      libro: '📚 Libro',
      ebook: '📖 Ebook',
      plantilla: '🎨 Plantilla',
      guia: '📄 Guía',
      software: '💾 Software',
      bundle: '📦 Bundle',
      recurso: '🖼️ Recurso'
    };
    return badges[producto.tipo] || producto.tipo;
  };
  
  // Calcular precio con descuento
  const precioFinal = producto.oferta?.activa
    ? (producto.precioUSD * (1 - producto.oferta.porcentajeDescuento / 100)).toFixed(2)
    : producto.precioUSD;

  return (
    <Link to={`/producto/${producto._id}`} className="producto-card">
      <div className="producto-card-imagen">
        <img src={producto.imagen} alt={producto.titulo} />
        
        {/* Badges */}
        <div className="producto-card-badges">
          {producto.nuevo && (
            <span className="producto-badge producto-badge-nuevo">Nuevo</span>
          )}
          {producto.oferta?.activa && (
            <span className="producto-badge producto-badge-oferta">
              -{producto.oferta.porcentajeDescuento}%
            </span>
          )}
          {producto.destacado && (
            <span className="producto-badge producto-badge-destacado">⭐ Destacado</span>
          )}
        </div>
        
        {/* Tipo de producto */}
        <div className="producto-card-tipo">
          {renderIconoTipo()}
          <span>{renderTipoBadge()}</span>
        </div>
      </div>
      
      <div className="producto-card-contenido">
        <div className="producto-card-categoria">{producto.categoria}</div>
        
        <h3 className="producto-card-titulo">{producto.titulo}</h3>
        
        {producto.subtitulo && (
          <p className="producto-card-subtitulo">{producto.subtitulo}</p>
        )}
        
        <p className="producto-card-descripcion">
          {producto.descripcion.substring(0, 100)}
          {producto.descripcion.length > 100 && '...'}
        </p>
        
        {/* Metadatos según tipo */}
        <div className="producto-card-meta">
          {/* Para cursos */}
          {producto.tipo === 'curso' && (
            <>
              {producto.metadatos?.instructor && (
                <span>👨‍🏫 {producto.metadatos.instructor}</span>
              )}
              {producto.duracion && (
                <span>
                  <Clock size={14} />
                  {producto.duracion}
                </span>
              )}
              {producto.videos?.length > 0 && (
                <span>{producto.videos.length} videos</span>
              )}
            </>
          )}
          
          {/* Para libros/ebooks */}
          {['libro', 'ebook'].includes(producto.tipo) && (
            <>
              {producto.metadatos?.autor && (
                <span>✍️ {producto.metadatos.autor}</span>
              )}
              {producto.metadatos?.paginas && (
                <span>{producto.metadatos.paginas} páginas</span>
              )}
            </>
          )}
          
          {/* Para descargables */}
          {['plantilla', 'guia', 'recurso', 'software'].includes(producto.tipo) && (
            <>
              {producto.archivos?.length > 0 && (
                <span>
                  <Download size={14} />
                  {producto.archivos.length} archivos
                </span>
              )}
              {producto.metadatos?.software && (
                <span>{producto.metadatos.software}</span>
              )}
            </>
          )}
        </div>
        
        {/* Valoración y estudiantes */}
        <div className="producto-card-stats">
          <div className="producto-valoracion">
            <Star size={16} fill="#ffa500" color="#ffa500" />
            <span>{producto.valoracion.promedio.toFixed(1)}</span>
            <span className="producto-valoracion-total">
              ({producto.valoracion.total})
            </span>
          </div>
          
          <div className="producto-estudiantes">
            <Users size={16} />
            <span>{producto.estudiantes}</span>
          </div>
        </div>
        
        {/* Precio */}
        <div className="producto-card-footer">
          <div className="producto-precio">
            {producto.oferta?.activa && (
              <span className="producto-precio-antes">${producto.precioUSD}</span>
            )}
            <span className="producto-precio-actual">${precioFinal}</span>
          </div>
          
          <button className="producto-btn-ver-mas">Ver detalles</button>
        </div>
      </div>
    </Link>
  );
};

export default ProductoCard;