// Helpers de formato compartidos por el panel de admin.

// Formatea un monto en USD: 12 -> "$12.00"
export const formatUSD = (monto) => `$${(Number(monto) || 0).toFixed(2)}`;

// Formatea un monto con su moneda opcional: (12, "ARS") -> "$12.00 ARS"
export const formatMonto = (monto, moneda) =>
  `$${(Number(monto) || 0).toFixed(2)}${moneda ? ` ${moneda}` : ''}`;

// Emoji de bandera por país (con tolerancia a variantes con/sin tilde).
export const obtenerBandera = (pais) => {
  const banderas = {
    Argentina: '🇦🇷',
    Peru: '🇵🇪',
    Perú: '🇵🇪',
    Chile: '🇨🇱',
    Uruguay: '🇺🇾',
    Venezuela: '🇻🇪',
    Colombia: '🇨🇴',
    México: '🇲🇽',
    Mexico: '🇲🇽',
    Internacional: '🌍',
  };
  return banderas[pais] || '🌍';
};
