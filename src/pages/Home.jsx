import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Video, Users, Star, ArrowRight, Shield, Clock, Award, Headphones, TrendingUp, ShoppingCart, BookOpen, Package,
} from 'lucide-react';
import { cursosAPI, productosAPI } from '../services/api';
import { usePais } from '../context/PaisContext';
import { useCarrito } from '../context/CarritoContext';
import PubThumb from '../components/publico/PubThumb';
import '../styles/publico.css';

const FEATURES = [
  { ic: Shield, t: 'Certificación Profesional', s: 'Reconocida' },
  { ic: Clock, t: 'Acceso de por Vida', s: 'Sin límites de tiempo' },
  { ic: Award, t: 'Instructores Expertos', s: 'Profesionales certificados' },
  { ic: Video, t: 'Contenido Premium', s: 'Videos Full HD actualizados' },
  { ic: Users, t: 'Comunidad Activa', s: '+1,500 estudiantes' },
  { ic: Headphones, t: 'Soporte 24/7', s: 'Ayuda cuando la necesites' },
];

const BENEFITS = [
  { ic: Video, t: 'Contenido Práctico', p: 'Videos paso a paso con casos reales' },
  { ic: Users, t: 'Soporte Continuo', p: 'Comunidad activa y respuesta a tus dudas' },
  { ic: Award, t: 'Certificación', p: 'Certificado oficial al completar cada curso' },
  { ic: TrendingUp, t: 'Actualización Constante', p: 'Nuevas tecnologías y tendencias del mercado' },
];

const Home = () => {
  const navigate = useNavigate();
  const { precioDeItem } = usePais();
  const { agregarAlCarrito } = useCarrito();
  const [cursos, setCursos] = useState([]);
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    cursosAPI.obtenerTodos({ destacados: 'true' })
      .then(({ data }) => setCursos((data || []).filter((c) => c && c._id).slice(0, 3)))
      .catch(() => setCursos([]));
    productosAPI.obtenerTodos()
      .then(({ data }) => {
        const lista = Array.isArray(data) ? data : (data?.productos || []);
        setProductos(lista.filter((p) => p && p._id).slice(0, 3));
      })
      .catch(() => setProductos([]));
  }, []);

  const precioLabel = (item) => (item.esGratuito || item.gratis ? 'GRATIS' : precioDeItem(item).formatted);

  return (
    <div className="pub">
      {/* HERO */}
      <section className="hero">
        <div className="hero-bg"></div>
        <div className="hero-grid"></div>
        <div className="shell hero-in">
          <div>
            <h1 className="display">Aprende Nuevas Habilidades<br /><span className="green">Transforma tu Futuro</span></h1>
            <p className="lead" style={{ marginTop: 22, maxWidth: 480 }}>
              Accede a cursos profesionales en diversas áreas. Certificaciones reconocidas, instructores expertos y contenido actualizado para impulsar tu carrera.
            </p>
            <div className="stats">
              <div className="stat"><Video className="ic" /><div><b>+50</b><span>Horas de Video</span></div></div>
              <div className="stat"><Users className="ic" /><div><b>+1,500</b><span>Estudiantes</span></div></div>
              <div className="stat"><Star className="ic star" /><div><b>4.9/5</b><span>Calificación</span></div></div>
            </div>
            <div className="fx ac gap12 wrap">
              <button className="btn btnp btn-lg" onClick={() => navigate('/cursos')}>Ver Todos los Cursos<ArrowRight className="ic" /></button>
              <button className="btn btno btn-lg" onClick={() => navigate('/registro')}>Registrarse Gratis</button>
            </div>
          </div>
          <div className="feat-grid">
            {FEATURES.map(({ ic: Ic, t, s }) => (
              <div className="feat" key={t}>
                <div className="feat-ic"><Ic className="ic" /></div>
                <b>{t}</b><span>{s}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BENEFICIOS */}
      <div className="bene-band">
        <div className="shell">
          <div className="bene-grid">
            {BENEFITS.map(({ ic: Ic, t, p }) => (
              <div className="bene" key={t}>
                <div className="bene-ic"><Ic className="ic ic-lg" /></div>
                <h3 className="h3">{t}</h3>
                <p>{p}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CURSOS DESTACADOS */}
      {cursos.length > 0 && (
        <section className="sec">
          <div className="shell">
            <div className="sec-h"><h2 className="h2">Cursos Destacados</h2><p className="muted" style={{ margin: 0 }}>Los más populares entre nuestros estudiantes</p></div>
            <div className="rule" style={{ marginBottom: 26 }}></div>
            <div className="cards-3">
              {cursos.map((c, i) => {
                const free = c.esGratuito || c.precioUSD === 0;
                return (
                  <article className="card card-h ccard" key={c._id}>
                    <PubThumb src={c.imagen} alt={c.titulo} index={i} icon={BookOpen} className="thumb pointer" />
                    <div className="ccard-bd">
                      <span className="pill pill-d upper xs" style={{ alignSelf: 'flex-start' }}>{c.categoria}</span>
                      <h3 className="h3 pointer" style={{ margin: '14px 0 9px' }} onClick={() => navigate(`/curso/${c._id}`)}>{c.titulo}</h3>
                      <p className="muted sm" style={{ lineHeight: 1.55, margin: '0 0 16px' }}>{c.descripcionCorta || ''}</p>
                      <div className="ccard-meta">
                        <span className="mi"><Users className="ic ic-s" />{c.estudiantes || 0} estudiantes</span>
                        {c.nivel && <span className="mi"><Award className="ic ic-s" />{c.nivel}</span>}
                      </div>
                      <div className="rule" style={{ margin: '16px 0' }}></div>
                      <div className="fx ac jb" style={{ marginTop: 'auto', gap: 10 }}>
                        <span className={free ? 'price-free' : 'price'}>{precioLabel(c)}</span>
                        {free
                          ? <button className="btn btnp btn-sm" onClick={() => navigate(`/curso/${c._id}`)}>Inscribirme</button>
                          : <button className="btn btnp btn-sm" onClick={() => agregarAlCarrito(c)}><ShoppingCart className="ic ic-s" />Agregar</button>}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
            <div className="fx jc" style={{ marginTop: 36 }}>
              <button className="btn btno btn-lg" onClick={() => navigate('/cursos')}>Ver Todos los Cursos<ArrowRight className="ic" /></button>
            </div>
          </div>
        </section>
      )}

      {/* PRODUCTOS */}
      {productos.length > 0 && (
        <section className="sec" style={{ paddingTop: 0 }}>
          <div className="shell">
            <div className="sec-h"><h2 className="h2">Productos Digitales</h2><p className="muted" style={{ margin: 0 }}>Libros y recursos para seguir creciendo</p></div>
            <div className="rule" style={{ marginBottom: 26 }}></div>
            <div className="cards-3">
              {productos.map((p, i) => (
                <article className="card card-h ccard" key={p._id}>
                  <PubThumb src={p.imagen} alt={p.titulo} index={i + 3} icon={Package} className="thumb pointer" />
                  <div className="ccard-bd">
                    <span className="pill pill-d upper xs" style={{ alignSelf: 'flex-start' }}>{p.tipo || 'Producto'}</span>
                    <h3 className="h3 pointer" style={{ margin: '14px 0 9px' }} onClick={() => navigate(`/producto/${p._id}`)}>{p.titulo}</h3>
                    <p className="muted sm" style={{ lineHeight: 1.55, margin: '0 0 16px' }}>{(p.descripcion || '').substring(0, 90)}</p>
                    <div className="rule" style={{ margin: '0 0 16px' }}></div>
                    <div className="fx ac jb" style={{ marginTop: 'auto', gap: 10 }}>
                      <span className="price">{precioLabel(p)}</span>
                      <button className="btn btnp btn-sm" onClick={() => navigate(`/producto/${p._id}`)}>Ver detalles</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <div className="cta-band">
        <div className="shell" style={{ maxWidth: 680 }}>
          <h2 className="h1">¿Listo para Impulsar tu Carrera?</h2>
          <p className="lead" style={{ margin: '16px 0 30px' }}>Únete a miles de estudiantes que ya están aprendiendo con nosotros</p>
          <button className="btn btnp btn-lg" onClick={() => navigate('/registro')}>Crear Cuenta Gratis<ArrowRight className="ic" /></button>
        </div>
      </div>
    </div>
  );
};

export default Home;
