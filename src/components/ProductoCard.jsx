import { Link } from 'react-router-dom';
import { 
  Video, FileText, Package, Download, Star, Users 
} from 'lucide-react';
import { usePais } from '../context/PaisContext';
import './ProductoCard.css';

const ProductoCard = ({ producto }) => {
  const { convertirPrecio } = usePais();

  const precioData = convertirPrecio(producto.precioUSD);
  
  // Icono según tipo
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

  return (
    <Link to={`/producto/${producto._id}`} className="producto-card">
      <div className="producto-card-imagen">
        <img src={producto.imagen} alt={producto.titulo} />
        
        {/* Badges */}
        <div className="producto-card-badges">
          {producto.gratis && (
            <span className="producto-badge producto-badge-gratis">GRATIS</span>
          )}
          {producto.nuevo && (
            <span className="producto-badge producto-badge-nuevo">Nuevo</span>
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
        
        <p className="producto-card-descripcion">
          {producto.descripcion?.substring(0, 100) || ''}
          {producto.descripcion?.length > 100 && '...'}
        </p>
        
        {/* Valoración y compradores */}
        <div className="producto-card-stats">
          <div className="producto-valoracion">
            <Star size={16} fill="#ffa500" color="#ffa500" />
            <span>{producto.valoracion?.promedio?.toFixed(1) || '0.0'}</span>
            <span className="producto-valoracion-total">
              ({producto.valoracion?.total || 0})
            </span>
          </div>
          
          <div className="producto-estudiantes">
            <Users size={16} />
            <span>{producto.totalCompradores || 0}</span>
          </div>
        </div>
        
        {/* Precio CON CONVERSIÓN */}
        <div className="producto-card-footer">
          {producto.gratis ? (
            <div className="producto-precio-gratis">
              <span className="gratis-text">GRATIS</span>
            </div>
          ) : (
            <div className="producto-precio">
              <span className="producto-precio-actual">
                {precioData.formatted}
              </span>
            </div>
          )}
          
          <button className="producto-btn-ver-mas">
            {producto.gratis ? 'Descargar' : 'Ver detalles'}
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductoCard;