import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package, Clock, CheckCircle, XCircle, Eye, FileText, Download, BookOpen, ArrowRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getComprobanteUrl, pagosAPI } from '../services/api';
import '../styles/publico.css';

const ESTADOS = {
  pendiente: { texto: 'Pendiente', pill: 'st-pend', icono: Clock },
  en_revision: { texto: 'En Revisión', pill: 'st-pend', icono: Eye },
  aprobado: { texto: 'Aprobado', pill: 'st-aprob', icono: CheckCircle },
  rechazado: { texto: 'Rechazado', pill: 'st-rech', icono: XCircle },
};

const MisCompras = () => {
  const { estaAutenticado } = useAuth();
  const navigate = useNavigate();
  const [compras, setCompras] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [comprobanteCargando, setComprobanteCargando] = useState(null);

  useEffect(() => {
    if (!estaAutenticado) { navigate('/login'); return; }
    cargarCompras();
  }, [estaAutenticado]);

  const cargarCompras = async () => {
    try {
      const { data } = await pagosAPI.misCompras();
      setCompras(data);
    } catch (error) {
      console.error('Error cargando compras:', error);
    } finally {
      setCargando(false);
    }
  };

  const verComprobante = async (compraId) => {
    try {
      setComprobanteCargando(compraId);
      const url = await getComprobanteUrl(compraId);
      window.open(url, '_blank', 'noopener,noreferrer');
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (error) {
      console.error('Error cargando comprobante:', error);
      alert('No se pudo cargar el comprobante.');
    } finally {
      setComprobanteCargando(null);
    }
  };

  if (cargando) {
    return (
      <div className="pub"><section className="sec" style={{ paddingTop: 80 }}><div className="shell tc">
        <p className="muted">Cargando tus compras...</p>
      </div></section></div>
    );
  }

  return (
    <div className="pub">
      <div className="pagehead"><div className="hero-bg"></div><div className="shell">
        <h1 className="h1">Mis Compras</h1>
        <p className="lead" style={{ marginTop: 12 }}>Historial completo de tus pedidos</p>
      </div></div>

      <section className="sec" style={{ paddingTop: 40 }}>
        <div className="shell">
          {compras.length === 0 ? (
            <div className="empty">
              <div className="empty-ic"><Package className="ic ic-lg" /></div>
              <h2 className="h3">No tienes compras aún</h2>
              <p className="muted" style={{ margin: '8px 0 22px' }}>Explora nuestro catálogo y comienza a aprender</p>
              <button className="btn btnp btn-lg" onClick={() => navigate('/cursos')}>Ver Cursos</button>
            </div>
          ) : (
            compras.map((compra) => {
              const est = ESTADOS[compra.estadoPago] || ESTADOS.pendiente;
              const EstIcon = est.icono;
              const tieneCursos = compra.cursos?.length > 0;
              const tieneProductos = compra.productos?.length > 0;
              return (
                <div key={compra._id} className="card" style={{ padding: 24, marginBottom: 16 }}>
                  {/* header */}
                  <div className="fx ac jb wrap gap12" style={{ marginBottom: 16 }}>
                    <div>
                      <div className="fw7" style={{ fontSize: 17 }}>Orden #{compra._id.slice(-8).toUpperCase()}</div>
                      <div className="muted xs" style={{ marginTop: 4 }}>
                        {new Date(compra.createdAt).toLocaleDateString('es', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <span className={`pill ${est.pill}`}><EstIcon className="ic ic-s" />{est.texto}</span>
                  </div>

                  {/* detalles */}
                  <div className="fx wrap gap12" style={{ paddingBottom: 16, marginBottom: 16, borderBottom: '1px solid var(--bd)' }}>
                    <span className="muted sm">Método: <span className="fw6" style={{ color: 'var(--ink)' }}>{compra.metodoPago?.nombre || '—'}</span></span>
                    <span className="muted sm">País: <span className="fw6" style={{ color: 'var(--ink)' }}>{compra.metodoPago?.pais || '—'}</span></span>
                    <span className="muted sm">Total: <span className="fw8 green">${compra.total.toFixed(2)} {compra.moneda}</span></span>
                  </div>

                  {/* cursos */}
                  {tieneCursos && (
                    <div style={{ marginBottom: 12 }}>
                      <p className="fw7 sm" style={{ margin: '0 0 8px' }}>Cursos</p>
                      {compra.cursos.map((item) => (
                        <div key={item._id} className="fx ac gap12" style={{ padding: '8px 0' }}>
                          <img src={item.curso?.imagen} alt={item.curso?.titulo} style={{ width: 52, height: 34, objectFit: 'cover', borderRadius: 8 }} />
                          <span className="fw6 sm" style={{ flex: 1 }}>{item.curso?.titulo}</span>
                          <span className="muted sm">${item.precio}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* productos */}
                  {tieneProductos && (
                    <div style={{ marginBottom: 12 }}>
                      <p className="fw7 sm" style={{ margin: '0 0 8px' }}>Productos</p>
                      {compra.productos.map((item) => (
                        <div key={item._id} className="fx ac gap12 wrap" style={{ padding: '8px 0' }}>
                          <img src={item.producto?.imagen} alt={item.producto?.titulo} style={{ width: 52, height: 34, objectFit: 'cover', borderRadius: 8 }} />
                          <span className="fw6 sm" style={{ flex: 1 }}>{item.producto?.titulo}</span>
                          <span className="muted sm">${item.precio}</span>
                          {compra.estadoPago === 'aprobado' && item.producto?._id && item.producto?.libro?.archivoId && (
                            <button className="btn btnp btn-sm" onClick={() => navigate(`/leer/${item.producto._id}`)}><BookOpen className="ic ic-s" />Leer ahora</button>
                          )}
                          {compra.estadoPago === 'aprobado' && item.producto?._id && !item.producto?.libro?.archivoId && (
                            <button className="btn btnp btn-sm" onClick={() => navigate(`/producto/${item.producto._id}`)}><Download className="ic ic-s" />Descargar</button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* comprobante */}
                  {compra.comprobante?.url && (
                    <button className="btn btng btn-sm" onClick={() => verComprobante(compra._id)} disabled={comprobanteCargando === compra._id}>
                      <FileText className="ic ic-s" />{comprobanteCargando === compra._id ? 'Cargando...' : 'Ver comprobante subido'}
                    </button>
                  )}

                  {/* estados */}
                  {compra.estadoPago === 'rechazado' && compra.notasAdmin && (
                    <div className="alert alert-err" style={{ marginTop: 14, flexDirection: 'column', alignItems: 'flex-start' }}>
                      <strong>⚠️ Motivo del rechazo:</strong>
                      <p style={{ margin: '6px 0 10px', fontWeight: 500 }}>{compra.notasAdmin}</p>
                      <button className="btn btnp btn-sm" onClick={() => navigate('/cursos')}>Volver a intentar</button>
                    </div>
                  )}

                  {compra.estadoPago === 'aprobado' && (
                    <div className="alert alert-ok" style={{ marginTop: 14, justifyContent: 'space-between', flexWrap: 'wrap' }}>
                      <span className="mi"><CheckCircle className="ic ic-s" />
                        {tieneCursos && tieneProductos && 'Pago aprobado. Tus cursos están en "Mis Cursos"; tus libros/productos los leés o descargás arriba.'}
                        {tieneCursos && !tieneProductos && '¡Pago aprobado! Ya podés acceder a tus cursos.'}
                        {!tieneCursos && tieneProductos && '¡Pago aprobado! Ya podés leer o descargar lo que compraste arriba.'}
                        {!tieneCursos && !tieneProductos && '¡Pago aprobado!'}
                      </span>
                      {tieneCursos && (
                        <button className="btn btnp btn-sm" onClick={() => navigate('/mis-cursos-aprender')}>Ir a Mis Cursos<ArrowRight className="ic ic-s" /></button>
                      )}
                    </div>
                  )}

                  {compra.estadoPago === 'pendiente' && !compra.comprobante?.url && (
                    <div className="alert alert-warn" style={{ marginTop: 14 }}><Clock className="ic ic-s" />Esperando que subas el comprobante de pago</div>
                  )}

                  {compra.estadoPago === 'en_revision' && (
                    <div className="alert alert-warn" style={{ marginTop: 14 }}><Eye className="ic ic-s" />Tu comprobante está siendo revisado. Te notificaremos por email.</div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
};

export default MisCompras;
