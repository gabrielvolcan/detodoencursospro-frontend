import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Video, Users, Star, ArrowRight, Shield, Clock, Award, Headphones, TrendingUp,
} from 'lucide-react';
import { cursosAPI, productosAPI } from '../services/api';
import CursoCardPub from '../components/publico/CursoCardPub';
import ProductoCardPub from '../components/publico/ProductoCardPub';
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
              {cursos.map((c, i) => <CursoCardPub key={c._id} curso={c} index={i} />)}
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
              {productos.map((p, i) => <ProductoCardPub key={p._id} producto={p} index={i} />)}
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
