import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { authAPI } from '../services/api';
import '../styles/publico.css';

const Reqi = ({ ok, children }) => (
  <span className="mi sm" style={{ color: ok ? '#22e08a' : '#84858c' }}>
    {ok ? <CheckCircle className="ic ic-s" /> : <AlertCircle className="ic ic-s" />}{children}
  </span>
);

const RestablecerContraseña = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: '', confirmarPassword: '' });
  const [verPass, setVerPass] = useState(false);
  const [verConf, setVerConf] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [req, setReq] = useState({ longitud: false, mayuscula: false, numero: false, especial: false });

  useEffect(() => {
    const p = form.password;
    setReq({
      longitud: p.length >= 8,
      mayuscula: /[A-Z]/.test(p),
      numero: /[0-9]/.test(p),
      especial: /[!@#$%^&*(),.?":{}|<>]/.test(p),
    });
  }, [form.password]);

  const set = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setError(''); };
  const cumplidos = Object.values(req).filter(Boolean).length;
  const fuerza = ['', 'Débil', 'Media', 'Buena', 'Fuerte'][cumplidos];
  const fuerzaColor = ['#84858c', '#ef4444', '#f5c451', '#22e08a', '#16e08a'][cumplidos];

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmarPassword) return setError('Las contraseñas no coinciden');
    if (cumplidos < 4) return setError('La contraseña no cumple todos los requisitos de seguridad');

    setCargando(true);
    try {
      await authAPI.restablecerContrasena(token, form.password);
      setExito(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al restablecer la contraseña. El enlace puede haber expirado.');
    } finally {
      setCargando(false);
    }
  };

  if (exito) {
    return (
      <div className="pub">
        <section className="auth">
          <div className="auth-bg"></div>
          <div className="auth-card tc">
            <div className="auth-ic"><CheckCircle className="ic ic-lg" /></div>
            <h1 className="h2">¡Contraseña Restablecida!</h1>
            <p className="muted" style={{ margin: '10px 0 22px' }}>Tu contraseña fue actualizada. Redirigiendo al login…</p>
            <button className="btn btnp btn-lg" onClick={() => navigate('/login')}>Ir al Login Ahora</button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="pub">
      <section className="auth">
        <div className="auth-bg"></div>
        <form className="auth-card" onSubmit={submit}>
          <div className="auth-ic"><Lock className="ic ic-lg" /></div>
          <h1 className="h2 tc">Nueva Contraseña</h1>
          <p className="muted tc" style={{ margin: '8px 0 30px' }}>Crea una contraseña segura para tu cuenta</p>

          {error && <div className="alert alert-err">{error}</div>}

          <label className="field">
            <span className="lbl"><Lock className="ic ic-s" />Nueva Contraseña</span>
            <span className="pass-wrap">
              <input className="inp" type={verPass ? 'text' : 'password'} name="password" value={form.password} onChange={set} required placeholder="••••••••" autoComplete="new-password" />
              <button className="pass-eye" type="button" onClick={() => setVerPass(!verPass)} tabIndex={-1}>{verPass ? <EyeOff className="ic ic-s" /> : <Eye className="ic ic-s" />}</button>
            </span>
            {form.password && (
              <>
                <div className="prog" style={{ marginTop: 10 }}><div className="prog-bar" style={{ width: `${(cumplidos / 4) * 100}%`, background: fuerzaColor }}></div></div>
                <span className="xs" style={{ color: fuerzaColor, fontWeight: 700, marginTop: 6, display: 'inline-block' }}>{fuerza}</span>
                <div className="fx wrap gap8" style={{ marginTop: 8 }}>
                  <Reqi ok={req.longitud}>8+ caracteres</Reqi>
                  <Reqi ok={req.mayuscula}>Mayúscula</Reqi>
                  <Reqi ok={req.numero}>Número</Reqi>
                  <Reqi ok={req.especial}>Especial (!@#$)</Reqi>
                </div>
              </>
            )}
          </label>

          <label className="field" style={{ marginBottom: 26 }}>
            <span className="lbl"><Lock className="ic ic-s" />Confirmar Contraseña</span>
            <span className="pass-wrap">
              <input className="inp" type={verConf ? 'text' : 'password'} name="confirmarPassword" value={form.confirmarPassword} onChange={set} required placeholder="••••••••" autoComplete="new-password" />
              <button className="pass-eye" type="button" onClick={() => setVerConf(!verConf)} tabIndex={-1}>{verConf ? <EyeOff className="ic ic-s" /> : <Eye className="ic ic-s" />}</button>
            </span>
            {form.confirmarPassword && form.password !== form.confirmarPassword && (
              <span className="mi sm" style={{ color: '#f56b6b', marginTop: 8 }}><AlertCircle className="ic ic-s" />Las contraseñas no coinciden</span>
            )}
          </label>

          <button type="submit" className="btn btnp btn-block btn-lg" disabled={cargando}>{cargando ? 'Restableciendo...' : 'Restablecer Contraseña'}</button>
        </form>
      </section>
    </div>
  );
};

export default RestablecerContraseña;
