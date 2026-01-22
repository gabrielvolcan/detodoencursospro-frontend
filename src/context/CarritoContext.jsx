import { createContext, useContext, useState, useEffect } from 'react';

const CarritoContext = createContext();

export const useCarrito = () => {
  const context = useContext(CarritoContext);
  if (!context) {
    throw new Error('useCarrito debe usarse dentro de CarritoProvider');
  }
  return context;
};

export const CarritoProvider = ({ children }) => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    try {
      const carritoGuardado = localStorage.getItem('carrito');
      if (carritoGuardado) {
        const parsed = JSON.parse(carritoGuardado);
        // ✅ VALIDAR QUE SEA UN ARRAY
        if (Array.isArray(parsed)) {
          setItems(parsed);
        } else {
          console.warn('Carrito en localStorage no es un array, limpiando...');
          localStorage.removeItem('carrito');
          setItems([]);
        }
      }
    } catch (error) {
      console.error('Error al cargar carrito desde localStorage:', error);
      localStorage.removeItem('carrito');
      setItems([]);
    }
  }, []);

  useEffect(() => {
    if (Array.isArray(items)) {
      localStorage.setItem('carrito', JSON.stringify(items));
    }
  }, [items]);

  const agregarAlCarrito = (producto) => {
    console.log('📦 agregarAlCarrito llamado con:', producto);
    console.log('📦 items actuales:', items);
    console.log('📦 items es array?', Array.isArray(items));
    
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
      console.log('✅ Agregando producto al carrito');
      setItems([...items, producto]);
      return true;
    }
    
    console.log('ℹ️ Producto ya está en el carrito');
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
