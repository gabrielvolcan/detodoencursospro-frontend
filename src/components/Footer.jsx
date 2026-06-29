import { useLocation, Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import '../styles/publico.css';

const Footer = () => {
  const { pathname } = useLocation();
  // No mostrar el footer en el panel admin ni en el lector de libros
  if (pathname.startsWith('/admin') || pathname.startsWith('/leer')) return null;

  return (
    <footer className="pub-ft">
      <div className="shell">
        <div className="ft-grid">
          <div>
            <div className="ft-brand">
              <img src="/images/dtcisotipo.webp" alt="Detodo en Cursos" style={{ width: 34, height: 34, objectFit: 'contain' }} />
              <b className="green" style={{ fontSize: 17 }}>Detodo en Cursos</b>
            </div>
            <p className="muted sm" style={{ maxWidth: 300, lineHeight: 1.6, margin: 0 }}>
              Cursos y productos digitales para que aprendas y crezcas, desde donde estés. 🌎
            </p>
          </div>

          <div>
            <p className="ft-h">Navegación</p>
            <Link className="ft-link" to="/cursos">Cursos</Link>
            <Link className="ft-link" to="/productos">Productos</Link>
            <Link className="ft-link" to="/como-comprar">Cómo comprar</Link>
            <Link className="ft-link" to="/mis-compras">Mis Compras</Link>
            <Link className="ft-link" to="/mis-cursos-aprender">Mis Cursos</Link>
          </div>

          <div>
            <p className="ft-h">Legales</p>
            <Link className="ft-link" to="/terminos">Términos y Condiciones</Link>
            <Link className="ft-link" to="/privacidad">Política de Privacidad</Link>
            <Link className="ft-link" to="/reembolsos">Política de Reembolso</Link>
          </div>

          <div>
            <p className="ft-h">Contacto</p>
            <a className="ft-link fx ac gap8" href="mailto:contacto@detodoencursos.com">
              <Mail className="ic ic-s" /> contacto@detodoencursos.com
            </a>
          </div>
        </div>

        <div className="ft-bot">
          <span>© 2026 Detodo en Cursos. Todos los derechos reservados.</span>
          <span className="fx ac gap16">
            <Link to="/terminos">Términos</Link>
            <Link to="/privacidad">Privacidad</Link>
            <Link to="/reembolsos">Reembolsos</Link>
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
