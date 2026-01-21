import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, Phone, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Registro = () => {
  const navigate = useNavigate();
  const { registrarse } = useAuth();
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    password: '',
    confirmarPassword: ''
  });
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
  const [fortaleza, setFortaleza] = useState({ nivel: 0, texto: '', color: '' });
  const [requisitos, setRequisitos] = useState({
    longitud: false,
    mayuscula: false,
    minuscula: false,
    numero: false,
    especial: false
  });

  // Validar contraseña en tiempo real
  useEffect(() => {
    validarPassword(formData.password);
  }, [formData.password]);

  const validarPassword = (password) => {
    const requisitosActuales = {
      longitud: password.length >= 8,
      mayuscula: /[A-Z]/.test(password),
      minuscula: /[a-z]/.test(password),
      numero: /[0-9]/.test(password),
      especial: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    setRequisitos(requisitosActuales);

    // Calcular nivel de fortaleza
    const cumplidos = Object.values(requisitosActuales).filter(Boolean).length;
    
    let nivelFortaleza = { nivel: 0, texto: '', color: '' };
    
    if (password.length === 0) {
      nivelFortaleza = { nivel: 0, texto: '', color: '' };
    } else if (cumplidos <= 2) {
      nivelFortaleza = { nivel: 1, texto: 'Débil', color: '#ff3366' };
    } else if (cumplidos <= 3) {
      nivelFortaleza = { nivel: 2, texto: 'Media', color: '#ffa500' };
    } else if (cumplidos <= 4) {
      nivelFortaleza = { nivel: 3, texto: 'Buena', color: '#00cc6e' };
    } else {
      nivelFortaleza = { nivel: 4, texto: 'Fuerte', color: '#00ff88' };
    }

    setFortaleza(nivelFortaleza);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validar que las contraseñas coincidan
    if (formData.password !== formData.confirmarPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    // Validar longitud mínima
    if (formData.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    // Validar requisitos de seguridad
    if (!requisitos.mayuscula) {
      setError('La contraseña debe contener al menos una letra mayúscula');
      return;
    }

    if (!requisitos.numero) {
      setError('La contraseña debe contener al menos un número');
      return;
    }

    if (!requisitos.especial) {
      setError('La contraseña debe contener al menos un carácter especial (!@#$%^&*)');
      return;
    }

    setCargando(true);

    // 🆕 OBTENER CURSO GRATUITO SI EXISTE
    const cursoGratuitoId = localStorage.getItem('cursoGratuitoId');
    console.log('🔍 Curso gratuito en localStorage:', cursoGratuitoId);

    const { confirmarPassword, ...datosRegistro } = formData;
    
    // 🆕 AGREGAR cursoGratuitoId AL PAYLOAD
    const datosConCurso = {
      ...datosRegistro,
      cursoGratuitoId: cursoGratuitoId || undefined
    };

    const resultado = await registrarse(datosConCurso);

    if (resultado.exito) {
      // 🆕 LIMPIAR LOCALSTORAGE
      localStorage.removeItem('cursoGratuitoId');
      
      // Mostrar mensaje personalizado si se inscribió a curso gratuito
      if (cursoGratuitoId) {
        alert('🎉 ¡Registro exitoso! El curso gratuito se agregó a tu cuenta. Por favor verifica tu email para activarla.');
      } else {
        alert('¡Registro exitoso! Por favor verifica tu email para activar tu cuenta.');
      }
      
      navigate('/login');
    } else {
      setError(resultado.error);
    }
    setCargando(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-box auth-box-registro">
          <div className="auth-header">
            <UserPlus size={48} className="auth-icon" />
            <h1>Crear Cuenta</h1>
            <p>Únete y comienza a aprender hoy</p>
          </div>

          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="nombre">
                <User size={18} />
                Nombre Completo
              </label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
                placeholder="Juan Pérez"
                autoComplete="name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">
                <Mail size={18} />
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="tu@email.com"
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="telefono">
                <Phone size={18} />
                Teléfono (opcional)
              </label>
              <input
                type="tel"
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                placeholder="+54 11 1234-5678"
                autoComplete="tel"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">
                <Lock size={18} />
                Contraseña
              </label>
              <div className="password-input-wrapper">
                <input
                  type={mostrarPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setMostrarPassword(!mostrarPassword)}
                  tabIndex="-1"
                >
                  {mostrarPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {/* Indicador de fortaleza */}
              {formData.password && (
                <div className="password-strength">
                  <div className="strength-bar">
                    <div 
                      className="strength-bar-fill"
                      style={{ 
                        width: `${(fortaleza.nivel / 4) * 100}%`,
                        backgroundColor: fortaleza.color
                      }}
                    ></div>
                  </div>
                  <span 
                    className="strength-text"
                    style={{ color: fortaleza.color }}
                  >
                    {fortaleza.texto}
                  </span>
                </div>
              )}

              {/* Requisitos de contraseña */}
              {formData.password && (
                <div className="password-requirements">
                  <p className="requirements-title">La contraseña debe contener:</p>
                  <div className="requirement-item">
                    {requisitos.longitud ? 
                      <CheckCircle size={16} className="check-icon" /> : 
                      <AlertCircle size={16} className="alert-icon" />
                    }
                    <span className={requisitos.longitud ? 'valid' : ''}>
                      Mínimo 8 caracteres
                    </span>
                  </div>
                  <div className="requirement-item">
                    {requisitos.mayuscula ? 
                      <CheckCircle size={16} className="check-icon" /> : 
                      <AlertCircle size={16} className="alert-icon" />
                    }
                    <span className={requisitos.mayuscula ? 'valid' : ''}>
                      Al menos una mayúscula (A-Z)
                    </span>
                  </div>
                  <div className="requirement-item">
                    {requisitos.numero ? 
                      <CheckCircle size={16} className="check-icon" /> : 
                      <AlertCircle size={16} className="alert-icon" />
                    }
                    <span className={requisitos.numero ? 'valid' : ''}>
                      Al menos un número (0-9)
                    </span>
                  </div>
                  <div className="requirement-item">
                    {requisitos.especial ? 
                      <CheckCircle size={16} className="check-icon" /> : 
                      <AlertCircle size={16} className="alert-icon" />
                    }
                    <span className={requisitos.especial ? 'valid' : ''}>
                      Al menos un carácter especial (!@#$%^&*)
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="confirmarPassword">
                <Lock size={18} />
                Confirmar Contraseña
              </label>
              <div className="password-input-wrapper">
                <input
                  type={mostrarConfirmar ? 'text' : 'password'}
                  id="confirmarPassword"
                  name="confirmarPassword"
                  value={formData.confirmarPassword}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setMostrarConfirmar(!mostrarConfirmar)}
                  tabIndex="-1"
                >
                  {mostrarConfirmar ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {formData.confirmarPassword && formData.password !== formData.confirmarPassword && (
                <p className="password-mismatch">
                  <AlertCircle size={16} />
                  Las contraseñas no coinciden
                </p>
              )}
            </div>

            <button 
              type="submit" 
              className="btn-submit"
              disabled={cargando}
            >
              {cargando ? (
                <>
                  <div className="spinner-small"></div>
                  Registrando...
                </>
              ) : (
                'Crear Cuenta'
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              ¿Ya tienes cuenta?{' '}
              <Link to="/login">Inicia sesión aquí</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Registro;
