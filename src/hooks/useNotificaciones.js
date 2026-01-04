import { useState, useEffect, useRef } from 'react';
import { adminAPI } from '../services/api';

export const useNotificaciones = (habilitado = false) => {
  const [contador, setContador] = useState(0);
  const [hayNuevas, setHayNuevas] = useState(false);
  const ultimaActualizacionRef = useRef(null);
  const intervaloRef = useRef(null);

  const verificarNotificaciones = async () => {
    if (!habilitado) return;

    try {
      const { data } = await adminAPI.obtenerContadorNotificaciones();
      
      // Detectar si hay nuevas compras
      if (data.ultimaActualizacion && 
          ultimaActualizacionRef.current && 
          new Date(data.ultimaActualizacion) > new Date(ultimaActualizacionRef.current)) {
        setHayNuevas(true);
        reproducirSonido();
        mostrarNotificacion(data.contador);
      }
      
      setContador(data.contador);
      ultimaActualizacionRef.current = data.ultimaActualizacion;
    } catch (error) {
      console.error('Error verificando notificaciones:', error);
    }
  };

  const reproducirSonido = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.log('Audio no disponible');
    }
  };

  const mostrarNotificacion = (cantidad) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Nueva compra pendiente', {
        body: `Tienes ${cantidad} ${cantidad === 1 ? 'pago' : 'pagos'} pendiente${cantidad === 1 ? '' : 's'} de aprobar`,
        icon: '/logo.png',
        badge: '/logo.png'
      });
    }
  };

  const solicitarPermisoNotificaciones = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  const marcarComoVistas = () => {
    setHayNuevas(false);
  };

  useEffect(() => {
    if (habilitado) {
      solicitarPermisoNotificaciones();
      verificarNotificaciones();
      
      intervaloRef.current = setInterval(verificarNotificaciones, 30000);
    }

    return () => {
      if (intervaloRef.current) {
        clearInterval(intervaloRef.current);
      }
    };
  }, [habilitado]);

  return {
    contador,
    hayNuevas,
    marcarComoVistas,
    verificarNotificaciones
  };
};