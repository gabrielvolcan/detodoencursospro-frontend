// ========================================
// 📦 COMPONENTE GENÉRICO DE DETALLE DE PRODUCTO
// Se adapta automáticamente según el tipo
// ========================================

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, Download, Video, FileText, Package, 
  CheckCircle, Star, Users, Clock, Award, Shield 
} from 'lucide-react';
import { productosAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './ProductoDetalle.css';

const ProductoDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario, estaAutenticado } = useAuth();
  
  const [producto, setProducto] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [yaComprado, setYaComprado] = useState(false);

  useEffect(() => {
    cargarProducto();
  }, [id]);

  const cargarProducto = async () => {
    try {
      const { data } = await productosAPI.obtenerPorId(id);
      setProducto(data);
      
      // Verificar si usuario ya lo compró
      if (usuario) {
        const comprado = usuario.productosComprados?.some(
          p => p.producto === id && p.estadoPago === 'aprobado'
        );
        setYaComprado(comprado);
      }
    } catch (error) {
      console.error('Error cargando producto:', error);
    } finally {
      setCargando(false);
    }
  };

  const manejarCompra = () => {
    if (!estaAutenticado()) {
      navigate('/login', { state: { from: `/producto/${id}` } });
      return;
    }
    
    // Agregar al carrito o ir directo a checkout
    navigate(`/checkout/${id}`);
  };

  const descargarArchivo = async (archivoId) => {
    try {
      const { data } = await productosAPI.descargar(producto._id, archivoId);
      window.open(data.downloadUrl, '_blank');
    } catch (error) {
      alert('Error al descargar. Intenta de nuevo.');
    }
  };

  if (cargando) return <div className="loading">Cargando...</div>;
  if (!producto) return <div className="error">Producto no encontrado</div>;

  // ========================================
  // RENDERIZADO SEGÚN TIPO DE PRODUCTO
  // ========================================
  
  return (
    <div className="producto-detalle">
      {/* HERO SECTION (común para todos) */}
      <section className="producto-hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-imagen">
              <img src={producto.imagen} alt={producto.titulo} />
              {producto.nuevo && <span className="badge-nuevo">Nuevo</span>}
              {producto.oferta?.activa && (
                <span className="badge-oferta">-{producto.oferta.porcentajeDescuento}%</span>
              )}
            </div>
            
            <div className="hero-info">
              <div className="breadcrumb">
                <span>{producto.categoria}</span>
                <span> / </span>
                <span className="tipo-badge">{renderTipoBadge(producto.tipo)}</span>
              </div>
              
              <h1>{producto.titulo}</h1>
              {producto.subtitulo && <p className="subtitulo">{producto.subtitulo}</p>}
              
              <div className="meta-info">
                {producto.metadatos?.instructor && (
                  <span>👨‍🏫 {producto.metadatos.instructor}</span>
                )}
                {producto.metadatos?.autor && (
                  <span>✍️ {producto.metadatos.autor}</span>
                )}
                <span>⭐ {producto.valoracion.promedio.toFixed(1)} ({producto.valoracion.total})</span>
                <span>👥 {producto.estudiantes} estudiantes</span>
              </div>
              
              <p className="descripcion">{producto.descripcion}</p>
              
              {/* PRECIO */}
              <div className="precio-box">
                <span className="precio-actual">${producto.precioUSD}</span>
                {producto.oferta?.activa && (
                  <span className="precio-antes">
                    ${(producto.precioUSD / (1 - producto.oferta.porcentajeDescuento / 100)).toFixed(2)}
                  </span>
                )}
              </div>
              
              {/* BOTÓN DE ACCIÓN */}
              {yaComprado ? (
                <div className="ya-comprado">
                  <CheckCircle size={24} />
                  <span>Ya tienes este producto</span>
                  <button 
                    onClick={() => navigate('/mis-compras')}
                    className="btn-acceder"
                  >
                    Ver mis descargas
                  </button>
                </div>
              ) : (
                <button onClick={manejarCompra} className="btn-comprar">
                  <ShoppingCart size={20} />
                  Comprar ahora
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================
          CONTENIDO SEGÚN TIPO
      ======================================== */}
      
      {/* SI ES CURSO → Mostrar videos */}
      {producto.tipo === 'curso' && (
        <section className="contenido-curso">
          <div className="container">
            <h2>Contenido del Curso</h2>
            <div className="videos-lista">
              {producto.videos.map((video, index) => (
                <div key={index} className="video-item">
                  <Video size={20} />
                  <div>
                    <h4>{video.titulo}</h4>
                    <span>{video.duracion} min</span>
                  </div>
                  {yaComprado && (
                    <button className="btn-ver">Ver</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
      
      {/* SI ES DESCARGABLE → Mostrar archivos */}
      {['libro', 'ebook', 'plantilla', 'guia', 'recurso', 'software'].includes(producto.tipo) && (
        <section className="contenido-descargable">
          <div className="container">
            <h2>Archivos Incluidos</h2>
            <div className="archivos-lista">
              {producto.archivos.map((archivo, index) => (
                <div key={index} className="archivo-item">
                  {renderIconoArchivo(archivo.tipo)}
                  <div className="archivo-info">
                    <h4>{archivo.nombre}</h4>
                    {archivo.descripcion && <p>{archivo.descripcion}</p>}
                    <span className="archivo-meta">
                      {archivo.extension?.toUpperCase()} • {archivo.tamaño}
                    </span>
                  </div>
                  
                  {archivo.esVistPrevia ? (
                    <button 
                      onClick={() => window.open(archivo.url, '_blank')}
                      className="btn-vista-previa"
                    >
                      Vista Previa
                    </button>
                  ) : yaComprado ? (
                    <button 
                      onClick={() => descargarArchivo(archivo._id)}
                      className="btn-descargar"
                    >
                      <Download size={18} />
                      Descargar
                    </button>
                  ) : (
                    <span className="bloqueado">🔒 Compra para descargar</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
      
      {/* LO QUE INCLUYE (común para todos) */}
      <section className="incluye">
        <div className="container">
          <h2>Lo que incluye</h2>
          <div className="incluye-grid">
            {producto.incluye?.map((item, index) => (
              <div key={index} className="incluye-item">
                <CheckCircle size={24} className="check" />
                <span>{item.texto}</span>
              </div>
            ))}
            
            {/* Items por defecto según tipo */}
            {renderItemsPorDefecto(producto)}
          </div>
        </div>
      </section>
      
      {/* DESCRIPCIÓN LARGA */}
      {producto.descripcionLarga && (
        <section className="descripcion-completa">
          <div className="container">
            <h2>Detalles</h2>
            <div 
              className="contenido-html"
              dangerouslySetInnerHTML={{ __html: producto.descripcionLarga }}
            />
          </div>
        </section>
      )}
      
      {/* METADATOS ESPECÍFICOS */}
      <section className="metadatos">
        <div className="container">
          <h2>Información Adicional</h2>
          <div className="metadatos-grid">
            {renderMetadatos(producto)}
          </div>
        </div>
      </section>
    </div>
  );
};

// ========================================
// FUNCIONES AUXILIARES
// ========================================

const renderTipoBadge = (tipo) => {
  const badges = {
    curso: '🎓 Curso',
    libro: '📚 Libro',
    ebook: '📖 Ebook',
    plantilla: '🎨 Plantilla',
    guia: '📄 Guía',
    software: '💾 Software',
    bundle: '📦 Bundle',
    recurso: '🖼️ Recurso',
    otro: '📦 Producto'
  };
  return badges[tipo] || tipo;
};

const renderIconoArchivo = (tipo) => {
  const iconos = {
    pdf: <FileText size={32} color="#ff4444" />,
    zip: <Package size={32} color="#ffa500" />,
    rar: <Package size={32} color="#ffa500" />,
    psd: <FileText size={32} color="#31a8ff" />,
    ai: <FileText size={32} color="#ff9a00" />,
    exe: <Download size={32} color="#00ff88" />,
    dmg: <Download size={32} color="#00ff88" />
  };
  return iconos[tipo] || <FileText size={32} />;
};

const renderItemsPorDefecto = (producto) => {
  const items = [];
  
  if (producto.tipo === 'curso') {
    items.push(
      <div className="incluye-item">
        <CheckCircle size={24} className="check" />
        <span>Acceso de por vida</span>
      </div>,
      <div className="incluye-item">
        <CheckCircle size={24} className="check" />
        <span>Certificado de finalización</span>
      </div>
    );
  }
  
  if (producto.metadatos?.actualizaciones) {
    items.push(
      <div className="incluye-item">
        <CheckCircle size={24} className="check" />
        <span>Actualizaciones gratuitas</span>
      </div>
    );
  }
  
  if (producto.metadatos?.soporte) {
    items.push(
      <div className="incluye-item">
        <CheckCircle size={24} className="check" />
        <span>Soporte: {producto.metadatos.soporte}</span>
      </div>
    );
  }
  
  return items;
};

const renderMetadatos = (producto) => {
  const meta = producto.metadatos || {};
  const items = [];
  
  // Para libros/ebooks
  if (meta.paginas) items.push({ label: 'Páginas', valor: meta.paginas });
  if (meta.autor) items.push({ label: 'Autor', valor: meta.autor });
  if (meta.editorial) items.push({ label: 'Editorial', valor: meta.editorial });
  if (meta.idioma) items.push({ label: 'Idioma', valor: meta.idioma });
  
  // Para software
  if (meta.version) items.push({ label: 'Versión', valor: meta.version });
  if (meta.compatibilidad) items.push({ 
    label: 'Compatibilidad', 
    valor: meta.compatibilidad.join(', ') 
  });
  
  // Para plantillas
  if (meta.software) items.push({ label: 'Software', valor: meta.software });
  if (meta.capas !== undefined) items.push({ 
    label: 'Capas editables', 
    valor: meta.capas ? 'Sí' : 'No' 
  });
  
  return items.map((item, index) => (
    <div key={index} className="meta-item">
      <strong>{item.label}:</strong>
      <span>{item.valor}</span>
    </div>
  ));
};

export default ProductoDetalle;