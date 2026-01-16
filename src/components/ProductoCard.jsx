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
      <div className="card-imagen">
        <img src={producto.imagen} alt={producto.titulo} />
        
        {/* Badges */}
        <div className="card-badges">
          {producto.nuevo && (
            <span className="badge badge-nuevo">Nuevo</span>
          )}
          {producto.oferta?.activa && (
            <span className="badge badge-oferta">
              -{producto.oferta.porcentajeDescuento}%
            </span>
          )}
          {producto.destacado && (
            <span className="badge badge-destacado">⭐ Destacado</span>
          )}
        </div>
        
        {/* Tipo de producto */}
        <div className="card-tipo">
          {renderIconoTipo()}
          <span>{renderTipoBadge()}</span>
        </div>
      </div>
      
      <div className="card-contenido">
        <div className="card-categoria">{producto.categoria}</div>
        
        <h3 className="card-titulo">{producto.titulo}</h3>
        
        {producto.subtitulo && (
          <p className="card-subtitulo">{producto.subtitulo}</p>
        )}
        
        <p className="card-descripcion">
          {producto.descripcion.substring(0, 100)}
          {producto.descripcion.length > 100 && '...'}
        </p>
        
        {/* Metadatos según tipo */}
        <div className="card-meta">
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
        <div className="card-stats">
          <div className="valoracion">
            <Star size={16} fill="#ffa500" color="#ffa500" />
            <span>{producto.valoracion.promedio.toFixed(1)}</span>
            <span className="valoracion-total">
              ({producto.valoracion.total})
            </span>
          </div>
          
          <div className="estudiantes">
            <Users size={16} />
            <span>{producto.estudiantes}</span>
          </div>
        </div>
        
        {/* Precio */}
        <div className="card-footer">
          <div className="precio">
            {producto.oferta?.activa && (
              <span className="precio-antes">${producto.precioUSD}</span>
            )}
            <span className="precio-actual">${precioFinal}</span>
          </div>
          
          <button className="btn-ver-mas">Ver detalles</button>
        </div>
      </div>
    </Link>
  );
};

export default ProductoCard;