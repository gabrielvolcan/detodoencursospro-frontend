// Cálculos de métricas del dashboard de admin. Funciones puras (no tocan estado ni UI).
import { obtenerBandera } from './formato';

// Ventas agrupadas por país (top 6), solo compras aprobadas.
export const calcularVentasPorPais = (ventas = []) => {
  const paisesMap = {};
  let totalVentas = 0;

  ventas.forEach((venta) => {
    if (venta.estadoPago === 'aprobado') {
      const pais = venta.metodoPago?.pais || venta.usuario?.pais || 'Internacional';
      paisesMap[pais] = (paisesMap[pais] || 0) + venta.total;
      totalVentas += venta.total;
    }
  });

  return Object.entries(paisesMap)
    .map(([pais, total]) => ({
      pais,
      total,
      porcentaje: totalVentas > 0 ? ((total / totalVentas) * 100).toFixed(1) : 0,
      bandera: obtenerBandera(pais),
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 6);
};

// Métodos de pago más usados (top 5), solo compras aprobadas.
export const calcularMetodosPago = (ventas = []) => {
  const metodosMap = {};

  ventas.forEach((venta) => {
    if (venta.estadoPago === 'aprobado') {
      const metodo = venta.metodoPago?.nombre || 'Otro';
      metodosMap[metodo] = (metodosMap[metodo] || 0) + 1;
    }
  });

  return Object.entries(metodosMap)
    .map(([metodo, cantidad]) => ({ metodo, cantidad }))
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 5);
};

// Top cursos por ingresos (top 5).
export const calcularCursosIngresos = (ventas = [], cursos = []) => {
  const ingresosMap = {};

  ventas.forEach((venta) => {
    if (venta.estadoPago === 'aprobado') {
      venta.cursos.forEach((item) => {
        const cursoId = item.curso?._id || item.curso;
        ingresosMap[cursoId] = (ingresosMap[cursoId] || 0) + item.precio;
      });
    }
  });

  return cursos
    .map((curso) => ({ ...curso, ingresos: ingresosMap[curso._id] || 0 }))
    .sort((a, b) => b.ingresos - a.ingresos)
    .slice(0, 5);
};

// Serie de ventas por día para el gráfico, según el rango (7/14/30 días).
export const serieGrafico = (ventasPorDiaRaw = [], rangoDias = 7) => {
  const mapa = {};
  ventasPorDiaRaw.forEach((d) => {
    mapa[d._id] = { total: d.total, cantidad: d.cantidad };
  });

  const serie = [];
  const hoy = new Date();
  for (let i = rangoDias - 1; i >= 0; i--) {
    const f = new Date(hoy);
    f.setDate(f.getDate() - i);
    const key = f.toISOString().split('T')[0];
    const reg = mapa[key] || { total: 0, cantidad: 0 };
    serie.push({
      fecha: f.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
      total: reg.total,
      cantidad: reg.cantidad,
    });
  }
  return serie;
};

// Tendencia porcentual de un valor vs el anterior. Devuelve { pct, signo }.
export const tendencia = (actual, anterior) => {
  const a = Number(actual) || 0;
  const b = Number(anterior) || 0;
  if (b === 0) return { pct: a > 0 ? 100 : 0, signo: a > 0 ? 'up' : 'flat' };
  const pct = ((a - b) / b) * 100;
  return { pct: Math.abs(pct).toFixed(0), signo: pct > 0 ? 'up' : pct < 0 ? 'down' : 'flat' };
};

// Ticket promedio de las compras aprobadas.
export const calcularTicketPromedio = (ultimasVentas = []) => {
  const aprobadas = ultimasVentas.filter((v) => v.estadoPago === 'aprobado');
  if (aprobadas.length === 0) return '0';
  const total = aprobadas.reduce((sum, v) => sum + v.total, 0);
  return (total / aprobadas.length).toFixed(2);
};

// Tasa de conversión simplificada (ventas completadas / total usuarios).
export const calcularTasaConversion = (estadisticas) => {
  if (!estadisticas) return '0';
  const ventasAprobadas = estadisticas.estadisticas?.ventasCompletadas || 0;
  const totalUsuarios = estadisticas.estadisticas?.totalUsuarios || 1;
  return ((ventasAprobadas / totalUsuarios) * 100).toFixed(1);
};
