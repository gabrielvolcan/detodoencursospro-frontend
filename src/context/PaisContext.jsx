import { createContext, useContext, useState, useEffect } from 'react';

const PaisContext = createContext();

export const usePais = () => {
  const context = useContext(PaisContext);
  if (!context) {
    throw new Error('usePais debe usarse dentro de PaisProvider');
  }
  return context;
};

// 💰 TASAS DE CONVERSIÓN - ACTUALIZADAS 10 ENERO 2026
const TASAS_CONVERSION = {
  USD: { simbolo: '$', nombre: 'Dólares', multiplicador: 1 },
  PEN: { simbolo: 'S/', nombre: 'Soles', multiplicador: 3.36 },
  CLP: { simbolo: '$', nombre: 'Pesos Chilenos', multiplicador: 894 },
  ARS: { simbolo: '$', nombre: 'Pesos Argentinos', multiplicador: 1505 },
  UYU: { simbolo: '$', nombre: 'Pesos Uruguayos', multiplicador: 38.9 },
  VES: { simbolo: 'Bs', nombre: 'Bolívares', multiplicador: 50 }
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

  // Formatea un monto ya en moneda local (para totales)
  const formatearMonto = (monto, moneda = 'USD') => {
    const simbolo = TASAS_CONVERSION[moneda]?.simbolo || '$';
    return formatearPrecio(Number(monto) || 0, simbolo, moneda);
  };

  // 💰 FUENTE ÚNICA DE PRECIOS: precio de un ítem (curso o producto) según el país elegido.
  // Maneja precios[pais] ya configurados o convierte precioUSD con las tasas centrales.
  const precioDeItem = (item) => {
    if (!item) return { precio: 0, moneda: 'USD', simbolo: '$', formatted: '$0.00', esGratis: true };

    // 1) precio por país ya cargado (cursos)
    if (item.precios && item.precios[paisSeleccionado] && item.precios[paisSeleccionado].monto != null) {
      const moneda = item.precios[paisSeleccionado].moneda || obtenerMoneda();
      const monto = Number(item.precios[paisSeleccionado].monto) || 0;
      const simbolo = TASAS_CONVERSION[moneda]?.simbolo || '$';
      return { precio: monto, moneda, simbolo, formatted: formatearPrecio(monto, simbolo, moneda), esGratis: monto === 0 };
    }

    // 2) precioUSD → convertir con las tasas centrales
    if (item.precioUSD != null && !isNaN(item.precioUSD)) {
      const c = convertirPrecio(item.precioUSD);
      return { precio: c.precio, moneda: c.moneda, simbolo: c.simbolo, formatted: c.formatted, esGratis: Number(item.precioUSD) === 0 };
    }

    // 3) fallback precio viejo (USD)
    const monto = Number(item.precio) || 0;
    return { precio: monto, moneda: 'USD', simbolo: '$', formatted: formatearPrecio(monto, '$', 'USD'), esGratis: monto === 0 };
  };

  const obtenerPaisActual = () => {
    return PAISES.find(p => p.codigo === paisSeleccionado) || PAISES[0];
  };

  const obtenerMoneda = (codigoPais = null) => {
    const codigo = codigoPais || paisSeleccionado;
    const pais = PAISES.find(p => p.codigo === codigo);
    return pais?.moneda || 'USD';
  };

  const value = {
    paisSeleccionado,
    setPaisSeleccionado,
    convertirPrecio,
    precioDeItem,
    formatearMonto,
    obtenerPaisActual,
    obtenerMoneda,
    paises: PAISES
  };

  return <PaisContext.Provider value={value}>{children}</PaisContext.Provider>;
};
