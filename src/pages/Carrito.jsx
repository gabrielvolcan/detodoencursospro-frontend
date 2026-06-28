import { useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, Zap, BookOpen, Package } from 'lucide-react';
import { useCarrito } from '../context/CarritoContext';
import { useAuth } from '../context/AuthContext';
import { usePais } from '../context/PaisContext';
import PubThumb from '../components/publico/PubThumb';
import '../styles/publico.css';

const Carrito = () => {
  const { items, eliminarDelCarrito } = useCarrito();
  const { estaAutenticado } = useAuth();
  // 💰 Precios centralizados en PaisContext (única fuente de verdad)
  const { precioDeItem, formatearMonto, obtenerPaisActual } = usePais();
  const navigate = useNavigate();

  // Total del carrito usando la función central
  const calcularTotal = () => {
    let total = 0;
    let moneda = 'USD';
    items.forEach((curso) => {
      const p = precioDeItem(curso);
      total += p.precio;
      moneda = p.moneda;
    });
    return { total, moneda };
  };

  const handlePagar = () => {
    if (!estaAutenticado) {
      navigate('/login?redirect=/carrito');
      return;
    }
    if (items.length === 0) return;
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="pub">
        <div className="pagehead"><div className="hero-bg"></div><div className="shell">
          <h1 className="h1">Carrito de Compras</h1>
          <p className="lead" style={{ marginTop: 12 }}>Revisa tus artículos antes de finalizar la compra</p>
        </div></div>
        <section className="sec" style={{ paddingTop: 40 }}>
          <div className="shell">
            <div className="empty">
              <div className="empty-ic"><ShoppingBag className="ic ic-lg" /></div>
              <h2 className="h3">Tu carrito está vacío</h2>
              <p className="muted" style={{ margin: '8px 0 22px' }}>Agrega cursos para comenzar tu aprendizaje</p>
              <button className="btn btnp btn-lg" onClick={() => navigate('/cursos')}>Ver Cursos</button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  const { total, moneda } = calcularTotal();
  const pais = obtenerPaisActual();

  return (
    <div className="pub">
      <div className="pagehead"><div className="hero-bg"></div><div className="shell">
        <h1 className="h1">Carrito de Compras</h1>
        <p className="lead" style={{ marginTop: 12 }}>Revisa tus artículos antes de finalizar la compra</p>
      </div></div>

      <section className="sec" style={{ paddingTop: 40 }}>
        <div className="shell">
          <div className="cart-grid">
            <div>
              {items.map((curso, i) => {
                const precio = precioDeItem(curso);
                const esProducto = curso.tipo && curso.tipo !== 'curso';
                return (
                  <div key={curso._id} className="cart-row">
                    <PubThumb src={curso.imagen} alt={curso.titulo} index={i} icon={esProducto ? Package : BookOpen} className="cart-thumb thumb" />
                    <div style={{ flex: 1 }}>
                      <span className="pill pill-d xs">{esProducto ? curso.tipo : (curso.categoria || 'Curso')}</span>
                      <div className="fw7" style={{ marginTop: 8, lineHeight: 1.35 }}>{curso.titulo}</div>
                    </div>
                    <div className="price" style={{ fontSize: 19 }}>{precio.formatted}</div>
                    <button className="icbtn" onClick={() => eliminarDelCarrito(curso._id)} aria-label="Eliminar">
                      <Trash2 className="ic ic-s" />
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="summary">
              <h3 className="h3" style={{ marginBottom: 16 }}>Resumen del pedido</h3>
              <div className="sum-row">
                <span>Artículos ({items.length})</span>
                <span className="fw6" style={{ color: 'var(--ink)' }}>{formatearMonto(total, moneda)}</span>
              </div>
              <div className="sum-row">
                <span>Precios en</span>
                <span className="fw6" style={{ color: 'var(--ink)' }}>{pais?.nombre || 'Internacional'}</span>
              </div>
              <div className="sum-total">
                <span className="fw7">Total</span>
                <b className="green">{formatearMonto(total, moneda)}</b>
              </div>
              <button className="btn btnp btn-block btn-lg" style={{ marginTop: 20 }} onClick={handlePagar}>
                <Zap className="ic" />Finalizar compra
              </button>
              {!estaAutenticado && (
                <p className="muted xs tc" style={{ marginTop: 12 }}>Necesitas iniciar sesión para completar la compra</p>
              )}
              <div className="tc" style={{ marginTop: 14 }}>
                <button className="green sm fw7 pointer" style={{ background: 'none', border: 0 }} onClick={() => navigate('/cursos')}>Seguir comprando</button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Carrito;
