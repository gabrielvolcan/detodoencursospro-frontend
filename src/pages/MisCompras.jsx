import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getComprobanteUrl, pagosAPI } from '../services/api';
import './MisCompras.css';

const MisCompras = () => {
  const { estaAutenticado } = useAuth();
  const navigate = useNavigate();
  const [compras, setCompras] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!estaAutenticado) {
      navigate('/login');
      return;
    }
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

  const [comprobanteCargando, setComprobanteCargando] = useState(null);

  const verComprobante = async (compraId) => {
    try {
      setComprobanteCargando(compraId);
      const url = await getComprobanteUrl(compraId);
      window.open(url, '_blank', 'noopener,noreferrer');
      // Liberar el object URL pasado un tiempo prudencial para que la pestaña lo cargue
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (error) {
      console.error('Error cargando comprobante:', error);
      alert('No se pudo cargar el comprobante.');
    } finally {
      setComprobanteCargando(null);
    }
  };

  const getEstadoBadge = (estado) => {
    const estados = {
      pendiente: { texto: 'Pendiente', clase: 'pendiente', icono: <Clock size={16} /> },
      en_revision: { texto: 'En Revisión', clase: 'revision', icono: <Eye size={16} /> },
      aprobado: { texto: 'Aprobado', clase: 'aprobado', icono: <CheckCircle size={16} /> },
      rechazado: { texto: 'Rechazado', clase: 'rechazado', icono: <XCircle size={16} /> }
    };
    return estados[estado] || estados.pendiente;
  };

  if (cargando) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando tus compras...</p>
      </div>
    );
  }

  return (
    <div className="mis-compras-page">
      <div className="container py-4">
        <div className="page-header">
          <div>
            <h1>Mis Compras</h1>
            <p>Historial completo de tus pedidos</p>
          </div>
          <div className="header-stats">
            <div className="stat">
              <strong>{compras.length}</strong>
              <span>Total</span>
            </div>
            <div className="stat">
              <strong>{compras.filter(c => c.estadoPago === 'aprobado').length}</strong>
              <span>Aprobadas</span>
            </div>
            <div className="stat">
              <strong>{compras.filter(c => c.estadoPago === 'en_revision').length}</strong>
              <span>En Revisión</span>
            </div>
          </div>
        </div>

        {compras.length === 0 ? (
          <div className="sin-compras">
            <Package size={64} />
            <h2>No tienes compras aún</h2>
            <p>Explora nuestro catálogo y comienza a aprender</p>
            <button className="btn-primary" onClick={() => navigate('/cursos')}>
              Ver Cursos
            </button>
          </div>
        ) : (
          <div className="compras-lista">
            {compras.map(compra => {
              const estadoInfo = getEstadoBadge(compra.estadoPago);
              return (
                <div key={compra._id} className="compra-card">
                  <div className="compra-header">
                    <div className="compra-info">
                      <h3>Orden #{compra._id.slice(-8).toUpperCase()}</h3>
                      <p className="compra-fecha">
                        {new Date(compra.createdAt).toLocaleDateString('es', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className="compra-estado">
                      <span className={`estado-badge ${estadoInfo.clase}`}>
                        {estadoInfo.icono}
                        {estadoInfo.texto}
                      </span>
                    </div>
                  </div>

                  <div className="compra-detalles">
                    <div className="detalle-item">
                      <span className="label">Método de pago:</span>
                      <span className="value">{compra.metodoPago?.nombre}</span>
                    </div>
                    <div className="detalle-item">
                      <span className="label">País:</span>
                      <span className="value">{compra.metodoPago?.pais}</span>
                    </div>
                    <div className="detalle-item">
                      <span className="label">Total:</span>
                      <span className="value total">${compra.total.toFixed(2)} {compra.moneda}</span>
                    </div>
                  </div>

                  {compra.cursos?.length > 0 && (
                    <div className="compra-cursos">
                      <h4>Cursos:</h4>
                      {compra.cursos.map(item => (
                        <div key={item._id} className="curso-item">
                          <img src={item.curso?.imagen} alt={item.curso?.titulo} />
                          <div className="curso-info">
                            <strong>{item.curso?.titulo}</strong>
                            <span>${item.precio}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {compra.productos?.length > 0 && (
                    <div className="compra-cursos">
                      <h4>Productos:</h4>
                      {compra.productos.map(item => (
                        <div key={item._id} className="curso-item">
                          <img src={item.producto?.imagen} alt={item.producto?.titulo} />
                          <div className="curso-info">
                            <strong>{item.producto?.titulo}</strong>
                            <span>${item.precio}</span>
                          </div>
                          {compra.estadoPago === 'aprobado' && item.producto?._id && item.producto?.libro?.archivoId && (
                            <button
                              type="button"
                              className="btn-ver-comprobante"
                              onClick={() => navigate(`/leer/${item.producto._id}`)}
                            >
                              📖 Leer
                            </button>
                          )}
                          {compra.estadoPago === 'aprobado' && item.producto?._id && !item.producto?.libro?.archivoId && (
                            <button
                              type="button"
                              className="btn-ver-comprobante"
                              onClick={() => navigate(`/producto/${item.producto._id}`)}
                            >
                              ⬇️ Descargar
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {compra.comprobante?.url && (
                    <div className="compra-comprobante">
                      <strong>Comprobante:</strong>
                      <button
                        type="button"
                        onClick={() => verComprobante(compra._id)}
                        disabled={comprobanteCargando === compra._id}
                        className="btn-ver-comprobante"
                      >
                        {comprobanteCargando === compra._id ? '⏳ Cargando...' : '📸 Ver Comprobante Subido'}
                      </button>
                    </div>
                  )}

                  {compra.estadoPago === 'rechazado' && compra.notasAdmin && (
                    <div className="compra-rechazo">
                      <strong>⚠️ Motivo del rechazo:</strong>
                      <p>{compra.notasAdmin}</p>
                      <button 
                        className="btn-reintentar"
                        onClick={() => navigate('/cursos')}
                      >
                        Volver a Intentar
                      </button>
                    </div>
                  )}

                  {compra.estadoPago === 'aprobado' && (() => {
                    const tieneCursos = compra.cursos?.length > 0;
                    const tieneProductos = compra.productos?.length > 0;
                    return (
                      <div className="compra-aprobada">
                        <CheckCircle size={20} />
                        <span>
                          {tieneCursos && tieneProductos &&
                            '¡Pago aprobado! Tus cursos están en "Mis Cursos", y tus libros/productos los leés o descargás con el botón de aquí arriba.'}
                          {tieneCursos && !tieneProductos &&
                            '¡Pago aprobado! Ya podés acceder a tus cursos.'}
                          {!tieneCursos && tieneProductos &&
                            '¡Pago aprobado! 📖 Ya podés leer o descargar lo que compraste con el botón de aquí arriba.'}
                          {!tieneCursos && !tieneProductos &&
                            '¡Pago aprobado!'}
                        </span>
                        {tieneCursos && (
                          <button
                            type="button"
                            className="btn-ver-comprobante"
                            onClick={() => navigate('/mis-cursos-aprender')}
                          >
                            Ir a Mis Cursos →
                          </button>
                        )}
                      </div>
                    );
                  })()}

                  {compra.estadoPago === 'pendiente' && !compra.comprobante?.url && (
                    <div className="compra-pendiente">
                      <Clock size={20} />
                      <span>Esperando que subas el comprobante de pago</span>
                    </div>
                  )}

                  {compra.estadoPago === 'en_revision' && (
                    <div className="compra-revision">
                      <Eye size={20} />
                      <span>Tu comprobante está siendo revisado. Te notificaremos por email.</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MisCompras;