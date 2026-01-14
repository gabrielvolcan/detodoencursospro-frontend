import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { authAPI } from '../services/api';
import './Auth.css';

const RestablecerContraseña = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    password: '',
    confirmarPassword: ''
  });
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [fortaleza, setFortaleza] = useState({ nivel: 0, texto: '', color: '' });
  const [requisitos, setRequisitos] = useState({
    longitud: false,
    mayuscula: false,
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
      numero: /[0-9]/.test(password),
      especial: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    setRequisitos(requisitosActuales);

    const cumplidos = Object.values(requisitosActuales).filter(Boolean).length;
    
    let nivelFortaleza = { nivel: 0, texto: '', color: '' };
    
    if (password.length === 0) {
      nivelFortaleza = { nivel: 0, texto: '', color: '' };
    } else if (cumplidos <= 2) {
      nivelFortaleza = { nivel: 1, texto: 'Débil', color: '#ff3366' };
    } else if (cumplidos === 3) {
      nivelFortaleza = { nivel: 2, texto: 'Media', color: '#ffa500' };
    } else {
      nivelFortaleza = { nivel: 3, texto: 'Fuerte', color: '#00ff88' };
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

    if (formData.password !== formData.confirmarPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (!requisitos.longitud || !requisitos.mayuscula || !requisitos.numero || !requisitos.especial) {
      setError('La contraseña no cumple todos los requisitos de seguridad');
      return;
    }

    setCargando(true);

    try {
      // ✅ USAR authAPI en lugar de axios directo
      await authAPI.restablecerContrasena(token, formData.password);
      setExito(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al restablecer la contraseña. El enlace puede haber expirado.');
    } finally {
      setCargando(false);
    }
  };

  if (exito) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-box">
            <div className="auth-header">
              <CheckCircle size={64} className="auth-icon" style={{ color: '#00ff88' }} />
              <h1>¡Contraseña Restablecida!</h1>
              <p>Tu contraseña ha sido actualizada exitosamente</p>
            </div>

            <div className="exito-content">
              <p className="redirect-message">
                Redirigiendo al login en 3 segundos...
              </p>
              <button 
                className="btn-submit"
                onClick={() => navigate('/login')}
              >
                Ir al Login Ahora
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-box">
          <div className="auth-header">
            <Lock size={48} className="auth-icon" />
            <h1>Nueva Contraseña</h1>
            <p>Crea una contraseña segura para tu cuenta</p>
          </div>

          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="password">
                <Lock size={18} />
                Nueva Contraseña
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
                        width: `${(fortaleza.nivel / 3) * 100}%`,
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

              {/* Requisitos */}
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
                  Restableciendo...
                </>
              ) : (
                'Restablecer Contraseña'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RestablecerContraseña;