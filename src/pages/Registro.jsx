import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, Phone, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import '../styles/publico.css';

const Registro = () => {
  const navigate = useNavigate();
  const { registrarse } = useAuth();
  const [form, setForm] = useState({ nombre: '', email: '', telefono: '', password: '', confirmarPassword: '' });
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [verPass, setVerPass] = useState(false);
  const [verConf, setVerConf] = useState(false);
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
    if (!req.longitud) return setError('La contraseña debe tener al menos 8 caracteres');
    if (!req.mayuscula) return setError('La contraseña debe contener al menos una mayúscula');
    if (!req.numero) return setError('La contraseña debe contener al menos un número');
    if (!req.especial) return setError('La contraseña debe contener al menos un carácter especial (!@#$%^&*)');

    setCargando(true);
    const cursoGratuitoId = localStorage.getItem('cursoGratuitoId');
    const { confirmarPassword, ...datos } = form;
    const r = await registrarse({ ...datos, cursoGratuitoId: cursoGratuitoId || undefined });
    if (r.exito) {
      localStorage.removeItem('cursoGratuitoId');
      alert(cursoGratuitoId
        ? '🎉 ¡Registro exitoso! El curso gratuito se agregó a tu cuenta. Verifica tu email para activarla.'
        : '¡Registro exitoso! Verifica tu email para activar tu cuenta.');
      navigate('/login');
    } else {
      setError(r.error);
    }
    setCargando(false);
  };

  const Reqi = ({ ok, children }) => (
    <span className="mi sm" style={{ color: ok ? '#22e08a' : '#84858c' }}>
      {ok ? <CheckCircle className="ic ic-s" /> : <AlertCircle className="ic ic-s" />}{children}
    </span>
  );

  return (
    <div className="pub">
      <section className="auth">
        <div className="auth-bg"></div>
        <form className="auth-card" onSubmit={submit}>
          <div className="auth-ic"><UserPlus className="ic ic-lg" /></div>
          <h1 className="h2 tc">Crear Cuenta</h1>
          <p className="muted tc" style={{ margin: '8px 0 30px' }}>Únete y comienza a aprender hoy</p>

          {error && <div className="alert alert-err">{error}</div>}

          <label className="field">
            <span className="lbl"><User className="ic ic-s" />Nombre Completo</span>
            <input className="inp" name="nombre" value={form.nombre} onChange={set} required placeholder="Juan Pérez" autoComplete="name" />
          </label>
          <label className="field">
            <span className="lbl"><Mail className="ic ic-s" />Email</span>
            <input className="inp" type="email" name="email" value={form.email} onChange={set} required placeholder="tu@email.com" autoComplete="email" />
          </label>
          <label className="field">
            <span className="lbl"><Phone className="ic ic-s" />Teléfono (opcional)</span>
            <input className="inp" type="tel" name="telefono" value={form.telefono} onChange={set} placeholder="+54 11 1234-5678" autoComplete="tel" />
          </label>
          <label className="field">
            <span className="lbl"><Lock className="ic ic-s" />Contraseña</span>
            <span className="pass-wrap">
              <input className="inp" type={verPass ? 'text' : 'password'} name="password" value={form.password} onChange={set} required placeholder="••••••••" autoComplete="new-password" />
              <button className="pass-eye" type="button" onClick={() => setVerPass(!verPass)} tabIndex={-1}>{verPass ? <EyeOff className="ic ic-s" /> : <Eye className="ic ic-s" />}</button>
            </span>
            {form.password && (
              <>
                <div className="prog" style={{ marginTop: 10 }}><div className="prog-bar" style={{ width: `${(cumplidos / 4) * 100}%`, background: fuerzaColor }}></div></div>
                <div className="fx ac jb" style={{ marginTop: 6 }}>
                  <span className="xs" style={{ color: fuerzaColor, fontWeight: 700 }}>{fuerza}</span>
                </div>
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

          <button type="submit" className="btn btnp btn-block btn-lg" disabled={cargando}>{cargando ? 'Registrando...' : 'Crear Cuenta'}</button>
          <div className="rule" style={{ margin: '24px 0' }}></div>
          <p className="tc sm muted" style={{ margin: 0 }}>
            ¿Ya tienes cuenta? <button type="button" className="green fw7 pointer" style={{ background: 'none', border: 0 }} onClick={() => navigate('/login')}>Inicia sesión aquí</button>
          </p>
        </form>
      </section>
    </div>
  );
};

export default Registro;
