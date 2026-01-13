import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import './VerificarEmail.css';

const VerificarEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [estado, setEstado] = useState('verificando'); // verificando, exito, error
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    verificarEmail();
  }, [token]);

  const verificarEmail = async () => {
    try {
      const { data } = await authAPI.verificarEmail(token);
      setEstado('exito');
      setMensaje(data.mensaje || 'Email verificado exitosamente');
      
      // Redirigir al login después de 3 segundos
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      setEstado('error');
      setMensaje(error.response?.data?.error || 'Token inválido o expirado');
    }
  };

  return (
    <div className="verificar-email-container">
      <div className="verificar-email-card">
        {estado === 'verificando' && (
          <>
            <div className="verificar-icono verificando">
              <Loader size={64} className="spinner" />
            </div>
            <h1>Verificando tu email...</h1>
            <p>Por favor espera un momento</p>
          </>
        )}

        {estado === 'exito' && (
          <>
            <div className="verificar-icono exito">
              <CheckCircle size={64} />
            </div>
            <h1>¡Email verificado!</h1>
            <p>{mensaje}</p>
            <p className="redirect-msg">Redirigiendo al inicio de sesión...</p>
            <Link to="/login" className="btn-login-manual">
              Ir al Login
            </Link>
          </>
        )}

        {estado === 'error' && (
          <>
            <div className="verificar-icono error">
              <XCircle size={64} />
            </div>
            <h1>Error al verificar</h1>
            <p>{mensaje}</p>
            <div className="verificar-acciones">
              <Link to="/registro" className="btn-registro">
                Registrarse de nuevo
              </Link>
              <Link to="/login" className="btn-login">
                Ir al Login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VerificarEmail;