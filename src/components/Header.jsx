import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Globe, ShoppingCart, ChevronDown, GraduationCap, Package, LogOut, Shield, Menu,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCarrito } from '../context/CarritoContext';
import { usePais } from '../context/PaisContext';
import '../styles/publico.css';

const Header = () => {
  const { usuario, estaAutenticado, cerrarSesion, esAdmin } = useAuth();
  const { items } = useCarrito();
  const { paisSeleccionado, setPaisSeleccionado, paises, obtenerPaisActual } = usePais();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [countryOpen, setCountryOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

  const paisActual = obtenerPaisActual();
  const cartCount = Array.isArray(items) ? items.length : 0;
  const inicial = (usuario?.nombre || 'U').charAt(0).toUpperCase();

  const ir = (ruta) => {
    navigate(ruta);
    setMenuOpen(false); setCountryOpen(false); setUserOpen(false);
  };
  const logout = () => { cerrarSesion(); ir('/'); };
  const navCls = (ruta) => `navlink ${pathname === ruta ? 'on' : ''}`;

  return (
    <header className="pub-hdr">
      <div className="shell hdr-in">
        <button className="logo" onClick={() => ir('/')}>
          <img className="logo-mk" src="/images/dtcisotipo.webp" alt="Detodo en Cursos" />
          <img className="logo-tx-img" src="/images/letras_y_eslogan.webp" alt="Detodo en Cursos" />
        </button>

        <nav className="nav">
          <button className={navCls('/')} onClick={() => ir('/')}>Inicio</button>
          <button className={navCls('/cursos')} onClick={() => ir('/cursos')}>Cursos</button>
          <button className={navCls('/productos')} onClick={() => ir('/productos')}>Productos</button>
        </nav>

        <div className="hdr-r">
          <div className="ctry">
            <button className="ctry-btn" onClick={() => { setCountryOpen(!countryOpen); setUserOpen(false); }}>
              <Globe className="ic" />
              <span className="ctry-fl">{paisActual?.bandera}</span>
              <span className="ctry-name">{paisActual?.nombre}</span>
            </button>
            {countryOpen && (
              <div className="ctry-menu">
                {paises.map((p) => (
                  <button
                    key={p.codigo}
                    className={`ctry-item ${p.codigo === paisSeleccionado ? 'on' : ''}`}
                    onClick={() => { setPaisSeleccionado(p.codigo); setCountryOpen(false); }}
                  >
                    <span className="ctry-fl">{p.bandera}</span>
                    <span>{p.nombre}</span>
                    <span className="muted xs" style={{ marginLeft: 'auto' }}>{p.moneda}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button className="icbtn" onClick={() => ir('/carrito')} aria-label="Carrito">
            <ShoppingCart className="ic" />
            {cartCount > 0 && <span className="cart-n">{cartCount}</span>}
          </button>

          {!estaAutenticado ? (
            <span className="hdr-auth">
              <button className="btn btng" onClick={() => ir('/login')}>Ingresar</button>
              <button className="btn btno" onClick={() => ir('/registro')}>Registrarse</button>
            </span>
          ) : (
            <div className="ctry hdr-auth">
              <button className="uav" onClick={() => { setUserOpen(!userOpen); setCountryOpen(false); }}>
                <span className="uav-c">{inicial}</span>
                <span>Mi cuenta</span>
                <ChevronDown className="ic ic-s" />
              </button>
              {userOpen && (
                <div className="umenu">
                  <button onClick={() => ir('/mis-cursos-aprender')}><GraduationCap className="ic ic-s" />Mis Cursos</button>
                  <button onClick={() => ir('/mis-compras')}><Package className="ic ic-s" />Mis Compras</button>
                  {esAdmin() && <button onClick={() => ir('/admin')}><Shield className="ic ic-s" />Panel Admin</button>}
                  <button onClick={logout}><LogOut className="ic ic-s" />Cerrar sesión</button>
                </div>
              )}
            </div>
          )}

          <button className="burger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menú">
            <Menu className="ic" />
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="mnav">
          <a onClick={() => ir('/')}>Inicio</a>
          <a onClick={() => ir('/cursos')}>Cursos</a>
          <a onClick={() => ir('/productos')}>Productos</a>
          <a onClick={() => ir('/carrito')}>Carrito</a>
          {!estaAutenticado ? (
            <>
              <a onClick={() => ir('/login')}>Ingresar</a>
              <a onClick={() => ir('/registro')}>Registrarse</a>
            </>
          ) : (
            <>
              <a onClick={() => ir('/mis-cursos-aprender')}>Mis Cursos</a>
              <a onClick={() => ir('/mis-compras')}>Mis Compras</a>
              {esAdmin() && <a onClick={() => ir('/admin')}>Panel Admin</a>}
              <a onClick={logout}>Cerrar sesión</a>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
