import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { authAPI } from '../services/api';
import '../styles/publico.css';

const RecuperarContraseña = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setCargando(true);
    try {
      await authAPI.recuperarContrasena(email);
      setEnviado(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al enviar el email. Intenta de nuevo.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="pub">
      <section className="auth">
        <div className="auth-bg"></div>
        {enviado ? (
          <div className="auth-card tc">
            <div className="auth-ic"><CheckCircle className="ic ic-lg" /></div>
            <h1 className="h2">Revisa tu Email</h1>
            <p className="muted" style={{ margin: '10px 0 20px' }}>Te enviamos instrucciones para recuperar tu contraseña a:</p>
            <p className="green fw7" style={{ marginBottom: 22 }}>{email}</p>
            <div className="note" style={{ textAlign: 'left', marginBottom: 24 }}>
              El enlace expira en 1 hora · Revisa tu carpeta de spam si no lo encuentras · Solo puedes usarlo una vez.
            </div>
            <button className="btn btnp btn-lg" onClick={() => navigate('/login')}><ArrowLeft className="ic ic-s" />Volver al Login</button>
          </div>
        ) : (
          <form className="auth-card" onSubmit={submit}>
            <div className="auth-ic"><Mail className="ic ic-lg" /></div>
            <h1 className="h2 tc">Recuperar Contraseña</h1>
            <p className="muted tc" style={{ margin: '8px 0 30px' }}>Ingresa tu email y te enviaremos instrucciones</p>

            {error && <div className="alert alert-err">{error}</div>}

            <label className="field" style={{ marginBottom: 26 }}>
              <span className="lbl"><Mail className="ic ic-s" />Email</span>
              <input className="inp" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="tu@email.com" autoComplete="email" />
            </label>
            <button type="submit" className="btn btnp btn-block btn-lg" disabled={cargando}>{cargando ? 'Enviando...' : 'Enviar Instrucciones'}</button>
            <div className="rule" style={{ margin: '24px 0' }}></div>
            <div className="tc">
              <button type="button" className="green fw7 pointer fx ac jc gap8" style={{ background: 'none', border: 0, margin: '0 auto' }} onClick={() => navigate('/login')}><ArrowLeft className="ic ic-s" />Volver al login</button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
};

export default RecuperarContraseña;
