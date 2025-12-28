import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Check, X, AlertCircle } from 'lucide-react';
import { useCarrito } from '../context/CarritoContext';
import { useAuth } from '../context/AuthContext';
import { usePais } from '../context/PaisContext';
import { obtenerMetodosPago } from '../config/metodosPago';
import axios from 'axios';
import './CheckoutManual.css';

const CheckoutManual = () => {
  const { items, obtenerTotal, vaciarCarrito } = useCarrito();
  const { usuario, estaAutenticado } = useAuth();
  const { paisSeleccionado, obtenerMoneda } = usePais();
  const navigate = useNavigate();

  const [metodoSeleccionado, setMetodoSeleccionado] = useState(null);
  const [comprobanteArchivo, setComprobanteArchivo] = useState(null);
  const [comprobantePreview, setComprobantePreview] = useState('');
  const [subiendo, setSubiendo] = useState(false);
  const [ordenCreada, setOrdenCreada] = useState(null);
  const [paso, setPaso] = useState(1);

  const metodosPais = obtenerMetodosPago(paisSeleccionado);
  const monedaPais = obtenerMoneda(paisSeleccionado);

  // Calcular total según el país
  const calcularTotal = () => {
    let total = 0;
    items.forEach(curso => {
      // Intentar obtener precio por país
      if (curso.precios && curso.precios[paisSeleccionado]) {
        total += curso.precios[paisSeleccionado].monto;
      } 
      // Fallback 1: usar precioUSD
      else if (curso.precioUSD) {
        total += curso.precioUSD;
      }
      // Fallback 2: usar precio viejo
      else if (curso.precio) {
        total += curso.precio;
      }
      // Fallback 3: precio 0
      else {
        total += 0;
      }
    });
    return total;
  };

  const totalPais = calcularTotal();
  const totalFormateado = new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: monedaPais
  }).format(totalPais);

  useEffect(() => {
    if (!estaAutenticado) {
      navigate('/login?redirect=/checkout');
    }
    if (items.length === 0 && !ordenCreada) {
      navigate('/cursos');
    }
  }, [estaAutenticado, items]);

  const crearOrden = async () => {
    try {
      setSubiendo(true);
      const { data } = await axios.post('http://localhost:5000/api/pagos-manual/crear-orden-manual', {
        cursosIds: items.map(c => c._id),
        metodoPago: {
          tipo: metodoSeleccionado.tipo,
          nombre: metodoSeleccionado.nombre
        },
        moneda: monedaPais,
        pais: paisSeleccionado
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      setOrdenCreada(data);
      setPaso(2);
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
    reader.onloadend = () => {
      setComprobantePreview(reader.result);
    };
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

      await axios.post(`http://localhost:5000/api/pagos-manual/subir-comprobante/${ordenCreada.compraId}`, 
        formData,
        {
          headers: { 
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      vaciarCarrito();
      setPaso(3);
    } catch (error) {
      alert('Error al subir comprobante: ' + (error.response?.data?.error || error.message));
    } finally {
      setSubiendo(false);
    }
  };

  // Obtener precio formateado de un curso según el país
  const formatearPrecioCurso = (curso) => {
    let precio = 0;
    
    // Intentar obtener precio por país
    if (curso.precios && curso.precios[paisSeleccionado]) {
      precio = curso.precios[paisSeleccionado].monto;
    } 
    // Fallback 1: usar precioUSD
    else if (curso.precioUSD) {
      precio = curso.precioUSD;
    }
    // Fallback 2: usar precio viejo
    else if (curso.precio) {
      precio = curso.precio;
    }
    
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: monedaPais
    }).format(precio);
  };

  if (paso === 3) {
    return (
      <div className="checkout-exitoso">
        <div className="container">
          <div className="exito-card">
            <div className="exito-icon">
              <Check size={64} />
            </div>
            <h1>¡Comprobante Recibido!</h1>
            <p>Tu pago está en revisión. Te enviaremos un email cuando sea aprobado.</p>
            <p className="tiempo-revision">⏱️ Tiempo de revisión: 24-48 horas hábiles</p>
            <div className="exito-acciones">
              <button className="btn-primary" onClick={() => navigate('/mis-compras')}>
                Ver Mis Compras
              </button>
              <button className="btn-secondary" onClick={() => navigate('/cursos')}>
                Seguir Comprando
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-manual-page">
      <div className="container py-4">
        <h1>Finalizar Compra</h1>

        <div className="checkout-content">
          {/* Resumen */}
          <div className="resumen-compra">
            <h2>Resumen de tu Pedido</h2>
            {items.map(curso => (
              <div key={curso._id} className="item-resumen">
                <img src={curso.imagen} alt={curso.titulo} />
                <div>
                  <h4>{curso.titulo}</h4>
                  <span>{formatearPrecioCurso(curso)}</span>
                </div>
              </div>
            ))}
            <div className="total-resumen">
              <strong>Total a Pagar:</strong>
              <strong>{totalFormateado}</strong>
            </div>
          </div>

          {/* Métodos de Pago */}
          {paso === 1 && (
            <div className="metodos-pago-section">
              <h2>Selecciona tu Método de Pago</h2>
              <p className="pais-seleccionado">
                📍 País: <strong>{metodosPais.nombre}</strong>
              </p>

              <div className="metodos-lista">
                {metodosPais.metodos.map((metodo, index) => (
                  <div
                    key={index}
                    className={`metodo-card ${metodoSeleccionado === metodo ? 'seleccionado' : ''}`}
                    onClick={() => setMetodoSeleccionado(metodo)}
                  >
                    <div className="metodo-header">
                      <div className="radio">
                        {metodoSeleccionado === metodo && <div className="radio-dot"></div>}
                      </div>
                      <h3>{metodo.nombre}</h3>
                    </div>
                    {metodoSeleccionado === metodo && (
                      <div className="metodo-instrucciones">
                        <h4>📋 Datos para la Transferencia:</h4>
                        <pre>{metodo.instrucciones}</pre>
                        <div className="instruccion-importante">
                          <AlertCircle size={18} />
                          <p>Realiza el pago por el monto exacto de <strong>{totalFormateado}</strong></p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {metodoSeleccionado && (
                <button
                  className="btn-continuar"
                  onClick={crearOrden}
                  disabled={subiendo}
                >
                  {subiendo ? 'Procesando...' : 'Ya Realicé el Pago →'}
                </button>
              )}
            </div>
          )}

          {/* Subir Comprobante */}
          {paso === 2 && (
            <div className="subir-comprobante-section">
              <h2>Sube tu Comprobante de Pago</h2>
              
              <div className="instrucciones-comprobante">
                <h3>📸 Instrucciones:</h3>
                <ul>
                  <li>Toma una foto clara de tu comprobante</li>
                  <li>Asegúrate que se vea el monto y fecha</li>
                  <li>Formato: JPG, PNG (máximo 5MB)</li>
                  <li>La imagen debe ser legible</li>
                </ul>
              </div>

              <div className="form-group">
                <label>Selecciona tu Comprobante (Imagen)</label>
                <div className="file-input-wrapper">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleArchivoChange}
                    className="input-file"
                    id="comprobante-file"
                  />
                  <label htmlFor="comprobante-file" className="file-label">
                    <Upload size={20} />
                    {comprobanteArchivo ? comprobanteArchivo.name : 'Elegir Imagen'}
                  </label>
                </div>
                
                {comprobantePreview && (
                  <img 
                    src={comprobantePreview} 
                    alt="Preview" 
                    className="preview-comprobante"
                  />
                )}
              </div>

              <button
                className="btn-enviar-comprobante"
                onClick={subirComprobante}
                disabled={!comprobanteArchivo || subiendo}
              >
                <Upload size={20} />
                {subiendo ? 'Enviando...' : 'Enviar Comprobante'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutManual;
