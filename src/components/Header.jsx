import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, X, User, LogOut, Shield, Package, ChevronDown, BookOpen, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCarrito } from '../context/CarritoContext';
import PaisSelector from './PaisSelector';
import './Header.css';

const Header = () => {
  const { usuario, estaAutenticado, cerrarSesion, esAdmin } = useAuth();
  const { items } = useCarrito();
  const navigate = useNavigate();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [userMenuAbierto, setUserMenuAbierto] = useState(false);

  const handleCerrarSesion = () => {
    cerrarSesion();
    navigate('/');
    setMenuAbierto(false);
    setUserMenuAbierto(false);
  };

  const cerrarMenu = () => {
    setMenuAbierto(false);
  };

  return (
    <header className="header">
      <div className="container header-container">
        {/* Logo */}
        <Link to="/" className="logo" onClick={cerrarMenu}>
          <div className="logo-icon">
            <img src="/images/dtcisotipo.webp" alt="DTC" />
          </div>
          <img src="/images/letras_y_eslogan.webp" alt="Detodo" className="logo-text-img" />
        </Link>

        {/* Navegación principal (desktop) */}
        <nav className="nav nav-desktop">
          <Link to="/" className="nav-link">
            Inicio
          </Link>
          <Link to="/cursos" className="nav-link">
            Cursos
          </Link>
          <Link to="/productos" className="nav-link">
            Productos
          </Link>
        </nav>

        {/* Acciones del header (desktop) */}
        <div className="header-actions header-actions-desktop">
          {/* Selector de país */}
          <PaisSelector />

          {estaAutenticado ? (
            <>
              {/* Botón Admin (si es admin) */}
              {esAdmin() && (
                <Link to="/admin" className="btn-admin-header">
                  <Shield size={18} />
                  <span>Admin</span>
                </Link>
              )}

              {/* Carrito */}
              <Link to="/carrito" className="btn-carrito">
                <ShoppingCart size={20} />
                {items.length > 0 && (
                  <span className="carrito-count">{items.length}</span>
                )}
              </Link>

              {/* Menú de usuario */}
              <div className="user-menu-wrapper">
                <button 
                  className="user-btn"
                  onClick={() => setUserMenuAbierto(!userMenuAbierto)}
                >
                  <div className="user-avatar">
                    {usuario?.nombre?.charAt(0).toUpperCase()}
                  </div>
                  <span className="user-name">{usuario?.nombre}</span>
                  <ChevronDown size={16} className={`chevron ${userMenuAbierto ? 'rotado' : ''}`} />
                </button>

                {userMenuAbierto && (
                  <div className="user-dropdown">
                    <div className="user-dropdown-header">
                      <strong>{usuario?.nombre}</strong>
                      <span>{usuario?.email}</span>
                    </div>
                    <div className="user-dropdown-divider"></div>
                    <Link 
                      to="/mis-cursos-aprender" 
                      className="dropdown-item"
                      onClick={() => setUserMenuAbierto(false)}
                    >
                      <BookOpen size={18} />
                      <span>Mis Cursos</span>
                    </Link>
                    <Link 
                      to="/mis-compras" 
                      className="dropdown-item"
                      onClick={() => setUserMenuAbierto(false)}
                    >
                      <Package size={18} />
                      <span>Mis Compras</span>
                    </Link>
                    <div className="user-dropdown-divider"></div>
                    <button className="dropdown-item logout" onClick={handleCerrarSesion}>
                      <LogOut size={18} />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Carrito (usuario no autenticado) */}
              <Link to="/carrito" className="btn-carrito">
                <ShoppingCart size={20} />
                {items.length > 0 && (
                  <span className="carrito-count">{items.length}</span>
                )}
              </Link>

              {/* Botones de autenticación */}
              <Link to="/login" className="btn-login">
                Ingresar
              </Link>
              <Link to="/registro" className="btn-registro">
                Registrarse
              </Link>
            </>
          )}
        </div>

        {/* Acciones móvil (solo carrito + hamburguesa) */}
        <div className="header-actions header-actions-mobile">
          <Link to="/carrito" className="btn-carrito">
            <ShoppingCart size={20} />
            {items.length > 0 && (
              <span className="carrito-count">{items.length}</span>
            )}
          </Link>

          <button 
            className="menu-toggle"
            onClick={() => setMenuAbierto(!menuAbierto)}
          >
            {menuAbierto ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Menú móvil fullscreen */}
      {menuAbierto && (
        <div className="menu-mobile-overlay">
          <nav className="menu-mobile-content">
            {/* Links de navegación */}
            <div className="menu-mobile-section">
              <Link to="/" className="menu-mobile-link" onClick={cerrarMenu}>
                Inicio
              </Link>
              <Link to="/cursos" className="menu-mobile-link" onClick={cerrarMenu}>
                Cursos
              </Link>
              <Link to="/productos" className="menu-mobile-link" onClick={cerrarMenu}>
                Productos
              </Link>
            </div>

            <div className="menu-mobile-divider"></div>

            {/* Selector de país en móvil */}
            <div className="menu-mobile-section">
              <div className="menu-mobile-label">
                <Globe size={18} />
                <span>País y Moneda</span>
              </div>
              <PaisSelector />
            </div>

            {estaAutenticado ? (
              <>
                <div className="menu-mobile-divider"></div>

                {/* Usuario autenticado */}
                <div className="menu-mobile-section">
                  <div className="menu-mobile-user-info">
                    <div className="user-avatar-mobile">
                      {usuario?.nombre?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <strong>{usuario?.nombre}</strong>
                      <span>{usuario?.email}</span>
                    </div>
                  </div>

                  <Link to="/mis-cursos-aprender" className="menu-mobile-link" onClick={cerrarMenu}>
                    <BookOpen size={18} />
                    <span>Mis Cursos</span>
                  </Link>

                  <Link to="/mis-compras" className="menu-mobile-link" onClick={cerrarMenu}>
                    <Package size={18} />
                    <span>Mis Compras</span>
                  </Link>

                  {esAdmin() && (
                    <Link to="/admin" className="menu-mobile-link admin" onClick={cerrarMenu}>
                      <Shield size={18} />
                      <span>Panel Admin</span>
                    </Link>
                  )}

                  <button className="menu-mobile-link logout" onClick={handleCerrarSesion}>
                    <LogOut size={18} />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="menu-mobile-divider"></div>

                {/* Botones de autenticación */}
                <div className="menu-mobile-section menu-mobile-auth">
                  <Link to="/login" className="btn-mobile-login" onClick={cerrarMenu}>
                    Ingresar
                  </Link>
                  <Link to="/registro" className="btn-mobile-registro" onClick={cerrarMenu}>
                    Registrarse
                  </Link>
                </div>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;