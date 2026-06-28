import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload, Check, AlertCircle, ArrowLeft, ArrowRight, CreditCard, Package, BookOpen,
} from 'lucide-react';
import { useCarrito } from '../context/CarritoContext';
import { useAuth } from '../context/AuthContext';
import { usePais } from '../context/PaisContext';
import { pagosAPI } from '../services/api';
import PubThumb from '../components/publico/PubThumb';
import '../styles/publico.css';

// Indicador de pasos: 1 Resumen · 2 Pago · 3 Comprobante
const Steps = ({ paso }) => {
  const estado = (n) => (paso > n ? 'done' : paso === n ? 'on' : '');
  const num = (n) => (paso > n ? <Check className="ic ic-s" /> : n);
  return (
    <div className="steps">
      <div className={`step ${estado(1)}`}><span className="step-n">{num(1)}</span><span>Resumen</span></div>
      <div className="step-line"></div>
      <div className={`step ${estado(2)}`}><span className="step-n">{num(2)}</span><span>Pago</span></div>
      <div className="step-line"></div>
      <div className={`step ${estado(3)}`}><span className="step-n">3</span><span>Comprobante</span></div>
    </div>
  );
};

const CheckoutManual = () => {
  const { items, vaciarCarrito } = useCarrito();
  const { estaAutenticado } = useAuth();
  const { paisSeleccionado, obtenerMoneda, precioDeItem, formatearMonto, obtenerPaisActual } = usePais();
  const navigate = useNavigate();

  const [metodoSeleccionado, setMetodoSeleccionado] = useState(null);
  const [comprobanteArchivo, setComprobanteArchivo] = useState(null);
  const [comprobantePreview, setComprobantePreview] = useState('');
  const [subiendo, setSubiendo] = useState(false);
  const [ordenCreada, setOrdenCreada] = useState(null);
  // paso: 1 = Resumen · 2 = Pago (método) · 3 = Comprobante · enviado = éxito
  const [paso, setPaso] = useState(1);
  const [enviado, setEnviado] = useState(false);
  const [metodosPais, setMetodosPais] = useState(null);
  const [cargandoMetodos, setCargandoMetodos] = useState(true);

  const monedaPais = obtenerMoneda(paisSeleccionado);
  const paisActual = obtenerPaisActual();

  // Los métodos de pago (datos sensibles) se piden al backend, ya no viven en el bundle.
  useEffect(() => {
    let activo = true;
    setCargandoMetodos(true);
    setMetodoSeleccionado(null);
    pagosAPI.obtenerMetodosPago(paisSeleccionado)
      .then(({ data }) => { if (activo) setMetodosPais(data); })
      .catch(() => { if (activo) setMetodosPais(null); })
      .finally(() => { if (activo) setCargandoMetodos(false); });
    return () => { activo = false; };
  }, [paisSeleccionado]);

  // ========================================
  // 💰 FUNCIÓN PARA OBTENER PRECIO (CURSOS Y PRODUCTOS)
  // ========================================
  const obtenerPrecio = (item) => {
    // Si tiene precios por país (mismo valor que registra el backend)
    if (item.precios && item.precios[paisSeleccionado] && item.precios[paisSeleccionado].monto != null) {
      return Number(item.precios[paisSeleccionado].monto);
    }
    // Conversión centralizada en PaisContext (única fuente de verdad)
    if (item.precioUSD != null && !isNaN(item.precioUSD)) {
      return precioDeItem(item).precio;
    }
    // Fallback precio viejo
    if (item.precio) {
      return Number(item.precio);
    }
    return 0;
  };

  // Calcular total según el país
  const calcularTotal = () => items.reduce((total, item) => total + obtenerPrecio(item), 0);

  const totalPais = calcularTotal();
  const totalFormateado = formatearMonto(totalPais, monedaPais);

  useEffect(() => {
    if (!estaAutenticado) {
      navigate('/login?redirect=/checkout');
    }
    if (items.length === 0 && !enviado) {
      navigate('/cursos');
    }
  }, [estaAutenticado, items]);

  const crearOrden = async () => {
    try {
      setSubiendo(true);
      // ✅ Separar cursos y productos
      const cursosIds = items.filter((item) => item.tipo === undefined || item.tipo === 'curso').map((c) => c._id);
      const productosIds = items.filter((item) => item.tipo && item.tipo !== 'curso').map((p) => p._id);

      const { data } = await pagosAPI.crearOrdenManual({
        cursosIds,
        productosIds, // ✅ Agregar productos
        metodoPago: {
          tipo: 'transferencia',
          nombre: metodoSeleccionado.nombre,
          pais: paisSeleccionado,
        },
        moneda: monedaPais,
        pais: paisSeleccionado,
      });

      setOrdenCreada(data);
      setPaso(3);
    } catch (error) {
      console.error('Error completo:', error);
      alert('Error al crear la orden: ' + (error.response?.data?.error || error.message));
    } finally {
      setSubiendo(false);
    }
  };

  const handleArchivoChange = (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;

    if (archivo.size > 5 * 1024 * 1024) {
      alert('El archivo es muy grande. Máximo 5MB');
      return;
    }
    if (!archivo.type.startsWith('image/')) {
      alert('Solo se permiten imágenes');
      return;
    }

    setComprobanteArchivo(archivo);
    const reader = new FileReader();
    reader.onloadend = () => setComprobantePreview(reader.result);
    reader.readAsDataURL(archivo);
  };

  const subirComprobante = async () => {
    if (!comprobanteArchivo) {
      alert('Por favor selecciona una imagen del comprobante');
      return;
    }
    try {
      setSubiendo(true);
      const formData = new FormData();
      formData.append('comprobante', comprobanteArchivo);
      await pagosAPI.subirComprobante(ordenCreada.compraId, formData);
      vaciarCarrito();
      setEnviado(true);
    } catch (error) {
      alert('Error al subir comprobante: ' + (error.response?.data?.error || error.message));
    } finally {
      setSubiendo(false);
    }
  };

  // ===== Éxito =====
  if (enviado) {
    return (
      <div className="pub">
        <section className="sec" style={{ paddingTop: 46 }}>
          <div className="shell" style={{ maxWidth: 760 }}>
            <div className="card tc" style={{ padding: '48px 28px' }}>
              <div className="auth-ic" style={{ marginBottom: 6 }}><Check className="ic ic-lg" /></div>
              <h2 className="h2" style={{ margin: '14px 0 10px' }}>¡Pedido enviado!</h2>
              <p className="muted" style={{ maxWidth: 420, margin: '0 auto 8px' }}>
                Recibimos tu comprobante. Verificaremos el pago y habilitaremos tu acceso en breve. Te avisaremos por email.
              </p>
              <p className="muted sm" style={{ marginBottom: 24 }}>⏱️ Tiempo de revisión: 24-48 horas hábiles</p>
              <div className="fx ac jc gap12 wrap">
                <button className="btn btnp btn-lg" onClick={() => navigate('/mis-compras')}><Package className="ic" />Ver mis compras</button>
                <button className="btn btno btn-lg" onClick={() => navigate('/cursos')}>Seguir comprando</button>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="pub">
      <section className="sec" style={{ paddingTop: 46 }}>
        <div className="shell" style={{ maxWidth: 760 }}>
          <h1 className="h2 tc" style={{ marginBottom: 6 }}>Finalizar Compra</h1>
          <p className="muted tc" style={{ marginBottom: 36 }}>Pago manual · Precios en {paisActual?.nombre || 'Internacional'}</p>

          <Steps paso={paso} />

          {/* PASO 1 · Resumen */}
          {paso === 1 && (
            <>
              <div className="card" style={{ padding: 28 }}>
                <h3 className="h3" style={{ marginBottom: 18 }}>Resumen del pedido</h3>
                {items.map((item, i) => {
                  const esProducto = item.tipo && item.tipo !== 'curso';
                  return (
                    <div key={item._id} className="fx ac gap14" style={{ padding: '12px 0', borderBottom: '1px solid var(--bd)' }}>
                      <PubThumb src={item.imagen} alt={item.titulo} index={i} icon={esProducto ? Package : BookOpen} className="cart-thumb thumb" style={{ width: 64 }} />
                      <div style={{ flex: 1 }}>
                        <div className="fw6 sm">{item.titulo}</div>
                        <div className="muted xs" style={{ marginTop: 3 }}>{esProducto ? item.tipo : (item.categoria || 'Curso')}</div>
                      </div>
                      <div className="fw7 green">{formatearMonto(obtenerPrecio(item), monedaPais)}</div>
                    </div>
                  );
                })}
                <div className="sum-total"><span className="fw7">Total a pagar</span><b className="green">{totalFormateado}</b></div>
              </div>
              <button className="btn btnp btn-block btn-lg" style={{ marginTop: 22 }} onClick={() => setPaso(2)}>
                Continuar al pago<ArrowRight className="ic" />
              </button>
            </>
          )}

          {/* PASO 2 · Método de pago */}
          {paso === 2 && (
            <>
              <h3 className="h3" style={{ marginBottom: 6 }}>Elige tu método de pago</h3>
              <p className="muted sm" style={{ marginBottom: 20 }}>Disponibles para {metodosPais?.nombre || paisActual?.nombre || 'tu país'}. Tras pagar, sube tu comprobante.</p>

              {cargandoMetodos ? (
                <p className="muted">Cargando métodos de pago...</p>
              ) : !metodosPais || !metodosPais.metodos?.length ? (
                <div className="alert alert-err"><AlertCircle className="ic ic-s" />No se pudieron cargar los métodos de pago. Recarga la página o contáctanos.</div>
              ) : (
                metodosPais.metodos.map((metodo, index) => {
                  const activo = metodoSeleccionado === metodo;
                  return (
                    <div key={index}>
                      <div className={`pay ${activo ? 'on' : ''}`} onClick={() => setMetodoSeleccionado(metodo)}>
                        <div className="pay-ic"><CreditCard className="ic" /></div>
                        <span className="fw7">{metodo.nombre}</span>
                        <span className="radio"></span>
                      </div>
                      {activo && (
                        <div className="card" style={{ padding: 20, margin: '0 0 12px' }}>
                          <h4 className="fw7 sm" style={{ margin: '0 0 10px' }}>📋 Datos para la transferencia</h4>
                          <pre className="pay-instr">{metodo.instrucciones}</pre>
                          <div className="alert alert-warn" style={{ marginTop: 12 }}>
                            <AlertCircle className="ic ic-s" />Realiza el pago por el monto exacto de <strong>&nbsp;{totalFormateado}</strong>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}

              <div className="fx gap12" style={{ marginTop: 22 }}>
                <button className="btn btng btn-lg" onClick={() => setPaso(1)}><ArrowLeft className="ic" />Atrás</button>
                <button className="btn btnp btn-lg f1" onClick={crearOrden} disabled={!metodoSeleccionado || subiendo}>
                  {subiendo ? 'Procesando...' : 'Ya realicé el pago'}<ArrowRight className="ic" />
                </button>
              </div>
            </>
          )}

          {/* PASO 3 · Comprobante */}
          {paso === 3 && (
            <>
              <div className="card" style={{ padding: 28 }}>
                <div className="fx ac jb wrap gap12" style={{ marginBottom: 20 }}>
                  <div>
                    <div className="muted xs">Método seleccionado</div>
                    <div className="fw7 green" style={{ marginTop: 3 }}>{metodoSeleccionado?.nombre}</div>
                  </div>
                  <div className="tc">
                    <div className="muted xs">Total</div>
                    <div className="fw8" style={{ marginTop: 3, fontSize: 20 }}>{totalFormateado}</div>
                  </div>
                </div>
                <p className="fw7 sm" style={{ margin: '0 0 12px' }}>Sube tu comprobante de pago</p>

                <input type="file" accept="image/*" id="comprobante-file" onChange={handleArchivoChange} style={{ display: 'none' }} />
                <label htmlFor="comprobante-file" className="drop" style={{ display: 'block' }}>
                  <div className="empty-ic" style={{ width: 54, height: 54, borderRadius: 14, margin: '0 auto' }}><Upload className="ic" /></div>
                  <p className="fw6 sm" style={{ margin: '8px 0 4px' }}>
                    {comprobanteArchivo ? comprobanteArchivo.name : 'Haz clic para subir una imagen'}
                  </p>
                  <p className="muted xs" style={{ margin: 0 }}>PNG o JPG · máx 5MB · debe verse el monto y la fecha</p>
                </label>

                {comprobantePreview && (
                  <img src={comprobantePreview} alt="Comprobante" style={{ display: 'block', maxWidth: '100%', borderRadius: 12, marginTop: 16, border: '1px solid var(--bd)' }} />
                )}
              </div>

              <div className="fx gap12" style={{ marginTop: 22 }}>
                <button className="btn btng btn-lg" onClick={() => setPaso(2)}><ArrowLeft className="ic" />Atrás</button>
                <button className="btn btnp btn-lg f1" onClick={subirComprobante} disabled={!comprobanteArchivo || subiendo}>
                  <Check className="ic" />{subiendo ? 'Enviando...' : 'Confirmar compra'}
                </button>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default CheckoutManual;
