import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Award, Users, TrendingUp, ArrowRight, Video, Clock, Star } from 'lucide-react';
import { cursosAPI } from '../services/api';
import CursoCard from '../components/CursoCard';
import './Home.css';

const Home = () => {
  const [cursosDestacados, setCursosDestacados] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarCursosDestacados();
    
    // Intersection Observer para animaciones al hacer scroll
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    }, observerOptions);

    // Observar elementos con clase animate-on-scroll
    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const cargarCursosDestacados = async () => {
    try {
      const { data } = await cursosAPI.obtenerTodos({ destacados: 'true' });
      setCursosDestacados(data.slice(0, 3));
    } catch (error) {
      console.error('Error cargando cursos:', error);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg"></div>
        <div className="container hero-content">
          <div className="hero-text">
            <h1 className="hero-titulo">
              Aprende Nuevas Habilidades
              <span className="gradient-text"> Transforma tu Futuro</span>
            </h1>
            <p className="hero-descripcion">
              Accede a cursos profesionales en diversas áreas. Certificaciones reconocidas, 
              instructores expertos y contenido actualizado para impulsar tu carrera.
            </p>
            <div className="hero-stats">
              <div className="stat">
                <Video size={24} />
                <div>
                  <strong>+50</strong>
                  <span>Horas de Video</span>
                </div>
              </div>
              <div className="stat">
                <Users size={24} />
                <div>
                  <strong>+1,500</strong>
                  <span>Estudiantes</span>
                </div>
              </div>
              <div className="stat">
                <Star size={24} />
                <div>
                  <strong>4.9/5</strong>
                  <span>Calificación</span>
                </div>
              </div>
            </div>
            <div className="hero-actions">
              <Link to="/cursos" className="btn-primary">
                Ver Todos los Cursos
                <ArrowRight size={20} />
              </Link>
              <Link to="/registro" className="btn-secondary">
                Registrarse Gratis
              </Link>
            </div>
          </div>
          
          {/* Grid simétrico de características - NUEVO */}
          <div className="hero-visual">
            <div className="features-grid">
              <div className="feature-card feature-1">
                <div className="feature-icon">
                  <Shield size={32} />
                </div>
                <h4>Certificación Profesional</h4>
                <p>Reconocida internacionalmente</p>
              </div>
              
              <div className="feature-card feature-2">
                <div className="feature-icon">
                  <Clock size={32} />
                </div>
                <h4>Acceso de por Vida</h4>
                <p>Sin límites de tiempo</p>
              </div>
              
              <div className="feature-card feature-3">
                <div className="feature-icon">
                  <Award size={32} />
                </div>
                <h4>Instructores Expertos</h4>
                <p>Profesionales certificados</p>
              </div>
              
              <div className="feature-card feature-4">
                <div className="feature-icon">
                  <Video size={32} />
                </div>
                <h4>Contenido Premium</h4>
                <p>Videos Full HD actualizados</p>
              </div>
              
              <div className="feature-card feature-5">
                <div className="feature-icon">
                  <Users size={32} />
                </div>
                <h4>Comunidad Activa</h4>
                <p>+1,500 estudiantes</p>
              </div>
              
              <div className="feature-card feature-6">
                <div className="feature-icon">
                  <TrendingUp size={32} />
                </div>
                <h4>Soporte 24/7</h4>
                <p>Ayuda cuando la necesites</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Características */}
      <section className="caracteristicas py-5">
        <div className="container">
          <div className="grid grid-4">
            <div className="caracteristica">
              <div className="caracteristica-icon">
                <Video />
              </div>
              <h3>Contenido Práctico</h3>
              <p>Videos paso a paso con casos reales de instalación</p>
            </div>
            <div className="caracteristica">
              <div className="caracteristica-icon">
                <Users />
              </div>
              <h3>Soporte Continuo</h3>
              <p>Comunidad activa y respuesta a tus dudas</p>
            </div>
            <div className="caracteristica">
              <div className="caracteristica-icon">
                <Award />
              </div>
              <h3>Certificación</h3>
              <p>Certificado oficial al completar cada curso</p>
            </div>
            <div className="caracteristica">
              <div className="caracteristica-icon">
                <TrendingUp />
              </div>
              <h3>Actualización Constante</h3>
              <p>Nuevas tecnologías y tendencias del mercado</p>
            </div>
          </div>
        </div>
      </section>

      {/* Cursos Destacados */}
      {cursosDestacados.length > 0 && (
        <section className="cursos-destacados py-5">
          <div className="container">
            <div className="section-header text-center mb-4">
              <h2>Cursos Destacados</h2>
              <p>Los más populares entre nuestros estudiantes</p>
            </div>
            
            <div className="grid grid-3">
              {cursosDestacados.map(curso => (
                <CursoCard key={curso._id} curso={curso} />
              ))}
            </div>

            <div className="text-center mt-4">
              <Link to="/cursos" className="btn-ver-mas">
                Ver Todos los Cursos
                <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Por qué elegirnos - CON LOGO Y ANIMACIONES BRUTALES */}
      <section className="por-que py-5">
        <div className="container">
          <div className="por-que-content">
            <div className="por-que-imagen animate-on-scroll">
              <div className="imagen-placeholder">
                {/* Logo con animaciones brutales */}
                <div className="logo-animated-container">
                  <img 
                    src="/images/dtcisotipo.webp" 
                    alt="Logo" 
                    className="logo-brutal"
                  />
                  <div className="glow-ring ring-1"></div>
                  <div className="glow-ring ring-2"></div>
                  <div className="glow-ring ring-3"></div>
                  <div className="particles">
                    {[...Array(12)].map((_, i) => (
                      <div key={i} className={`particle particle-${i + 1}`}></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="por-que-texto animate-on-scroll">
              <h2>¿Por qué Elegirnos?</h2>
              <ul className="beneficios">
                <li className="beneficio-item" style={{ animationDelay: '0.1s' }}>
                  <span className="check">✓</span>
                  <div>
                    <strong>Instructores Expertos</strong>
                    <p>Profesionales con años de experiencia en cada área</p>
                  </div>
                </li>
                <li className="beneficio-item" style={{ animationDelay: '0.2s' }}>
                  <span className="check">✓</span>
                  <div>
                    <strong>Contenido Actualizado</strong>
                    <p>Cursos adaptados a las últimas tendencias del mercado</p>
                  </div>
                </li>
                <li className="beneficio-item" style={{ animationDelay: '0.3s' }}>
                  <span className="check">✓</span>
                  <div>
                    <strong>Acceso Ilimitado</strong>
                    <p>Estudia a tu ritmo, cuando y donde quieras</p>
                  </div>
                </li>
                <li className="beneficio-item" style={{ animationDelay: '0.4s' }}>
                  <span className="check">✓</span>
                  <div>
                    <strong>Certificación Profesional</strong>
                    <p>Certificados reconocidos al completar cada curso</p>
                  </div>
                </li>
              </ul>
              <Link to="/cursos" className="btn-primary mt-3 btn-pulse">
                Comenzar Ahora
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="cta-final py-5">
        <div className="container text-center">
          <h2>¿Listo para Impulsar tu Carrera?</h2>
          <p>Únete a miles de estudiantes que ya están aprendiendo con nosotros</p>
          <Link to="/registro" className="btn-cta">
            Crear Cuenta Gratis
            <ArrowRight size={22} />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
