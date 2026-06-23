import { Link, useLocation } from 'react-router-dom';
import { Mail, BookOpen } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  const { pathname } = useLocation();
  // No mostrar el footer en el panel admin ni en el lector de libros
  if (pathname.startsWith('/admin') || pathname.startsWith('/leer')) return null;

  const anio = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-col footer-brand">
          <div className="footer-logo">
            <BookOpen size={22} />
            <span>Detodo en Cursos</span>
          </div>
          <p>Cursos y productos digitales para que aprendas y crezcas, desde donde estés. 🌎</p>
        </div>

        <div className="footer-col">
          <h4>Navegación</h4>
          <Link to="/cursos">Cursos</Link>
          <Link to="/productos">Productos</Link>
          <Link to="/mis-compras">Mis Compras</Link>
          <Link to="/mis-cursos-aprender">Mis Cursos</Link>
        </div>

        <div className="footer-col">
          <h4>Legales</h4>
          <Link to="/terminos">Términos y Condiciones</Link>
          <Link to="/privacidad">Política de Privacidad</Link>
          <Link to="/reembolsos">Política de Reembolso</Link>
        </div>

        <div className="footer-col">
          <h4>Contacto</h4>
          <a href="mailto:contacto@detodoencursos.com">
            <Mail size={15} /> contacto@detodoencursos.com
          </a>
          {/* TODO: completar con tu WhatsApp e Instagram reales */}
        </div>
      </div>

      <div className="footer-bottom">
        <span>© {anio} Detodo en Cursos. Todos los derechos reservados.</span>
        <div className="footer-bottom-links">
          <Link to="/terminos">Términos</Link>
          <span>·</span>
          <Link to="/privacidad">Privacidad</Link>
          <span>·</span>
          <Link to="/reembolsos">Reembolsos</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
