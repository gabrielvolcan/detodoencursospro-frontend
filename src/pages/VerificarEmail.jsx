import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import '../styles/publico.css';

const VerificarEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [estado, setEstado] = useState('verificando'); // verificando, exito, error
  const [mensaje, setMensaje] = useState('');

  useEffect(() => { verificarEmail(); }, [token]);

  const verificarEmail = async () => {
    try {
      const { data } = await authAPI.verificarEmail(token);
      setEstado('exito');
      setMensaje(data.mensaje || 'Email verificado exitosamente');
      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      setEstado('error');
      setMensaje(error.response?.data?.error || 'Token inválido o expirado');
    }
  };

  return (
    <div className="pub">
      <section className="auth">
        <div className="auth-bg"></div>
        <div className="auth-card tc">
          {estado === 'verificando' && (
            <>
              <div className="auth-ic"><Loader className="ic ic-lg spin" /></div>
              <h1 className="h2">Verificando tu email…</h1>
              <p className="muted" style={{ marginTop: 10 }}>Por favor espera un momento</p>
            </>
          )}

          {estado === 'exito' && (
            <>
              <div className="auth-ic"><CheckCircle className="ic ic-lg" /></div>
              <h1 className="h2">¡Email verificado!</h1>
              <p className="muted" style={{ margin: '10px 0 6px' }}>{mensaje}</p>
              <p className="muted sm" style={{ marginBottom: 22 }}>Redirigiendo al inicio de sesión…</p>
              <Link to="/login" className="btn btnp btn-lg">Ir al Login</Link>
            </>
          )}

          {estado === 'error' && (
            <>
              <div className="auth-ic" style={{ background: 'rgba(239,68,68,.12)', color: '#f56b6b' }}><XCircle className="ic ic-lg" /></div>
              <h1 className="h2">Error al verificar</h1>
              <p className="muted" style={{ margin: '10px 0 22px' }}>{mensaje}</p>
              <div className="fx ac jc gap12 wrap">
                <Link to="/registro" className="btn btno btn-lg">Registrarse de nuevo</Link>
                <Link to="/login" className="btn btnp btn-lg">Ir al Login</Link>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default VerificarEmail;
