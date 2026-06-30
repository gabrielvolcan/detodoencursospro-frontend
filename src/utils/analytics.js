// ========================================
// 📊 Capa de analítica de comportamiento
// Empuja eventos a Google Tag Manager (window.dataLayer → GA4) y a Meta Pixel
// (window.fbq). Si alguno no está cargado, simplemente se ignora.
// ========================================

const pushDL = (obj) => {
  if (typeof window !== 'undefined' && Array.isArray(window.dataLayer)) {
    window.dataLayer.push(obj);
  }
};

const fbq = (event, params) => {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    window.fbq('track', event, params);
  }
};

// ---- Analítica propia (se ve en el panel admin) ----
const API = import.meta.env.VITE_API_URL || '/api';

const getVisitante = () => {
  try {
    let v = localStorage.getItem('dtc:vid');
    if (!v) { v = 'v' + Math.random().toString(36).slice(2) + Date.now().toString(36); localStorage.setItem('dtc:vid', v); }
    return v;
  } catch { return ''; }
};

const getUtm = () => {
  try { return new URLSearchParams(window.location.search).get('utm_source') || ''; } catch { return ''; }
};

// Envía el evento al backend sin bloquear la navegación (fire-and-forget).
const enviarBackend = (payload) => {
  try {
    fetch(`${API}/analytics/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, referrer: document.referrer || '', utmSource: getUtm(), visitante: getVisitante() }),
      keepalive: true
    }).catch(() => {});
  } catch { /* noop */ }
};

// Vista de página (cada cambio de ruta de la SPA)
export const trackPageView = (path, title) => {
  pushDL({ event: 'page_view', page_path: path, page_title: title });
  fbq('PageView');
  enviarBackend({ tipo: 'page', path });
};

// Ver un producto/curso (para saber "cuál más ven")
export const trackViewItem = ({ id, name, category, price }) => {
  pushDL({ event: 'view_item', item_id: id, item_name: name, item_category: category, value: price || 0, currency: 'USD' });
  fbq('ViewContent', { content_ids: [id], content_name: name, content_type: 'product', value: price || 0, currency: 'USD' });
  enviarBackend({ tipo: 'item', itemId: id, itemNombre: name, itemTipo: category });
};

// Agregar al carrito
export const trackAddToCart = ({ id, name, price }) => {
  pushDL({ event: 'add_to_cart', item_id: id, item_name: name, value: price || 0, currency: 'USD' });
  fbq('AddToCart', { content_ids: [id], content_name: name, value: price || 0, currency: 'USD' });
};

// Empezar checkout
export const trackBeginCheckout = (value) => {
  pushDL({ event: 'begin_checkout', value: value || 0, currency: 'USD' });
  fbq('InitiateCheckout', { value: value || 0, currency: 'USD' });
};

// Compra (cuando el comprador envía su comprobante = completó el pedido)
export const trackPurchase = (value, ids) => {
  pushDL({ event: 'purchase', value: value || 0, currency: 'USD', item_ids: ids || [] });
  fbq('Purchase', { value: value || 0, currency: 'USD', content_ids: ids || [] });
};
