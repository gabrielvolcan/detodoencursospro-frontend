import { createContext, useContext, useState, useEffect } from 'react';

const PaisContext = createContext();

export const usePais = () => {
  const context = useContext(PaisContext);
  if (!context) {
    throw new Error('usePais debe usarse dentro de PaisProvider');
  }
  return context;
};

// Tasas de conversión base USD
const TASAS_CONVERSION = {
  USD: { simbolo: '$', nombre: 'Dólares', multiplicador: 1 },
  PEN: { simbolo: 'S/', nombre: 'Soles', multiplicador: 3.75 },
  CLP: { simbolo: '$', nombre: 'Pesos Chilenos', multiplicador: 950 },
  ARS: { simbolo: '$', nombre: 'Pesos Argentinos', multiplicador: 1000 },
  VES: { simbolo: 'Bs', nombre: 'Bolívares', multiplicador: 36 },
  UYU: { simbolo: '$', nombre: 'Pesos Uruguayos', multiplicador: 39 }
};

export const PAISES = [
  { codigo: 'internacional', nombre: 'Internacional', bandera: '🌎', moneda: 'USD' },
  { codigo: 'peru', nombre: 'Perú', bandera: '🇵🇪', moneda: 'PEN' },
  { codigo: 'chile', nombre: 'Chile', bandera: '🇨🇱', moneda: 'CLP' },
  { codigo: 'argentina', nombre: 'Argentina', bandera: '🇦🇷', moneda: 'ARS' },
  { codigo: 'venezuela', nombre: 'Venezuela', bandera: '🇻🇪', moneda: 'USD' },
  { codigo: 'uruguay', nombre: 'Uruguay', bandera: '🇺🇾', moneda: 'UYU' }
];

export const PaisProvider = ({ children }) => {
  const [paisSeleccionado, setPaisSeleccionado] = useState(() => {
    const guardado = localStorage.getItem('paisSeleccionado');
    
    // Migrar códigos antiguos a nuevos
    const conversion = {
      'USD': 'internacional',
      'PE': 'peru',
      'CL': 'chile',
      'AR': 'argentina',
      'VE': 'venezuela',
      'UY': 'uruguay'
    };
    
    const codigoConvertido = conversion[guardado] || guardado || 'internacional';
    
    // Guardar el código convertido
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
    
    const precioConvertido = precioUSD * tasa.multiplicador;
    
    return {
      precio: precioConvertido,
      simbolo: tasa.simbolo,
      moneda: moneda,
      formatted: formatearPrecio(precioConvertido, tasa.simbolo, moneda)
    };
  };

  const formatearPrecio = (precio, simbolo, moneda) => {
    // Para monedas grandes (CLP, ARS), sin decimales
    if (moneda === 'CLP' || moneda === 'ARS') {
      return `${simbolo}${Math.round(precio).toLocaleString('es')}`;
    }
    // Para el resto, con 2 decimales
    return `${simbolo}${precio.toFixed(2)}`;
  };

  const obtenerPaisActual = () => {
    return PAISES.find(p => p.codigo === paisSeleccionado) || PAISES[0];
  };

  // Nueva función para obtener la moneda del país seleccionado
  const obtenerMoneda = (codigoPais = null) => {
    const codigo = codigoPais || paisSeleccionado;
    const pais = PAISES.find(p => p.codigo === codigo);
    return pais?.moneda || 'USD';
  };

  // Nueva función para obtener el código del país normalizado
  const normalizarCodigoPais = (codigo) => {
    // Convertir códigos antiguos al nuevo formato
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
