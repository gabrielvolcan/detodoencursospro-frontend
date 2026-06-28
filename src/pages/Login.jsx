import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { LogIn, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import '../styles/publico.css';

const Login = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { iniciarSesion } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [verPass, setVerPass] = useState(false);

  const set = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setError(''); };

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setCargando(true);
    const r = await iniciarSesion(form.email, form.password);
    if (r.exito) {
      const redirect = searchParams.get('redirect') || '/';
      navigate(redirect.startsWith('/') ? redirect : '/');
    } else {
      setError(r.error);
    }
    setCargando(false);
  };

  return (
    <div className="pub">
      <section className="auth">
        <div className="auth-bg"></div>
        <form className="auth-card" onSubmit={submit}>
          <div className="auth-ic"><LogIn className="ic ic-lg" /></div>
          <h1 className="h2 tc">Iniciar Sesión</h1>
          <p className="muted tc" style={{ margin: '8px 0 30px' }}>Accede a tus cursos y continúa aprendiendo</p>

          {error && <div className="alert alert-err">{error}</div>}

          <label className="field">
            <span className="lbl"><Mail className="ic ic-s" />Email</span>
            <input className="inp" type="email" name="email" value={form.email} onChange={set} required placeholder="tu@email.com" autoComplete="email" />
          </label>
          <label className="field" style={{ marginBottom: 8 }}>
            <span className="lbl"><Lock className="ic ic-s" />Contraseña</span>
            <span className="pass-wrap">
              <input className="inp" type={verPass ? 'text' : 'password'} name="password" value={form.password} onChange={set} required placeholder="••••••••" autoComplete="current-password" />
              <button className="pass-eye" type="button" onClick={() => setVerPass(!verPass)} tabIndex={-1}>
                {verPass ? <EyeOff className="ic ic-s" /> : <Eye className="ic ic-s" />}
              </button>
            </span>
          </label>
          <div className="tc" style={{ margin: '0 0 24px' }}>
            <button type="button" className="green sm fw7 pointer" style={{ background: 'none', border: 0 }} onClick={() => navigate('/recuperar-contrasena')}>¿Olvidaste tu contraseña?</button>
          </div>

          <button type="submit" className="btn btnp btn-block btn-lg" disabled={cargando}>
            {cargando ? 'Iniciando...' : 'Iniciar Sesión'}
          </button>

          <div className="rule" style={{ margin: '24px 0' }}></div>
          <p className="tc sm muted" style={{ margin: 0 }}>
            ¿No tienes cuenta? <button type="button" className="green fw7 pointer" style={{ background: 'none', border: 0 }} onClick={() => navigate('/registro')}>Regístrate aquí</button>
          </p>
        </form>
      </section>
    </div>
  );
};

export default Login;
