import { useState, useEffect } from 'react';
import { Users, Eye, TrendingUp, FileText } from 'lucide-react';
import { adminAPI } from '../../services/api';

const RANGOS = [{ d: 7, l: '7 días' }, { d: 30, l: '30 días' }, { d: 90, l: '90 días' }];

const GestionAnalitica = () => {
  const [data, setData] = useState(null);
  const [dias, setDias] = useState(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => { cargar(dias); }, [dias]);

  const cargar = async (d) => {
    try {
      setLoading(true);
      const { data: res } = await adminAPI.obtenerAnalitica(d);
      setData(res);
    } catch (e) {
      console.error('Error analítica:', e);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const maxF = data?.fuentes?.[0]?.visitas || 1;
  const maxP = data?.paginas?.[0]?.visitas || 1;
  const maxI = data?.items?.[0]?.vistas || 1;
  const nombrePagina = (p) => (p === '/' ? 'Inicio' : p);

  return (
    <section>
      <div className="phead">
        <h1 className="h1">Analítica</h1>
        <div className="fx ac gap8">
          {RANGOS.map((r) => (
            <button key={r.d} className={`btn-chip ${dias === r.d ? 'on' : ''}`} onClick={() => setDias(r.d)}>{r.l}</button>
          ))}
        </div>
      </div>
      <div className="divider-green"></div>

      {loading ? (
        <div className="admin-cargando">Cargando analítica...</div>
      ) : !data ? (
        <p className="muted">No se pudo cargar la analítica.</p>
      ) : (
        <>
          {/* Tarjetas resumen */}
          <div className="an-cards">
            <div className="an-card"><div className="an-ic"><Eye size={20} /></div><div><b>{data.visitas.toLocaleString('es')}</b><span>Visitas ({data.dias} días)</span></div></div>
            <div className="an-card"><div className="an-ic"><Users size={20} /></div><div><b>{data.visitantes.toLocaleString('es')}</b><span>Visitantes únicos</span></div></div>
            <div className="an-card"><div className="an-ic"><TrendingUp size={20} /></div><div><b>{data.items.reduce((a, i) => a + i.vistas, 0).toLocaleString('es')}</b><span>Vistas de productos/cursos</span></div></div>
          </div>

          <div className="an-grid">
            {/* De dónde lo ven */}
            <div className="an-panel">
              <div className="an-panel-h"><TrendingUp size={18} /> De dónde lo ven</div>
              {data.fuentes.length ? data.fuentes.map((f) => (
                <div className="an-row" key={f.fuente}>
                  <span className="an-row-l">{f.fuente}</span>
                  <span className="an-bar"><span className="an-bar-fill" style={{ width: `${(f.visitas / maxF) * 100}%` }}></span></span>
                  <span className="an-row-v">{f.visitas}</span>
                </div>
              )) : <p className="sin-datos">Sin datos aún</p>}
            </div>

            {/* Cuál más ven (productos/cursos) */}
            <div className="an-panel">
              <div className="an-panel-h"><Eye size={18} /> Cursos y productos más vistos</div>
              {data.items.length ? data.items.map((it) => (
                <div className="an-row" key={(it.nombre || '') + (it.tipo || '')}>
                  <span className="an-row-l" title={it.nombre}>{it.nombre || '(sin nombre)'}</span>
                  <span className="an-bar"><span className="an-bar-fill" style={{ width: `${(it.vistas / maxI) * 100}%` }}></span></span>
                  <span className="an-row-v">{it.vistas}</span>
                </div>
              )) : <p className="sin-datos">Sin datos aún</p>}
            </div>

            {/* Páginas más vistas */}
            <div className="an-panel">
              <div className="an-panel-h"><FileText size={18} /> Páginas más vistas</div>
              {data.paginas.length ? data.paginas.map((p) => (
                <div className="an-row" key={p.path}>
                  <span className="an-row-l" title={p.path}>{nombrePagina(p.path)}</span>
                  <span className="an-bar"><span className="an-bar-fill" style={{ width: `${(p.visitas / maxP) * 100}%` }}></span></span>
                  <span className="an-row-v">{p.visitas}</span>
                </div>
              )) : <p className="sin-datos">Sin datos aún</p>}
            </div>
          </div>

          <p className="muted sm" style={{ marginTop: 18 }}>
            Datos propios de la plataforma (se acumulan desde ahora). Para análisis más profundo y campañas, seguí usando Google Analytics y Meta.
          </p>
        </>
      )}
    </section>
  );
};

export default GestionAnalitica;
