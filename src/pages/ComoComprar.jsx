import { useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import '../styles/publico.css';

const PASOS = [
  { n: '01', t: 'Entrá a la página', d: 'Ingresá a detodoencursos.com desde tu celular o computadora.', img: '/tutorial/01-inicio.png' },
  { n: '02', t: 'Elegí tu curso o libro', d: 'Buscá lo que querés aprender y tocá "Comprar Ahora".', img: '/tutorial/02-detalle-producto.png' },
  { n: '03', t: 'Creá tu cuenta', d: 'Completá tus datos y una contraseña segura. Es gratis y toma menos de un minuto.', img: '/tutorial/04-registro-completo.png' },
  { n: '04', t: 'Verificá tu email', d: 'Te llega un correo para activar tu cuenta. Abrilo y tocá el enlace. Si no lo ves, revisá la carpeta de spam.', icon: Mail },
  { n: '05', t: 'Iniciá sesión', d: 'Volvé a la página e ingresá con tu email y contraseña.', img: '/tutorial/05-login.png' },
  { n: '06', t: 'Revisá tu carrito', d: 'Vas a ver lo que elegiste y el total. Tocá "Finalizar compra".', img: '/tutorial/06-carrito.png' },
  { n: '07', t: 'Confirmá tu compra', d: 'Revisá el resumen del pedido y continuá al pago.', img: '/tutorial/07-checkout-resumen.png' },
  { n: '08', t: 'Pagá con el método de tu país', d: 'Elegí tu método de pago. Te mostramos los datos de la cuenta (podés tocar "Copiar"). Hacé la transferencia por el monto exacto y volvé. Después: "Ya realicé el pago".', img: '/tutorial/08-checkout-metodo.png' },
  { n: '09', t: 'Subí tu comprobante', d: 'Tomale una foto o captura a tu comprobante, subila y tocá "Confirmar compra".', img: '/tutorial/10-comprobante-cargado.png' },
  { n: '10', t: '¡Listo!', d: 'Recibimos tu comprobante. Verificamos el pago y te habilitamos el acceso en 24-48 horas. Te avisamos por email y ya podés ver tu curso o leer tu libro.', img: '/tutorial/11-confirmacion.png' },
];

const ComoComprar = () => {
  const navigate = useNavigate();
  return (
    <div className="pub">
      <div className="pagehead"><div className="hero-bg"></div><div className="shell">
        <h1 className="h1">Cómo comprar</h1>
        <p className="lead" style={{ marginTop: 12 }}>Registrate y pagá en minutos. Te lo mostramos paso a paso.</p>
      </div></div>

      <section className="sec" style={{ paddingTop: 40 }}>
        <div className="shell" style={{ maxWidth: 980 }}>
          {PASOS.map((p, i) => (
            <div className={`tut-step ${i % 2 === 1 ? 'rev' : ''}`} key={p.n}>
              <div className="tut-phone">
                {p.img ? (
                  <div className="tut-screen"><img src={p.img} alt={`Paso ${p.n}: ${p.t}`} loading="lazy" /></div>
                ) : (
                  <div className="tut-screen tut-icon"><p.icon className="ic ic-lg" /></div>
                )}
              </div>
              <div className="tut-info">
                <span className="tut-num">{p.n}</span>
                <h2 className="h2" style={{ margin: '10px 0 10px' }}>{p.t}</h2>
                <p className="muted" style={{ lineHeight: 1.6, margin: 0 }}>{p.d}</p>
              </div>
            </div>
          ))}

          <div className="card" style={{ padding: 22, marginTop: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
            <ShieldCheck className="ic ic-lg green" />
            <p className="sm" style={{ margin: 0 }}>
              ¿Dudas en algún paso? Escribinos a <a className="green fw7" href="mailto:contacto@detodoencursos.com">contacto@detodoencursos.com</a> o usá el botón de ayuda 💬.
            </p>
          </div>

          <div className="cta-band" style={{ marginTop: 40, borderRadius: 20 }}>
            <div className="shell" style={{ maxWidth: 620 }}>
              <h2 className="h2">¿Listo para empezar?</h2>
              <p className="muted" style={{ margin: '12px 0 26px' }}>Elegí tu curso o libro y seguí estos pasos.</p>
              <div className="fx ac jc gap12 wrap">
                <button className="btn btnp btn-lg" onClick={() => navigate('/cursos')}>Ver Cursos<ArrowRight className="ic" /></button>
                <button className="btn btno btn-lg" onClick={() => navigate('/productos')}>Ver Productos</button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ComoComprar;
