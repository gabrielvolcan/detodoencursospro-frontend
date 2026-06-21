import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    verificarSesion();
  }, []);

  const verificarSesion = async () => {
    const token = localStorage.getItem('token');

    // Si hay token (aunque sea uno residual/sin usuario), validarlo contra el backend.
    if (token && token !== 'undefined') {
      try {
        const { data } = await authAPI.obtenerPerfil();
        setUsuario(data);
        localStorage.setItem('usuario', JSON.stringify(data));
      } catch (error) {
        console.error('Error verificando sesión:', error);
        cerrarSesion();
      }
    } else if (token === 'undefined') {
      // Limpiar token basura de versiones anteriores
      cerrarSesion();
    }
    setCargando(false);
  };

  const iniciarSesion = async (email, password) => {
    try {
      const { data } = await authAPI.login({ email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('usuario', JSON.stringify(data.usuario));
      setUsuario(data.usuario);
      return { exito: true };
    } catch (error) {
      return {
        exito: false,
        error: error.response?.data?.error || 'Error al iniciar sesión'
      };
    }
  };

  const registrarse = async (datosUsuario) => {
    try {
      // El backend NO devuelve token ni usuario: el registro requiere verificar
      // el email antes de poder iniciar sesión. No se debe simular sesión acá.
      const { data } = await authAPI.registro(datosUsuario);
      return {
        exito: true,
        mensaje: data.mensaje || 'Registro exitoso. Revisa tu email para verificar tu cuenta.',
        cursoGratuitoInscrito: data.cursoGratuitoInscrito
      };
    } catch (error) {
      return {
        exito: false,
        error: error.response?.data?.error || 'Error al registrarse'
      };
    }
  };

  const cerrarSesion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setUsuario(null);
  };

  const actualizarUsuario = (nuevosDatos) => {
    const usuarioActualizado = { ...usuario, ...nuevosDatos };
    setUsuario(usuarioActualizado);
    localStorage.setItem('usuario', JSON.stringify(usuarioActualizado));
  };

  const esAdmin = () => {
    return usuario?.rol === 'admin';
  };

  const value = {
    usuario,
    cargando,
    iniciarSesion,
    registrarse,
    cerrarSesion,
    actualizarUsuario,
    esAdmin,
    estaAutenticado: !!usuario
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
