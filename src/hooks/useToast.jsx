import { useState, useCallback } from 'react';

let contadorId = 0;

// Hook de toasts (mensajes transitorios). Reemplaza alert().
// const { toasts, showToast } = useToast();
// showToast('Guardado', 'exito');  showToast('Error', 'error');
export function useToast() {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((texto, tipo = 'exito') => {
    contadorId += 1;
    const id = contadorId;
    setToasts((prev) => [...prev, { id, texto, tipo }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  return { toasts, showToast };
}
