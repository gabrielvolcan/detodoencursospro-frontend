import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '../utils/analytics';

// Dispara una vista de página en cada cambio de ruta de la SPA, para que GA4
// y Meta Pixel registren TODAS las páginas (no solo la primera carga).
const RouteTracker = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    trackPageView(pathname, document.title);
  }, [pathname]);
  return null;
};

export default RouteTracker;
