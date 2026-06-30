import { createContext, useContext, useState, useEffect } from 'react';
import { trackAddToCart } from '../utils/analytics';

const CarritoContext = createContext();

export const useCarrito = () => {
  const context = useContext(CarritoContext);
  if (!context) {
    throw new Error('useCarrito debe usarse dentro de CarritoProvider');
  }
  return context;
};

export const CarritoProvider = ({ children }) => {
  // Inicialización lazy desde localStorage: evita la race en la que el efecto
  // de persistencia (abajo) pisaba el carrito guardado al montar con items=[].
  const [items, setItems] = useState(() => {
    try {
      const carritoGuardado = localStorage.getItem('carrito');
      const parsed = carritoGuardado ? JSON.parse(carritoGuardado) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error('Error al cargar carrito desde localStorage:', error);
      localStorage.removeItem('carrito');
      return [];
    }
  });

  useEffect(() => {
    if (Array.isArray(items)) {
      localStorage.setItem('carrito', JSON.stringify(items));
    }
  }, [items]);

  const agregarAlCarrito = (producto) => {
    // ✅ VALIDAR QUE ITEMS SEA UN ARRAY
    if (!Array.isArray(items)) {
      console.error('❌ items no es un array!', items);
      setItems([producto]);
      return true;
    }
    
    // ✅ VALIDAR QUE PRODUCTO TENGA _id
    if (!producto || !producto._id) {
      console.error('❌ Producto inválido:', producto);
      return false;
    }
    
    // Verificar si ya está en el carrito
    const yaExiste = items.find(item => item._id === producto._id);
    
    if (!yaExiste) {
      setItems([...items, producto]);
      trackAddToCart({ id: producto._id, name: producto.titulo, price: producto.precioUSD });
      return true;
    }

    return false;
  };

  const eliminarDelCarrito = (productoId) => {
    if (!Array.isArray(items)) {
      console.error('❌ items no es un array en eliminarDelCarrito');
      setItems([]);
      return;
    }
    setItems(items.filter(item => item._id !== productoId));
  };

  const vaciarCarrito = () => {
    setItems([]);
    localStorage.removeItem('carrito');
  };

  const estaEnCarrito = (productoId) => {
    if (!Array.isArray(items)) {
      console.error('❌ items no es un array en estaEnCarrito');
      return false;
    }
    return items.some(item => item._id === productoId);
  };

  const obtenerTotal = () => {
    if (!Array.isArray(items)) {
      console.error('❌ items no es un array en obtenerTotal');
      return 0;
    }
    return items.reduce((total, item) => {
      const precio = item.precioUSD || item.precio || 0;
      return total + precio;
    }, 0);
  };

  const cantidadItems = Array.isArray(items) ? items.length : 0;

  const value = {
    items: Array.isArray(items) ? items : [],
    agregarAlCarrito,
    eliminarDelCarrito,
    vaciarCarrito,
    estaEnCarrito,
    obtenerTotal,
    cantidadItems
  };

  return <CarritoContext.Provider value={value}>{children}</CarritoContext.Provider>;
};
