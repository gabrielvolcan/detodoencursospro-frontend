import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Package, BookOpen, FileText, Palette, Code } from 'lucide-react';
import { productosAPI } from '../services/api';
import ProductoCardPub from '../components/publico/ProductoCardPub';
import '../styles/publico.css';

const TIPOS = [
  { valor: 'todos', label: 'Todos', ic: Package },
  { valor: 'curso', label: 'Cursos', ic: BookOpen },
  { valor: 'libro', label: 'Libros', ic: FileText },
  { valor: 'ebook', label: 'Ebooks', ic: BookOpen },
  { valor: 'plantilla', label: 'Plantillas', ic: Palette },
  { valor: 'guia', label: 'Guías', ic: FileText },
  { valor: 'software', label: 'Software', ic: Code },
  { valor: 'recurso', label: 'Recursos', ic: Package },
];

const Productos = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [tipo, setTipo] = useState(searchParams.get('tipo') || 'todos');
  const [orden, setOrden] = useState('recientes');

  useEffect(() => {
    setCargando(true);
    productosAPI.obtenerTodos()
      .then(({ data }) => {
        const lista = Array.isArray(data) ? data : (data?.productos || data?.data || []);
        setProductos(lista.filter((p) => p && p._id));
      })
      .catch(() => setProductos([]))
      .finally(() => setCargando(false));
  }, []);

  let lista = productos.filter((p) => {
    if (tipo !== 'todos' && p.tipo !== tipo) return false;
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      return (p.titulo || '').toLowerCase().includes(q) || (p.descripcion || '').toLowerCase().includes(q);
    }
    return true;
  });
  lista = [...lista].sort((a, b) => {
    if (orden === 'precio-asc') return (a.precioUSD || 0) - (b.precioUSD || 0);
    if (orden === 'precio-desc') return (b.precioUSD || 0) - (a.precioUSD || 0);
    if (orden === 'antiguos') return new Date(a.createdAt) - new Date(b.createdAt);
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const cambiarTipo = (t) => { setTipo(t); setSearchParams(t === 'todos' ? {} : { tipo: t }); };

  return (
    <div className="pub">
      <div className="pagehead">
        <div className="hero-bg"></div>
        <div className="shell">
          <h1 className="h1">Productos Digitales</h1>
          <p className="lead" style={{ marginTop: 12 }}>Cursos, libros, plantillas y más recursos para ti</p>
        </div>
      </div>

      <section className="sec" style={{ paddingTop: 40 }}>
        <div className="shell">
          <div className="searchbar" style={{ maxWidth: 760, margin: '0 auto 24px' }}>
            <Search className="ic" />
            <input placeholder="Buscar productos..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
          </div>

          <div className="chips jc" style={{ justifyContent: 'center', marginBottom: 24 }}>
            {TIPOS.map(({ valor, label, ic: Ic }) => (
              <button key={valor} className={`chip ${tipo === valor ? 'on' : ''}`} onClick={() => cambiarTipo(valor)}>
                <Ic className="ic ic-s" />{label}
              </button>
            ))}
          </div>

          <div className="fx ac jb wrap gap12" style={{ paddingBottom: 18, marginBottom: 26, borderBottom: '1px solid var(--bd)' }}>
            <select className="sel" value={orden} onChange={(e) => setOrden(e.target.value)}>
              <option value="recientes">Más recientes</option>
              <option value="antiguos">Más antiguos</option>
              <option value="precio-asc">Precio: menor a mayor</option>
              <option value="precio-desc">Precio: mayor a menor</option>
            </select>
            <span className="muted sm">{lista.length} productos encontrados</span>
          </div>

          {cargando ? (
            <p className="muted">Cargando productos...</p>
          ) : lista.length > 0 ? (
            <div className="cards-3">
              {lista.map((p, i) => <ProductoCardPub key={p._id} producto={p} index={i} />)}
            </div>
          ) : (
            <div className="empty">
              <div className="empty-ic"><Package className="ic ic-lg" /></div>
              <h2 className="h3">No se encontraron productos</h2>
              <p className="muted" style={{ marginTop: 8 }}>Intenta cambiar los filtros o la búsqueda</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Productos;
