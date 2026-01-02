import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import axios from '../services/api';
import './Auth.css';

const RecuperarContraseña = () => {
  const [email, setEmail] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      await axios.post('/auth/recuperar-contraseña', { email });
      setEnviado(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al enviar el email. Intenta de nuevo.');
    } finally {
      setCargando(false);
    }
  };

  if (enviado) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-box">
            <div className="auth-header">
              <CheckCircle size={64} className="auth-icon" style={{ color: '#00ff88' }} />
              <h1>Revisa tu Email</h1>
              <p>Te enviamos instrucciones para recuperar tu contraseña</p>
            </div>

            <div className="email-enviado-content">
              <div className="info-box">
                <h3>📧 Email enviado a:</h3>
                <p className="email-destacado">{email}</p>
              </div>

              <div className="instrucciones-box">
                <h4>Pasos a seguir:</h4>
                <ol>
                  <li>Abre tu bandeja de entrada</li>
                  <li>Busca el email de "Detodo en Cursos Pro"</li>
                  <li>Haz click en el enlace de recuperación</li>
                  <li>Crea tu nueva contraseña</li>
                </ol>
              </div>

              <div className="notas-box">
                <p><strong>💡 Notas importantes:</strong></p>
                <ul>
                  <li>El enlace expira en 1 hora</li>
                  <li>Revisa tu carpeta de spam si no lo encuentras</li>
                  <li>Solo puedes usar el enlace una vez</li>
                </ul>
              </div>

              <Link to="/login" className="btn-volver">
                <ArrowLeft size={18} />
                Volver al Login
              </Link>
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
            <Mail size={48} className="auth-icon" />
            <h1>Recuperar Contraseña</h1>
            <p>Ingresa tu email y te enviaremos instrucciones</p>
          </div>

          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">
                <Mail size={18} />
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="tu@email.com"
                autoComplete="email"
              />
            </div>

            <button 
              type="submit" 
              className="btn-submit"
              disabled={cargando}
            >
              {cargando ? (
                <>
                  <div className="spinner-small"></div>
                  Enviando...
                </>
              ) : (
                'Enviar Instrucciones'
              )}
            </button>
          </form>

          <div className="auth-footer">
            <Link to="/login" className="link-volver">
              <ArrowLeft size={16} />
              Volver al login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecuperarContraseña;