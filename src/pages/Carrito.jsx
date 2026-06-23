import { useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCarrito } from '../context/CarritoContext';
import { useAuth } from '../context/AuthContext';
import { usePais } from '../context/PaisContext';
import './Carrito.css';

const Carrito = () => {
  const { items, eliminarDelCarrito } = useCarrito();
  const { estaAutenticado } = useAuth();
  // 💰 Precios centralizados en PaisContext (única fuente de verdad)
  const { precioDeItem, formatearMonto } = usePais();
  const navigate = useNavigate();

  // Total del carrito usando la función central
  const calcularTotal = () => {
    let total = 0;
    let moneda = 'USD';
    items.forEach(curso => {
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
      <div className="carrito-vacio">
        <div className="container">
          <ShoppingBag size={80} />
          <h2>Tu carrito está vacío</h2>
          <p>Agrega cursos para comenzar tu aprendizaje</p>
          <button className="btn-primary mt-3" onClick={() => navigate('/cursos')}>
            Ver Cursos
          </button>
        </div>
      </div>
    );
  }

  const { total, moneda } = calcularTotal();

  return (
    <div className="carrito-page">
      <div className="container py-4">
        <h1 className="mb-4">Carrito de Compras</h1>

        <div className="carrito-content">
          <div className="carrito-items">
            {items.map(curso => {
              const precio = precioDeItem(curso);

              return (
                <div key={curso._id} className="carrito-item">
                  <img src={curso.imagen} alt={curso.titulo} />
                  <div className="item-info">
                    <h3>{curso.titulo}</h3>
                    <p>{curso.descripcionCorta}</p>
                    <span className="item-categoria">{curso.categoria}</span>
                  </div>
                  <div className="item-precio">
                    {precio.formatted}
                  </div>
                  <button
                    className="btn-eliminar"
                    onClick={() => eliminarDelCarrito(curso._id)}
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              );
            })}
          </div>

          <div className="carrito-resumen">
            <h3>Resumen del Pedido</h3>

            <div className="resumen-items">
              <div className="resumen-linea">
                <span>Subtotal ({items.length} {items.length === 1 ? 'curso' : 'cursos'})</span>
                <span>{formatearMonto(total, moneda)}</span>
              </div>
              <div className="resumen-linea total">
                <span>Total</span>
                <span>{formatearMonto(total, moneda)}</span>
              </div>
            </div>

            <button
              className="btn-pagar"
              onClick={handlePagar}
            >
              Proceder al Pago
              <ArrowRight size={20} />
            </button>

            {!estaAutenticado && (
              <p className="auth-mensaje">
                Necesitas iniciar sesión para completar la compra
              </p>
            )}

            <div className="garantia">
              <strong>✓ Garantía de 30 días</strong>
              <p>Si no estás satisfecho, te devolvemos tu dinero</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Carrito;
