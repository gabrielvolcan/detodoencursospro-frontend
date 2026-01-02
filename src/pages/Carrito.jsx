import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCarrito } from '../context/CarritoContext';
import { useAuth } from '../context/AuthContext';
import { usePais } from '../context/PaisContext';
import './Carrito.css';

const Carrito = () => {
  const { items, eliminarDelCarrito, obtenerTotal } = useCarrito();
  const { estaAutenticado } = useAuth();
  const { paisSeleccionado, obtenerMoneda } = usePais();
  const navigate = useNavigate();

  // ========================================
  // 💰 FUNCIÓN PARA OBTENER PRECIO POR PAÍS
  // ========================================
  const obtenerPrecioCurso = (curso) => {
    // Si tiene el sistema nuevo de precios
    if (curso.precios && curso.precios[paisSeleccionado]) {
      return {
        monto: curso.precios[paisSeleccionado].monto,
        moneda: curso.precios[paisSeleccionado].moneda
      };
    }
    
    // Si tiene precioUSD, convertir
    if (curso.precioUSD) {
      const moneda = obtenerMoneda();
      const tasas = {
        USD: 1,
        PEN: 3.75,
        CLP: 950,
        ARS: 1000,
        UYU: 39
      };
      return {
        monto: curso.precioUSD * (tasas[moneda] || 1),
        moneda: moneda
      };
    }
    
    // Fallback antiguo
    return {
      monto: curso.precio || 0,
      moneda: 'USD'
    };
  };

  const obtenerSimbolo = (moneda) => {
    const simbolos = {
      USD: '$',
      PEN: 'S/',
      CLP: '$',
      ARS: '$',
      UYU: '$',
      VES: 'Bs'
    };
    return simbolos[moneda] || '$';
  };

  const formatearPrecio = (monto, moneda) => {
    const simbolo = obtenerSimbolo(moneda);
    
    // Para monedas grandes sin decimales
    if (moneda === 'CLP' || moneda === 'ARS') {
      return `${simbolo}${Math.round(monto).toLocaleString('es')}`;
    }
    
    // Para el resto con 2 decimales
    return `${simbolo}${monto.toFixed(2)}`;
  };

  // Calcular total del carrito
  const calcularTotal = () => {
    let total = 0;
    let moneda = 'USD';
    
    items.forEach(curso => {
      const precio = obtenerPrecioCurso(curso);
      total += precio.monto;
      moneda = precio.moneda; // Tomar la moneda del primer curso
    });
    
    return { total, moneda };
  };

  const handlePagar = () => {
    if (!estaAutenticado) {
      navigate('/login?redirect=/carrito');
      return;
    }

    if (items.length === 0) return;

    // Redirigir al checkout manual
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
              const precio = obtenerPrecioCurso(curso);
              
              return (
                <div key={curso._id} className="carrito-item">
                  <img src={curso.imagen} alt={curso.titulo} />
                  <div className="item-info">
                    <h3>{curso.titulo}</h3>
                    <p>{curso.descripcionCorta}</p>
                    <span className="item-categoria">{curso.categoria}</span>
                  </div>
                  <div className="item-precio">
                    {formatearPrecio(precio.monto, precio.moneda)}
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
                <span>{formatearPrecio(total, moneda)}</span>
              </div>
              <div className="resumen-linea total">
                <span>Total</span>
                <span>{formatearPrecio(total, moneda)}</span>
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
