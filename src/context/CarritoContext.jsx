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
    const carritoGuardado = localStorage.getItem('carrito');
    if (carritoGuardado) {
      setItems(JSON.parse(carritoGuardado));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('carrito', JSON.stringify(items));
  }, [items]);

  const agregarAlCarrito = (curso) => {
    if (!items.find(item => item._id === curso._id)) {
      setItems([...items, curso]);
      return true;
    }
    return false;
  };

  const eliminarDelCarrito = (cursoId) => {
    setItems(items.filter(item => item._id !== cursoId));
  };

  const vaciarCarrito = () => {
    setItems([]);
    localStorage.removeItem('carrito');
  };

  const estaEnCarrito = (cursoId) => {
    return items.some(item => item._id === cursoId);
  };

  const obtenerTotal = () => {
    return items.reduce((total, item) => total + item.precio, 0);
  };

  const cantidadItems = items.length;

  const value = {
    items,
    agregarAlCarrito,
    eliminarDelCarrito,
    vaciarCarrito,
    estaEnCarrito,
    obtenerTotal,
    cantidadItems
  };

  return <CarritoContext.Provider value={value}>{children}</CarritoContext.Provider>;
};
