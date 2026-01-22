// ========================================
// 📦 COMPONENTE GENÉRICO DE DETALLE DE PRODUCTO
// Se adapta automáticamente según el tipo
// ========================================

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, Download, Video, FileText, Package, 
  CheckCircle, Star, Users, Clock, Award, Shield, Zap, Gift 
} from 'lucide-react';
import { productosAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCarrito } from '../context/CarritoContext';
import { usePais } from '../context/PaisContext';
import './ProductoDetalle.css';

const ProductoDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario, estaAutenticado } = useAuth();
  const { agregarAlCarrito, estaEnCarrito } = useCarrito();
  
  // ✅ VALIDACIÓN ROBUSTA DEL CONTEXTO
  const paisContext = usePais();
  const convertirPrecio = paisContext?.convertirPrecio || null;
  
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
      
      // ✅ Verificar si usuario ya lo compró
      if (usuario && usuario.productosComprados) {
        const comprado = usuario.productosComprados.some(
          p => {
            const productoId = typeof p.producto === 'object' ? p.producto._id : p.producto;
            return productoId === id && p.estadoPago === 'aprobado';
          }
        );
        setYaComprado(comprado);
      }
    } catch (error) {
      console.error('Error cargando producto:', error);
    } finally {
      setCargando(false);
    }
  };

  // ========================================
  // 💰 OBTENER PRECIO CON CONVERSIÓN (IGUAL QUE CURSOS)
  // ========================================
  const obtenerPrecio = () => {
    if (!producto) return { formatted: '$0', simbolo: '$', precio: 0 };

    console.log('DEBUG PRODUCTO - Título:', producto.titulo);
    console.log('DEBUG PRODUCTO - gratis:', producto.gratis);
    console.log('DEBUG PRODUCTO - precioUSD:', producto.precioUSD);

    // 🆕 SI ES GRATUITO (por campo o por precio 0), MOSTRAR "TOTALMENTE GRATIS"
    if (producto.gratis === true || producto.precioUSD === 0) {
      console.log('✅ PRODUCTO - Detectado como GRATUITO');
      return {
        precio: 0,
        moneda: 'USD',
        simbolo: '',
        formatted: 'TOTALMENTE GRATIS',
        esGratuito: true
      };
    }

    // ✅ VALIDAR QUE convertirPrecio EXISTA Y SEA UNA FUNCIÓN
    if (producto.precioUSD && !isNaN(producto.precioUSD)) {
      if (convertirPrecio && typeof convertirPrecio === 'function') {
        try {
          return convertirPrecio(parseFloat(producto.precioUSD));
        } catch (error) {
          console.error('Error al convertir precio:', error);
          // Fallback a USD
          return {
            precio: producto.precioUSD,
            moneda: 'USD',
            simbolo: '$',
            formatted: `$${parseFloat(producto.precioUSD).toFixed(2)}`
          };
        }
      } else {
        // Si no hay convertirPrecio, usar USD directamente
        console.warn('convertirPrecio no disponible, usando USD');
        return {
          precio: producto.precioUSD,
          moneda: 'USD',
          simbolo: '$',
          formatted: `$${parseFloat(producto.precioUSD).toFixed(2)}`
        };
      }
    }

    // Fallback final
    return { formatted: 'Consultar precio', simbolo: '$', precio: 0 };
  };

  // ========================================
  // 🛒 MANEJO DE COMPRA (IGUAL QUE CURSOS)
  // ========================================
  const handleAgregarCarrito = () => {
    console.log('🛒 Botón Agregar al Carrito clickeado');
    
    if (!estaAutenticado()) {
      console.log('Usuario no autenticado');
      navigate('/login', { state: { from: `/producto/${id}` } });
      return;
    }
    
    console.log('Agregando producto al carrito:', producto);
    const resultado = agregarAlCarrito(producto);
    console.log('Resultado:', resultado);
    
    if (resultado) {
      navigate('/carrito');
    }
  };

  const handleComprarAhora = () => {
    console.log('💳 Botón Comprar Ahora clickeado');
    
    if (!estaAutenticado()) {
      console.log('Usuario no autenticado');
      navigate('/login', { state: { from: `/producto/${id}` } });
      return;
    }
    
    console.log('Agregando producto al carrito:', producto);
    const resultado = agregarAlCarrito(producto);
    console.log('Resultado:', resultado);
    
    if (resultado) {
      console.log('Navegando a checkout');
      navigate('/checkout');
    } else {
      console.log('Ya estaba en carrito, navegando a checkout');
      navigate('/checkout');
    }
  };

  // 🆕 DESCARGA GRATUITA (para productos gratis)
  const handleDescargaGratuita = async () => {
    if (!estaAutenticado()) {
      localStorage.setItem('productoGratuitoId', id);
      navigate('/registro');
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/productos/${id}/descarga-gratuita`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      const data = await response.json();

      if (response.ok) {
        localStorage.removeItem('productoGratuitoId');
        alert('🎉 ¡Producto agregado! Ya puedes descargarlo');
        navigate('/mis-compras');
      } else {
        alert(data.error || 'Error al obtener el producto');
      }
    } catch (error) {
      console.error('❌ Error en descarga gratuita:', error);
      alert('Error al procesar. Intenta nuevamente.');
    }
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

  const enCarrito = estaEnCarrito(producto._id);
  const precioInfo = obtenerPrecio();

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
              {producto.destacado && <span className="badge-destacado">⭐ Destacado</span>}
              {(producto.gratis === true || producto.precioUSD === 0) && (
                <span className="badge-gratis">
                  <Gift size={16} />
                  GRATIS
                </span>
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
                <span>
                  ⭐ {producto.valoracion?.promedio?.toFixed(1) || '5.0'} 
                  ({producto.valoracion?.total || 0})
                </span>
                <span>👥 {producto.totalCompradores || 0} compradores</span>
              </div>
              
              <p className="descripcion">{producto.descripcion}</p>
              
              {/* ✅ PRECIO CON CONVERSIÓN */}
              <div className="precio-box">
                <span className={`precio-actual ${precioInfo.esGratuito ? 'precio-gratis' : ''}`}>
                  {precioInfo.formatted}
                </span>
                {producto.precioAnterior && !precioInfo.esGratuito && (
                  <span className="precio-antes">
                    {precioInfo.simbolo}{producto.precioAnterior}
                  </span>
                )}
              </div>
              
              {/* ✅ BOTONES DE ACCIÓN (IGUAL QUE CURSOS) */}
              <div className="acciones-box">
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
                ) : (producto.gratis === true || producto.precioUSD === 0) ? (
                  // 🆕 BOTÓN DE DESCARGA GRATUITA
                  <button 
                    onClick={handleDescargaGratuita} 
                    className="btn-descarga-gratuita"
                  >
                    <Gift size={20} />
                    Obtener GRATIS
                  </button>
                ) : (
                  // BOTONES DE COMPRA
                  <>
                    <button 
                      onClick={handleComprarAhora} 
                      className="btn-comprar-ahora"
                    >
                      <Zap size={20} />
                      {enCarrito ? 'Ir al Checkout' : 'Comprar Ahora'}
                    </button>
                    {!enCarrito && (
                      <button 
                        onClick={handleAgregarCarrito}
                        className="btn-agregar-carrito"
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
      </section>

      {/* ========================================
          CONTENIDO SEGÚN TIPO
      ======================================== */}
      
      {/* SI ES CURSO → Mostrar videos */}
      {producto.tipo === 'curso' && producto.videos && producto.videos.length > 0 && (
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
      {['libro', 'ebook', 'plantilla', 'guia', 'recurso', 'software'].includes(producto.tipo) && producto.archivos && producto.archivos.length > 0 && (
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
                  
                  {archivo.esVistaPrevia ? (
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
                <span>{item.texto || item}</span>
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
      {producto.metadatos && Object.keys(producto.metadatos).length > 0 && (
        <section className="metadatos">
          <div className="container">
            <h2>Información Adicional</h2>
            <div className="metadatos-grid">
              {renderMetadatos(producto)}
            </div>
          </div>
        </section>
      )}

      {/* ✅ CTA FINAL (IGUAL QUE CURSOS) */}
      {!yaComprado && !(producto.gratis === true || producto.precioUSD === 0) && (
        <section className="cta-final">
          <div className="container">
            <h2>¿Listo para comenzar?</h2>
            <p>Únete a {producto.totalCompradores || 0}+ personas que ya compraron</p>
            <button 
              onClick={handleComprarAhora}
              className="btn-cta-final"
            >
              <Zap size={20} />
              {enCarrito ? 'Finalizar Compra' : `Comprar por ${precioInfo.formatted}`}
            </button>
          </div>
        </section>
      )}

      {/* 🆕 CTA FINAL PARA PRODUCTOS GRATUITOS */}
      {!yaComprado && (producto.gratis === true || producto.precioUSD === 0) && (
        <section className="cta-final-gratuito">
          <div className="container">
            <Gift size={48} />
            <h2>🎉 Producto Completamente GRATIS</h2>
            <p>Obtén acceso inmediato a todo el contenido</p>
            <button 
              onClick={handleDescargaGratuita}
              className="btn-cta-gratuito"
            >
              <Gift size={20} />
              Obtener Ahora Gratis
            </button>
          </div>
        </section>
      )}
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
      <div key="acceso" className="incluye-item">
        <CheckCircle size={24} className="check" />
        <span>Acceso de por vida</span>
      </div>,
      <div key="cert" className="incluye-item">
        <CheckCircle size={24} className="check" />
        <span>Certificado de finalización</span>
      </div>
    );
  }
  
  if (producto.metadatos?.actualizaciones) {
    items.push(
      <div key="updates" className="incluye-item">
        <CheckCircle size={24} className="check" />
        <span>Actualizaciones gratuitas</span>
      </div>
    );
  }
  
  if (producto.metadatos?.soporte) {
    items.push(
      <div key="support" className="incluye-item">
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
    valor: Array.isArray(meta.compatibilidad) ? meta.compatibilidad.join(', ') : meta.compatibilidad
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