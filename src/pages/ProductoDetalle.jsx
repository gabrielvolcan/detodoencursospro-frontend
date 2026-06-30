// ========================================
// 📦 COMPONENTE GENÉRICO DE DETALLE DE PRODUCTO
// Se adapta automáticamente según el tipo
// ========================================

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ShoppingCart, Download, Video, FileText, Package,
  CheckCircle, Star, Users, Zap, Gift, Lock, BookOpen,
} from 'lucide-react';
import DOMPurify from 'dompurify';
import { productosAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCarrito } from '../context/CarritoContext';
import { usePais } from '../context/PaisContext';
import PubThumb from '../components/publico/PubThumb';
import { trackViewItem } from '../utils/analytics';
import '../styles/publico.css';

const ProductoDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario, estaAutenticado } = useAuth();
  const { agregarAlCarrito, estaEnCarrito } = useCarrito();

  // ✅ Validación robusta del contexto
  const paisContext = usePais();
  const convertirPrecio = paisContext?.convertirPrecio || null;

  const [producto, setProducto] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [yaComprado, setYaComprado] = useState(false);
  const [imgActiva, setImgActiva] = useState(0);

  useEffect(() => { cargarProducto(); }, [id]);

  const cargarProducto = async () => {
    try {
      const { data } = await productosAPI.obtenerPorId(id);
      setProducto(data);
      trackViewItem({ id: data._id, name: data.titulo, category: data.tipo, price: data.precioUSD });
      if (usuario && usuario.productosComprados) {
        const comprado = usuario.productosComprados.some((p) => {
          const productoId = typeof p.producto === 'object' ? p.producto._id : p.producto;
          return productoId === id && p.estadoPago === 'aprobado';
        });
        setYaComprado(comprado);
      }
    } catch (error) {
      console.error('Error cargando producto:', error);
    } finally {
      setCargando(false);
    }
  };

  // 💰 Precio con conversión (igual que cursos)
  const obtenerPrecio = () => {
    if (!producto) return { formatted: '$0', simbolo: '$', precio: 0 };
    if (producto.gratis === true) {
      return { precio: 0, moneda: 'USD', simbolo: '', formatted: 'GRATIS', esGratuito: true };
    }
    if (producto.precioUSD && !Number.isNaN(Number(producto.precioUSD))) {
      if (typeof convertirPrecio === 'function') {
        try {
          return convertirPrecio(parseFloat(producto.precioUSD));
        } catch (error) {
          console.error('Error al convertir precio:', error);
          return { precio: producto.precioUSD, moneda: 'USD', simbolo: '$', formatted: `$${parseFloat(producto.precioUSD).toFixed(2)}` };
        }
      }
      console.warn('convertirPrecio no disponible, usando USD');
      return { precio: producto.precioUSD, moneda: 'USD', simbolo: '$', formatted: `$${parseFloat(producto.precioUSD).toFixed(2)}` };
    }
    return { formatted: 'Consultar precio', simbolo: '$', precio: 0 };
  };

  // 🛒 Compra: si no hay sesión, mandamos a registrarse (guardamos a dónde volver)
  const irARegistro = () => {
    localStorage.setItem('intentoCompraProductoId', id);
    navigate('/registro');
  };

  const handleAgregarCarrito = () => {
    if (!estaAutenticado) { irARegistro(); return; }
    if (agregarAlCarrito(producto)) {
      alert('✅ Producto agregado al carrito');
    } else {
      alert('ℹ️ Este producto ya está en tu carrito');
    }
  };

  const handleComprarAhora = () => {
    if (!estaAutenticado) { irARegistro(); return; }
    agregarAlCarrito(producto);
    navigate('/carrito');
  };

  // Descarga gratuita (productos gratis)
  const handleDescargaGratuita = async () => {
    if (!estaAutenticado) {
      localStorage.setItem('productoGratuitoId', id);
      navigate('/registro');
      return;
    }
    try {
      const { data } = await productosAPI.descargaGratuita(id);
      localStorage.removeItem('productoGratuitoId');
      if (data.archivoURL) window.open(data.archivoURL, '_blank');
      alert('🎉 ¡Producto agregado! Ya podés descargarlo desde "Mis Compras".');
      navigate('/mis-compras');
    } catch (error) {
      console.error('Error en descarga gratuita:', error);
      alert(error.response?.data?.error || 'Error al procesar. Intentá nuevamente.');
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

  if (cargando) {
    return (
      <div className="pub"><section className="sec" style={{ paddingTop: 80 }}><div className="shell tc">
        <p className="muted">Cargando...</p>
      </div></section></div>
    );
  }
  if (!producto) {
    return (
      <div className="pub"><section className="sec" style={{ paddingTop: 80 }}><div className="shell tc">
        <p className="muted">Producto no encontrado</p>
      </div></section></div>
    );
  }

  const esGratis = producto.gratis === true;
  const enCarrito = estaEnCarrito(producto._id);
  const precioInfo = obtenerPrecio();
  const esDescargable = ['libro', 'ebook', 'plantilla', 'guia', 'recurso', 'software'].includes(producto.tipo);
  // Galería: portada + imágenes adicionales (sin duplicados ni vacíos)
  const galeria = [producto.imagen, ...(producto.imagenes || [])].filter((v, i, a) => v && a.indexOf(v) === i);
  const imgPrincipal = galeria[imgActiva] || galeria[0];

  return (
    <div className="pub">
      {/* HERO */}
      <section className="cd-hero">
        <div className="hero-bg"></div>
        <div className="shell pd-in">
          <div className="pd-gallery">
            <PubThumb src={imgPrincipal} alt={producto.titulo} icon={Package} className="pd-cover thumb" />
            {galeria.length > 1 && (
              <div className="pd-thumbs">
                {galeria.map((src, i) => (
                  <button
                    key={src}
                    type="button"
                    className={`pd-thumb ${i === imgActiva ? 'on' : ''}`}
                    onClick={() => setImgActiva(i)}
                    aria-label={`Foto ${i + 1}`}
                  >
                    <img src={src} alt={`${producto.titulo} ${i + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div>
            <div className="fx ac gap10" style={{ marginBottom: 16 }}>
              <span className="muted fw6">{producto.categoria}</span>
              <span className="muted">/</span>
              <span className="pill pill-g">{renderTipoBadge(producto.tipo)}</span>
              {esGratis && <span className="pill pill-g">GRATIS</span>}
            </div>
            <h1 className="h1 green" style={{ margin: 0 }}>{producto.titulo}</h1>
            {producto.subtitulo && <p className="lead" style={{ marginTop: 10 }}>{producto.subtitulo}</p>}
            <div className="cd-meta" style={{ margin: '18px 0 20px' }}>
              <span className="mi"><Star className="ic ic-s star" />{producto.valoracion?.promedio?.toFixed(1) || '5.0'} ({producto.valoracion?.total || 0})</span>
              <span className="mi"><Users className="ic ic-s" />{producto.totalCompradores || 0} compradores</span>
              {producto.metadatos?.instructor && <span className="mi">👨‍🏫 {producto.metadatos.instructor}</span>}
              {producto.metadatos?.autor && <span className="mi">✍️ {producto.metadatos.autor}</span>}
            </div>
            <p className="lead" style={{ marginBottom: 24 }}>{producto.descripcion}</p>
            <div className="buybox-price" style={{ fontSize: 38 }}>
              {precioInfo.formatted}
              {producto.precioAnterior && !precioInfo.esGratuito && (
                <span className="muted" style={{ fontSize: 18, marginLeft: 12, textDecoration: 'line-through', fontWeight: 600 }}>{precioInfo.simbolo}{producto.precioAnterior}</span>
              )}
            </div>

            {/* ACCIONES */}
            {yaComprado ? (
              <div className="bullets" style={{ maxWidth: 440 }}>
                <span className="mi"><CheckCircle className="ic ic-s" />Ya tienes este producto</span>
                <div className="fx gap12 wrap" style={{ marginTop: 6 }}>
                  {producto.libro?.archivoId && (
                    <button className="btn btnp" onClick={() => navigate(`/leer/${producto._id}`)}><BookOpen className="ic ic-s" />Leer ahora</button>
                  )}
                  <button className="btn btno" onClick={() => navigate('/mis-compras')}>Ver mis compras</button>
                </div>
              </div>
            ) : esGratis ? (
              <button className="btn btnp btn-block btn-lg" style={{ maxWidth: 440 }} onClick={handleDescargaGratuita}><Gift className="ic" />Obtener GRATIS</button>
            ) : (
              <>
                <button className="btn btnp btn-block btn-lg" style={{ marginBottom: 12, maxWidth: 440 }} onClick={handleComprarAhora}>
                  <Zap className="ic" />{enCarrito ? 'Ir al Checkout' : 'Comprar Ahora'}
                </button>
                {!enCarrito && (
                  <button className="btn btno btn-block btn-lg" style={{ maxWidth: 440 }} onClick={handleAgregarCarrito}><ShoppingCart className="ic" />Agregar al Carrito</button>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* CONTENIDO: CURSO (videos) */}
      {producto.tipo === 'curso' && producto.videos?.length > 0 && (
        <section className="sec" style={{ paddingTop: 40 }}>
          <div className="shell" style={{ maxWidth: 820 }}>
            <h2 className="h2 tc" style={{ marginBottom: 24 }}>Contenido del Curso</h2>
            <div className="card" style={{ padding: 8 }}>
              {producto.videos.map((video, index) => (
                <div className="lesson" key={index} style={{ padding: '14px 16px' }}>
                  <Video className="ic ic-s" />
                  <span style={{ flex: 1 }}>{video.titulo}</span>
                  <span className="muted xs">{video.duracion} min</span>
                  {yaComprado && <button className="btn btng btn-sm" style={{ marginLeft: 10 }}>Ver</button>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CONTENIDO: DESCARGABLES (archivos) */}
      {esDescargable && producto.archivos?.length > 0 && (
        <section className="sec" style={{ paddingTop: 40 }}>
          <div className="shell" style={{ maxWidth: 820 }}>
            <h2 className="h2 tc" style={{ marginBottom: 24 }}>Archivos Incluidos</h2>
            {producto.archivos.map((archivo, index) => (
              <div className="cart-row" key={index}>
                <div className="pay-ic">{renderIconoArchivo(archivo.tipo)}</div>
                <div style={{ flex: 1 }}>
                  <div className="fw7">{archivo.nombre}</div>
                  {archivo.descripcion && <div className="muted sm" style={{ marginTop: 3 }}>{archivo.descripcion}</div>}
                  <div className="muted xs" style={{ marginTop: 4 }}>{archivo.extension?.toUpperCase()} · {archivo.tamaño}</div>
                </div>
                {archivo.esVistaPrevia ? (
                  <button className="btn btno btn-sm" onClick={() => window.open(archivo.url, '_blank')}>Vista Previa</button>
                ) : yaComprado ? (
                  <button className="btn btnp btn-sm" onClick={() => descargarArchivo(archivo._id)}><Download className="ic ic-s" />Descargar</button>
                ) : (
                  <span className="mi muted sm"><Lock className="ic ic-s" />Compra para descargar</span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* LO QUE INCLUYE */}
      <section className="sec" style={{ paddingTop: 40 }}>
        <div className="shell" style={{ maxWidth: 820 }}>
          <h2 className="h2 tc" style={{ marginBottom: 28 }}>Lo que incluye</h2>
          <div className="out">
            {(producto.incluye || []).map((item, index) => (
              <div className="out-i" key={index}><CheckCircle className="ic" /><span>{item.texto || item}</span></div>
            ))}
            {renderItemsPorDefecto(producto)}
          </div>
        </div>
      </section>

      {/* DESCRIPCIÓN LARGA */}
      {producto.descripcionLarga && (
        <section className="sec" style={{ paddingTop: 0 }}>
          <div className="shell" style={{ maxWidth: 820 }}>
            <h2 className="h2" style={{ marginBottom: 18 }}>Detalles</h2>
            <div className="card legal-card" style={{ padding: 28 }}
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(producto.descripcionLarga || '') }} />
          </div>
        </section>
      )}

      {/* METADATOS */}
      {producto.metadatos && Object.keys(producto.metadatos).length > 0 && (
        <section className="sec" style={{ paddingTop: 0 }}>
          <div className="shell" style={{ maxWidth: 820 }}>
            <h2 className="h2" style={{ marginBottom: 18 }}>Información Adicional</h2>
            <div className="out">{renderMetadatos(producto)}</div>
          </div>
        </section>
      )}

      {/* CTA FINAL */}
      {!yaComprado && (
        <div className="cta-band">
          <div className="shell" style={{ maxWidth: 560 }}>
            <h2 className="h2">{esGratis ? '🎉 Producto Completamente GRATIS' : '¿Listo para comenzar?'}</h2>
            <p className="muted" style={{ margin: '12px 0 26px' }}>
              {esGratis ? 'Obtén acceso inmediato a todo el contenido' : `Únete a ${producto.totalCompradores || 0}+ personas que ya compraron`}
            </p>
            {esGratis ? (
              <button className="btn btnp btn-lg" onClick={handleDescargaGratuita}><Gift className="ic" />Obtener Ahora Gratis</button>
            ) : (
              <button className="btn btnp btn-lg" onClick={handleComprarAhora}><Zap className="ic" />{enCarrito ? 'Finalizar Compra' : `Comprar por ${precioInfo.formatted}`}</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ========================================
// FUNCIONES AUXILIARES
// ========================================

const renderTipoBadge = (tipo) => {
  const badges = {
    curso: '🎓 Curso', libro: '📚 Libro', ebook: '📖 Ebook', plantilla: '🎨 Plantilla',
    guia: '📄 Guía', software: '💾 Software', bundle: '📦 Bundle', recurso: '🖼️ Recurso', otro: '📦 Producto',
  };
  return badges[tipo] || tipo;
};

const renderIconoArchivo = (tipo) => {
  const iconos = {
    pdf: <FileText className="ic" />, zip: <Package className="ic" />, rar: <Package className="ic" />,
    psd: <FileText className="ic" />, ai: <FileText className="ic" />, exe: <Download className="ic" />, dmg: <Download className="ic" />,
  };
  return iconos[tipo] || <FileText className="ic" />;
};

const renderItemsPorDefecto = (producto) => {
  const items = [];
  if (producto.tipo === 'curso') {
    items.push(
      <div key="acceso" className="out-i"><CheckCircle className="ic" /><span>Acceso de por vida</span></div>,
      <div key="cert" className="out-i"><CheckCircle className="ic" /><span>Certificado de finalización</span></div>,
    );
  }
  if (producto.metadatos?.actualizaciones) {
    items.push(<div key="updates" className="out-i"><CheckCircle className="ic" /><span>Actualizaciones gratuitas</span></div>);
  }
  if (producto.metadatos?.soporte) {
    items.push(<div key="support" className="out-i"><CheckCircle className="ic" /><span>Soporte: {producto.metadatos.soporte}</span></div>);
  }
  return items;
};

const renderMetadatos = (producto) => {
  const meta = producto.metadatos || {};
  const items = [];
  if (meta.paginas) items.push({ label: 'Páginas', valor: meta.paginas });
  if (meta.autor) items.push({ label: 'Autor', valor: meta.autor });
  if (meta.editorial) items.push({ label: 'Editorial', valor: meta.editorial });
  if (meta.idioma) items.push({ label: 'Idioma', valor: meta.idioma });
  if (meta.version) items.push({ label: 'Versión', valor: meta.version });
  if (meta.compatibilidad) items.push({ label: 'Compatibilidad', valor: Array.isArray(meta.compatibilidad) ? meta.compatibilidad.join(', ') : meta.compatibilidad });
  if (meta.software) items.push({ label: 'Software', valor: meta.software });
  if (meta.capas !== undefined) items.push({ label: 'Capas editables', valor: meta.capas ? 'Sí' : 'No' });

  return items.map((item, index) => (
    <div key={index} className="out-i" style={{ borderLeftColor: 'var(--bd)' }}>
      <span className="muted">{item.label}:</span>
      <span className="fw6">{item.valor}</span>
    </div>
  ));
};

export default ProductoDetalle;
