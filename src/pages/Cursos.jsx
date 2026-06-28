import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { cursosAPI } from '../services/api';
import CursoCardPub from '../components/publico/CursoCardPub';
import '../styles/publico.css';

const Cursos = () => {
  const [cursos, setCursos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [categorias, setCategorias] = useState(['Todos']);
  const [niveles, setNiveles] = useState(['Todos']);
  const [filtros, setFiltros] = useState({ categoria: 'Todos', nivel: 'Todos', busqueda: '' });

  useEffect(() => {
    Promise.all([cursosAPI.obtenerCategorias(), cursosAPI.obtenerNiveles()])
      .then(([c, n]) => { setCategorias(['Todos', ...c.data]); setNiveles(['Todos', ...n.data]); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setCargando(true);
    const params = {};
    if (filtros.categoria !== 'Todos') params.categoria = filtros.categoria;
    if (filtros.nivel !== 'Todos') params.nivel = filtros.nivel;
    if (filtros.busqueda) params.busqueda = filtros.busqueda;
    cursosAPI.obtenerTodos(params)
      .then(({ data }) => setCursos((data || []).filter((c) => c && c._id)))
      .catch(() => setCursos([]))
      .finally(() => setCargando(false));
  }, [filtros]);

  const set = (k, v) => setFiltros((f) => ({ ...f, [k]: v }));

  return (
    <div className="pub">
      <div className="pagehead">
        <div className="hero-bg"></div>
        <div className="shell">
          <h1 className="h1">Catálogo de Cursos</h1>
          <p className="lead" style={{ marginTop: 12 }}>Encuentra el curso perfecto para tu nivel y objetivos</p>
        </div>
      </div>

      <section className="sec" style={{ paddingTop: 40 }}>
        <div className="shell">
          <div className="fpanel">
            <div className="searchbar">
              <Search className="ic" />
              <input placeholder="Buscar cursos..." value={filtros.busqueda} onChange={(e) => set('busqueda', e.target.value)} />
            </div>
            <p className="flbl">Categoría</p>
            <div className="chips" style={{ marginBottom: 20 }}>
              {categorias.map((cat) => (
                <button key={cat} className={`chip ${filtros.categoria === cat ? 'on' : ''}`} onClick={() => set('categoria', cat)}>{cat}</button>
              ))}
            </div>
            <p className="flbl">Nivel</p>
            <div className="chips">
              {niveles.map((nv) => (
                <button key={nv} className={`chip ${filtros.nivel === nv ? 'on' : ''}`} onClick={() => set('nivel', nv)}>{nv}</button>
              ))}
            </div>
          </div>

          <h2 className="h2" style={{ margin: '38px 0 22px' }}>
            {cursos.length} {cursos.length === 1 ? 'Curso Encontrado' : 'Cursos Encontrados'}
          </h2>

          {cargando ? (
            <p className="muted">Cargando cursos...</p>
          ) : cursos.length > 0 ? (
            <div className="cards-4">
              {cursos.map((c, i) => <CursoCardPub key={c._id} curso={c} index={i} />)}
            </div>
          ) : (
            <div className="empty">
              <div className="empty-ic"><Search className="ic ic-lg" /></div>
              <h2 className="h3">No se encontraron cursos</h2>
              <p className="muted" style={{ marginTop: 8 }}>Intenta ajustar los filtros o buscar con otros términos</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Cursos;
