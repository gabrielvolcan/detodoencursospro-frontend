import { createContext, useContext, useState, useEffect } from 'react';

const PaisContext = createContext();

export const usePais = () => {
  const context = useContext(PaisContext);
  if (!context) {
    throw new Error('usePais debe usarse dentro de PaisProvider');
  }
  return context;
};

// 💰 TASAS DE CONVERSIÓN ÚNICAS - FUENTE DE VERDAD
const TASAS_CONVERSION = {
  USD: { simbolo: '$', nombre: 'Dólares', multiplicador: 1 },
  PEN: { simbolo: 'S/', nombre: 'Soles', multiplicador: 3.75 },
  CLP: { simbolo: '$', nombre: 'Pesos Chilenos', multiplicador: 980 },
  ARS: { simbolo: '$', nombre: 'Pesos Argentinos', multiplicador: 1015 },
  VES: { simbolo: 'Bs', nombre: 'Bolívares', multiplicador: 45.50 },
  UYU: { simbolo: '$', nombre: 'Pesos Uruguayos', multiplicador: 43.50 }
};

export const PAISES = [
  { codigo: 'internacional', nombre: 'Internacional', bandera: '🌎', moneda: 'USD' },
  { codigo: 'peru', nombre: 'Perú', bandera: '🇵🇪', moneda: 'PEN' },
  { codigo: 'chile', nombre: 'Chile', bandera: '🇨🇱', moneda: 'CLP' },
  { codigo: 'argentina', nombre: 'Argentina', bandera: '🇦🇷', moneda: 'ARS' },
  { codigo: 'venezuela', nombre: 'Venezuela', bandera: '🇻🇪', moneda: 'VES' },
  { codigo: 'uruguay', nombre: 'Uruguay', bandera: '🇺🇾', moneda: 'UYU' }
];

export const PaisProvider = ({ children }) => {
  const [paisSeleccionado, setPaisSeleccionado] = useState(() => {
    const guardado = localStorage.getItem('paisSeleccionado');
    
    const conversion = {
      'USD': 'internacional',
      'PE': 'peru',
      'CL': 'chile',
      'AR': 'argentina',
      'VE': 'venezuela',
      'UY': 'uruguay'
    };
    
    const codigoConvertido = conversion[guardado] || guardado || 'internacional';
    
    if (guardado && conversion[guardado]) {
      localStorage.setItem('paisSeleccionado', codigoConvertido);
    }
    
    return codigoConvertido;
  });

  useEffect(() => {
    localStorage.setItem('paisSeleccionado', paisSeleccionado);
  }, [paisSeleccionado]);

  const convertirPrecio = (precioUSD) => {
    const pais = PAISES.find(p => p.codigo === paisSeleccionado);
    const moneda = pais?.moneda || 'USD';
    const tasa = TASAS_CONVERSION[moneda];
    
    const precioConvertido = parseFloat(precioUSD) * tasa.multiplicador;
    
    return {
      precio: precioConvertido,
      simbolo: tasa.simbolo,
      moneda: moneda,
      formatted: formatearPrecio(precioConvertido, tasa.simbolo, moneda)
    };
  };

  const formatearPrecio = (precio, simbolo, moneda) => {
    if (moneda === 'CLP' || moneda === 'ARS') {
      return `${simbolo}${Math.round(precio).toLocaleString('es')}`;
    }
    return `${simbolo}${precio.toFixed(2)}`;
  };

  const obtenerPaisActual = () => {
    return PAISES.find(p => p.codigo === paisSeleccionado) || PAISES[0];
  };

  const obtenerMoneda = (codigoPais = null) => {
    const codigo = codigoPais || paisSeleccionado;
    const pais = PAISES.find(p => p.codigo === codigo);
    return pais?.moneda || 'USD';
  };

  const normalizarCodigoPais = (codigo) => {
    const conversion = {
      'USD': 'internacional',
      'PE': 'peru',
      'CL': 'chile',
      'AR': 'argentina',
      'VE': 'venezuela',
      'UY': 'uruguay'
    };
    return conversion[codigo] || codigo;
  };

  const value = {
    paisSeleccionado,
    setPaisSeleccionado,
    convertirPrecio,
    obtenerPaisActual,
    obtenerMoneda,
    normalizarCodigoPais,
    paises: PAISES,
    tasasConversion: TASAS_CONVERSION
  };

  return <PaisContext.Provider value={value}>{children}</PaisContext.Provider>;
};
