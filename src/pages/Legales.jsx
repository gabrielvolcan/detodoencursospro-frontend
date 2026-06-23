import { useEffect } from 'react';
import './Legales.css';

const ACTUALIZADO = 'Junio 2026';
const MARCA = 'Detodo en Cursos';
const SITIO = 'www.detodoencursos.com';
const EMAIL = 'contacto@detodoencursos.com';

const DOCS = {
  terminos: {
    titulo: 'Términos y Condiciones',
    intro: `Estos Términos y Condiciones (los "Términos") regulan el uso de ${MARCA} (${SITIO}) y la compra de cursos y productos digitales ofrecidos en la plataforma. Al crear una cuenta o realizar una compra, aceptás estos Términos en su totalidad.`,
    secciones: [
      { t: '1. Quiénes somos', p: [`${MARCA} es una plataforma que comercializa cursos online y productos digitales (libros, ebooks, plantillas, guías y recursos). En estos Términos, "nosotros" se refiere a ${MARCA} y "vos"/"el usuario" a quien utiliza la plataforma.`] },
      { t: '2. Cuenta de usuario', p: [
        'Para comprar y acceder a los contenidos necesitás crear una cuenta con datos veraces y verificar tu correo electrónico.',
        'Sos responsable de mantener la confidencialidad de tu contraseña y de toda la actividad realizada desde tu cuenta. La cuenta es personal e intransferible.'
      ] },
      { t: '3. Compras y pagos', p: [
        'Las compras se realizan mediante pago manual (transferencia bancaria, Yape, Plin, MercadoPago, Pago Móvil u otros medios según tu país). Tras realizar el pago, debés subir el comprobante en la plataforma.',
        'El acceso al curso o producto se habilita una vez que verificamos y aprobamos el comprobante. Los precios se muestran en la moneda de tu país y pueden modificarse en cualquier momento sin afectar compras ya aprobadas.'
      ] },
      { t: '4. Entrega y acceso al contenido', p: [
        'Los cursos se acceden online desde tu cuenta. Los productos digitales pueden descargarse o leerse dentro de la plataforma (modo lectura), según el caso.',
        'El acceso se otorga de forma inmediata luego de la aprobación del pago. Es tu responsabilidad contar con los dispositivos y la conexión necesarios para acceder al contenido.'
      ] },
      { t: '5. Propiedad intelectual y licencia de uso', p: [
        `Todo el contenido (cursos, libros, videos, textos, materiales y la propia plataforma) es propiedad de ${MARCA} o de sus licenciantes y está protegido por las leyes de propiedad intelectual.`,
        'Al comprar, recibís una licencia personal, limitada, intransferible y no exclusiva para acceder al contenido para tu uso individual.'
      ], lista: [
        'Está prohibido copiar, reproducir, redistribuir, revender, publicar o compartir el contenido, total o parcialmente.',
        'Está prohibido compartir tu cuenta o credenciales con terceros.',
        'Está prohibido eludir, desactivar o vulnerar las medidas de protección (marcas de agua, lector seguro, etc.).'
      ], pFin: ['El incumplimiento de esta cláusula puede derivar en la suspensión inmediata de la cuenta sin reembolso, además de las acciones legales que correspondan.'] },
      { t: '6. Conducta del usuario', p: ['Te comprometés a usar la plataforma de buena fe, sin realizar fraudes, abusos, ingeniería inversa, ni acciones que afecten el funcionamiento del servicio o los derechos de otros usuarios.'] },
      { t: '7. Certificados', p: ['Cuando un curso lo contemple, se emite un certificado de finalización al completar el contenido. El certificado acredita la realización del curso en la plataforma; su validez ante terceros depende del criterio de cada institución u organización.'] },
      { t: '8. Disponibilidad del servicio', p: ['Procuramos mantener la plataforma disponible de forma continua, pero pueden existir interrupciones por mantenimiento, fallas técnicas o causas ajenas a nosotros. No garantizamos disponibilidad ininterrumpida.'] },
      { t: '9. Limitación de responsabilidad', p: ['El contenido se ofrece con fines educativos e informativos. No garantizamos resultados específicos derivados de su uso. En la máxima medida permitida por la ley, no seremos responsables por daños indirectos o incidentales relacionados con el uso de la plataforma.'] },
      { t: '10. Modificaciones', p: ['Podemos actualizar estos Términos en cualquier momento. La versión vigente será la publicada en esta página. El uso continuado de la plataforma implica la aceptación de los cambios.'] },
      { t: '11. Ley aplicable', p: ['Estos Términos se rigen por las leyes del país de domicilio de la empresa [COMPLETAR JURISDICCIÓN]. Cualquier controversia se someterá a los tribunales competentes de dicha jurisdicción.'] },
      { t: '12. Contacto', p: [`Ante cualquier duda sobre estos Términos, escribinos a ${EMAIL}.`] }
    ]
  },

  privacidad: {
    titulo: 'Política de Privacidad',
    intro: `En ${MARCA} respetamos tu privacidad. Esta Política explica qué datos recopilamos, con qué fines y cómo los protegemos.`,
    secciones: [
      { t: '1. Responsable del tratamiento', p: [`${MARCA} (${SITIO}) es responsable del tratamiento de los datos personales que nos proporcionás. Contacto: ${EMAIL}.`] },
      { t: '2. Datos que recopilamos', lista: [
        'Datos de registro: nombre, correo electrónico, teléfono y país.',
        'Datos de compra: comprobantes de pago e información de la orden.',
        'Datos de uso: cursos/productos adquiridos, progreso, certificados y actividad dentro de la plataforma.',
        'Datos técnicos: dirección IP, tipo de dispositivo y navegador (a través de cookies y tecnologías similares).'
      ] },
      { t: '3. Para qué usamos tus datos', lista: [
        'Crear y gestionar tu cuenta.',
        'Procesar tus compras y verificar los pagos.',
        'Darte acceso a los cursos y productos, y emitir certificados.',
        'Brindarte soporte y enviarte comunicaciones sobre tu cuenta o tus compras.',
        'Mejorar la plataforma y, si corresponde, medir y optimizar campañas publicitarias.',
        'Cumplir con obligaciones legales.'
      ] },
      { t: '4. Con quién compartimos datos', p: [
        'No vendemos tus datos personales. Solo los compartimos con proveedores que nos ayudan a operar el servicio, bajo obligaciones de confidencialidad:'
      ], lista: [
        'Proveedor de correo electrónico (para enviarte verificaciones y notificaciones).',
        'Proveedores de hosting e infraestructura.',
        'Procesadores de pago, cuando corresponda.',
        'Herramientas de analítica y publicidad (por ejemplo, Meta Pixel) para medir el uso y el rendimiento de campañas.'
      ] },
      { t: '5. Cookies y tecnologías similares', p: ['Usamos cookies y almacenamiento local para mantener tu sesión iniciada y para fines de medición y publicidad (como el píxel de Meta). Podés gestionar las cookies desde la configuración de tu navegador.'] },
      { t: '6. Conservación de los datos', p: ['Conservamos tus datos mientras tu cuenta esté activa y durante el tiempo necesario para cumplir con fines legales, contables o de resolución de disputas. Luego, los eliminamos o anonimizamos.'] },
      { t: '7. Seguridad', p: ['Aplicamos medidas razonables para proteger tu información: las contraseñas se almacenan cifradas (hash), la conexión es segura (HTTPS) y los comprobantes se sirven solo a usuarios autorizados. Ningún sistema es 100% infalible, pero trabajamos para minimizar los riesgos.'] },
      { t: '8. Tus derechos', p: [`Podés solicitar acceder, rectificar o eliminar tus datos personales, así como retirar tu consentimiento, escribiéndonos a ${EMAIL}. Atenderemos tu solicitud conforme a la normativa aplicable.`] },
      { t: '9. Menores de edad', p: ['La plataforma está dirigida a personas mayores de edad. Si sos menor, debés contar con la autorización de tu madre, padre o tutor.'] },
      { t: '10. Cambios en esta política', p: ['Podemos actualizar esta Política. La versión vigente será la publicada en esta página, con su fecha de última actualización.'] },
      { t: '11. Contacto', p: [`Para cualquier consulta sobre privacidad, escribinos a ${EMAIL}.`] }
    ]
  },

  reembolsos: {
    titulo: 'Política de Reembolso',
    intro: `Esta Política aplica a las compras de cursos y productos digitales realizadas en ${MARCA}. Por tratarse de contenido digital de acceso inmediato, te pedimos leerla con atención antes de comprar.`,
    secciones: [
      { t: '1. Naturaleza de los productos', p: ['Todos nuestros cursos y productos son digitales y se entregan/habilitan de forma inmediata una vez aprobado el pago. Por su naturaleza, una vez otorgado el acceso o realizada la descarga, el contenido no puede "devolverse".'] },
      { t: '2. Regla general', p: ['Como norma general, no se realizan reembolsos sobre contenido digital al que ya se otorgó acceso o que ya fue descargado, salvo en los casos de excepción que se indican a continuación.'] },
      { t: '3. Casos en los que sí evaluamos un reembolso', lista: [
        'Cobro duplicado o por un monto erróneo atribuible a un error nuestro.',
        'Imposibilidad de acceder al contenido por una falla técnica de la plataforma que no podamos resolver en un plazo razonable.',
        'Que el contenido recibido sea sustancialmente distinto al descrito al momento de la compra.'
      ] },
      { t: '4. Pagos manuales', p: [
        'Los pagos se realizan de forma manual a las cuentas indicadas en el checkout. Si subiste un comprobante y tu pago no fue aprobado, no se habilita el acceso y no corresponde reembolso de nuestra parte (el dinero no fue cobrado por la plataforma).',
        'Verificá siempre que estás transfiriendo a la cuenta y por el monto exacto indicados. No nos responsabilizamos por pagos realizados a cuentas distintas a las informadas.'
      ] },
      { t: '5. Cómo solicitar una revisión', p: [
        `Si considerás que tu caso encuadra en las excepciones, escribinos a ${EMAIL} dentro de los 7 días de la compra, indicando: número de orden, correo de tu cuenta y el motivo (con captura del comprobante si corresponde).`,
        'Analizaremos tu solicitud y te responderemos a la brevedad. De aprobarse, el reembolso se realizará por el mismo medio de pago, cuando sea posible.'
      ] },
      { t: '6. Contacto', p: [`Para cualquier consulta sobre reembolsos, escribinos a ${EMAIL}.`] }
    ]
  }
};

const Legales = ({ documento }) => {
  const doc = DOCS[documento] || DOCS.terminos;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [documento]);

  return (
    <div className="legales-page">
      <div className="legales-container">
        <h1>{doc.titulo}</h1>
        <p className="legales-fecha">Última actualización: {ACTUALIZADO}</p>
        {doc.intro && <p className="legales-intro">{doc.intro}</p>}

        {doc.secciones.map((sec, i) => (
          <section key={i} className="legales-seccion">
            <h2>{sec.t}</h2>
            {sec.p && sec.p.map((parrafo, j) => <p key={j}>{parrafo}</p>)}
            {sec.lista && (
              <ul>
                {sec.lista.map((item, k) => <li key={k}>{item}</li>)}
              </ul>
            )}
            {sec.pFin && sec.pFin.map((parrafo, j) => <p key={`f${j}`}>{parrafo}</p>)}
          </section>
        ))}

        <p className="legales-aviso">
          Este documento es un marco general informativo y no constituye asesoramiento legal.
          Te recomendamos revisarlo con un profesional y completar los datos de tu empresa y jurisdicción.
        </p>
      </div>
    </div>
  );
};

export default Legales;
