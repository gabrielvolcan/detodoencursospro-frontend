export const METODOS_PAGO_POR_PAIS = {
  internacional: {
    nombre: 'Internacional',
    metodos: [
      {
        tipo: 'transferencia',
        nombre: 'Transferencia Internacional',
        instrucciones: `Contactar vía WhatsApp para coordinar pago
Email: detodoencursos@gmail.com
Concepto: Pago Curso + Tu Nombre`
      }
    ]
  },
  peru: {
    nombre: 'Perú',
    metodos: [
      {
        tipo: 'bcp',
        nombre: 'BCP - Yape',
        instrucciones: `BCP 💵
GABRIEL VOLCAN
Cuenta: 37005887674096
CCI: 00237010588767409657
Yape: 989228665
Concepto: Pago Curso + Tu Nombre`
      }
    ]
  },
  chile: {
    nombre: 'Chile',
    metodos: [
      {
        tipo: 'falabella',
        nombre: 'Banco Falabella',
        instrucciones: `Yoryelis Manzaneda
RUT: 26.974.264-K
Email: manzanedayoryelis@gmail.com
Cuenta Corriente: 15170139561
Banco Falabella
Concepto: Pago Curso + Tu Nombre`
      }
    ]
  },
  argentina: {
    nombre: 'Argentina',
    metodos: [
      {
        tipo: 'mercadopago',
        nombre: 'Mercado Pago',
        instrucciones: `👤 Gabriel Volcan
¡Hola! 😀 Te comparto mis datos para que puedas enviarme pesos a través de Mercado Pago👇 

Alias: gabriel.040.dejar.mp
CVU: 0000003100074314194223
Nombre: Gabriel Humberto Volcan Altuve`
      }
    ]
  },
  venezuela: {
    nombre: 'Venezuela',
    metodos: [
      {
        tipo: 'pagomovil',
        nombre: 'Pago Móvil - Banco de Venezuela',
        instrucciones: `Teléfono: 04129229098
Cédula: 25011281
Banco: 0102 Bco de Vzla
Concepto: Pago Curso + Tu Nombre`
      }
    ]
  },
  uruguay: {
    nombre: 'Uruguay',
    metodos: [
      {
        tipo: 'prex',
        nombre: 'Prex',
        instrucciones: `Gabriel Volcan
Cuenta Prex: 1771890
Concepto: Pago Curso + Tu Nombre`
      }
    ]
  },
  // ✅ COMPATIBILIDAD CON CÓDIGOS VIEJOS (por si acaso)
  USD: {
    nombre: 'Internacional',
    metodos: [
      {
        tipo: 'transferencia',
        nombre: 'Transferencia Internacional',
        instrucciones: `Contactar vía WhatsApp para coordinar pago
Email: detodoencursos@gmail.com
Concepto: Pago Curso + Tu Nombre`
      }
    ]
  },
  PE: {
    nombre: 'Perú',
    metodos: [
      {
        tipo: 'bcp',
        nombre: 'BCP - Yape',
        instrucciones: `BCP 💵
GABRIEL VOLCAN
Cuenta: 37005887674096
CCI: 00237010588767409657
Yape: 989228665
Concepto: Pago Curso + Tu Nombre`
      }
    ]
  },
  CL: {
    nombre: 'Chile',
    metodos: [
      {
        tipo: 'falabella',
        nombre: 'Banco Falabella',
        instrucciones: `Yoryelis Manzaneda
RUT: 26.974.264-K
Email: manzanedayoryelis@gmail.com
Cuenta Corriente: 15170139561
Banco Falabella
Concepto: Pago Curso + Tu Nombre`
      }
    ]
  },
  AR: {
    nombre: 'Argentina',
    metodos: [
      {
        tipo: 'mercadopago',
        nombre: 'Mercado Pago',
        instrucciones: `Gabriel Humberto Volcan Altuve
CVU: 0000003100074314194223
Alias: gabriel.040.dejar.mp
CUIT/CUIL: 27963030407
Mercado Pago
Concepto: Pago Curso + Tu Nombre`
      }
    ]
  },
  VE: {
    nombre: 'Venezuela',
    metodos: [
      {
        tipo: 'pagomovil',
        nombre: 'Pago Móvil - Banco de Venezuela',
        instrucciones: `Teléfono: 04129229098
Cédula: 25011281
Banco: 0102 Bco de Vzla
Concepto: Pago Curso + Tu Nombre`
      }
    ]
  },
  UY: {
    nombre: 'Uruguay',
    metodos: [
      {
        tipo: 'prex',
        nombre: 'Prex',
        instrucciones: `Gabriel Volcan
Cuenta Prex: 1771890
Concepto: Pago Curso + Tu Nombre`
      }
    ]
  }
};

export const obtenerMetodosPago = (codigoPais) => {
  return METODOS_PAGO_POR_PAIS[codigoPais] || METODOS_PAGO_POR_PAIS.internacional;
};
