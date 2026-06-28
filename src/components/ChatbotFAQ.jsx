import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Mail } from 'lucide-react';
import { cursosAPI, productosAPI } from '../services/api';
import './ChatbotFAQ.css';

// Convierte **texto** en negrita real al renderizar una línea del chat.
const renderLinea = (linea) => linea.split(/(\*\*[^*]+\*\*)/g).map((seg, i) => (
  seg.startsWith('**') && seg.endsWith('**')
    ? <strong key={i}>{seg.slice(2, -2)}</strong>
    : seg
));

const ChatbotFAQ = () => {
  const [abierto, setAbierto] = useState(false);
  // Catálogo real desde la API: el chatbot responde con lo que hay en la plataforma.
  const [catalogo, setCatalogo] = useState({ cursos: [], productos: [], cargado: false });

  useEffect(() => {
    let activo = true;
    Promise.allSettled([cursosAPI.obtenerTodos(), productosAPI.obtenerTodos()])
      .then(([rc, rp]) => {
        if (!activo) return;
        const cursos = rc.status === 'fulfilled'
          ? (Array.isArray(rc.value.data) ? rc.value.data : (rc.value.data?.cursos || [])).filter((c) => c && c._id && c.activo !== false)
          : [];
        const pdata = rp.status === 'fulfilled' ? rp.value.data : [];
        const productos = (Array.isArray(pdata) ? pdata : (pdata?.productos || pdata?.data || [])).filter((p) => p && p._id);
        setCatalogo({ cursos, productos, cargado: true });
      });
    return () => { activo = false; };
  }, []);

  // Genera la respuesta del catálogo a partir de los datos reales cargados.
  const respuestaCatalogo = () => {
    const { cursos, productos } = catalogo;
    if (!cursos.length && !productos.length) {
      return '📚 **Catálogo:**\n\nTenemos cursos profesionales y productos digitales (libros y ebooks). 👉 Mirá todo en las secciones **Cursos** y **Productos** del menú.';
    }
    const cats = [...new Set(cursos.map((c) => c.categoria).filter(Boolean))];
    const titulos = cursos.slice(0, 6).map((c) => `• ${c.titulo}`).join('\n');
    let r = `📚 **Nuestro catálogo (${cursos.length} ${cursos.length === 1 ? 'curso' : 'cursos'}):**\n\n`;
    if (cats.length) r += `Áreas disponibles: ${cats.join(', ')}.\n\n`;
    if (titulos) r += `Algunos cursos:\n${titulos}\n\n`;
    if (productos.length) r += `También ${productos.length} ${productos.length === 1 ? 'producto digital' : 'productos digitales'} (libros y ebooks).\n\n`;
    r += '👉 Mirá todo en las secciones **Cursos** y **Productos**. Cada curso incluye videos HD, material descargable y certificado.';
    return r;
  };
  const [mensajes, setMensajes] = useState([
    {
      role: 'assistant',
      content: '¡Hola! 👋 Soy tu asistente virtual. Puedo ayudarte con información sobre nuestros cursos, pagos, certificados y más. ¿En qué puedo ayudarte?',
      timestamp: new Date()
    }
  ]);
  const [inputMensaje, setInputMensaje] = useState('');
  const mensajesEndRef = useRef(null);

  // Base de conocimiento
  const FAQ_BASE = {
    // Compras y pagos
    'comprar|compra|pagar|pago|adquirir': {
      respuesta: '💳 **¿Cómo comprar un curso?**\n\n1. Selecciona el curso que te interesa\n2. Agrégalo al carrito\n3. Ve a checkout y elige tu país\n4. Selecciona tu método de pago (transferencia, Yape, Plin, MercadoPago)\n5. Realiza el pago y sube el comprobante\n6. ¡Te aprobamos en menos de 24 horas!\n\nTodos nuestros cursos aceptan los métodos de pago de tu país 🌎'
    },
    'precio|costo|cuanto|valor|moneda': {
      respuesta: '💰 **Precios y monedas:**\n\nNuestros precios se ajustan automáticamente según tu país:\n\n🇵🇪 Perú: Soles (PEN)\n🇨🇱 Chile: Pesos chilenos (CLP)\n🇦🇷 Argentina: Pesos argentinos (ARS)\n🇺🇾 Uruguay: Pesos uruguayos (UYU)\n🇻🇪 Venezuela: Bolívares (VES)\n\nPuedes ver el precio en tu moneda seleccionando tu país en el menú superior.'
    },
    'método|metodo|forma de pago|como pago': {
      respuesta: '💳 **Métodos de pago disponibles:**\n\n🇵🇪 **Perú:** Yape, Plin, Transferencia bancaria\n🇨🇱 **Chile:** Transferencia, MercadoPago\n🇦🇷 **Argentina:** Transferencia, MercadoPago\n🇺🇾 **Uruguay:** Transferencia, MercadoPago\n🇻🇪 **Venezuela:** Pago móvil, Transferencia\n\nTodos los métodos requieren subir comprobante para aprobar tu compra.'
    },
    'aprobar|aprobacion|verificar|cuanto tarda|demora': {
      respuesta: '⏰ **Tiempo de aprobación:**\n\nRevisamos y aprobamos compras en **menos de 24 horas** (generalmente en 2-6 horas).\n\n✅ Una vez aprobado, recibirás:\n- Email de confirmación\n- Acceso inmediato a tus cursos\n- Certificado al completar\n\n📧 Si tienes dudas, escríbenos a: contacto@detodoencursos.com'
    },

    // Acceso y certificados
    'acceso|tiempo|duracion|caducidad|expira': {
      respuesta: '⏰ **Acceso a los cursos:**\n\n✅ **Acceso de por vida**\n✅ Actualizaciones gratis incluidas\n✅ Sin límite de reproducciones\n✅ Disponible 24/7 desde cualquier dispositivo\n\nUna vez que compras un curso, es tuyo para siempre 🎓'
    },
    'certificado|diploma|constancia|titulo': {
      respuesta: '🎓 **Certificado digital:**\n\n✅ Recibes certificado al completar el curso\n✅ Formato digital descargable (PDF)\n✅ Con tu nombre y fecha de finalización\n✅ Válido para CV y LinkedIn\n\nEl certificado se genera automáticamente cuando completas el 100% del curso.'
    },
    'dispositivo|celular|movil|tablet|computadora': {
      respuesta: '📱 **Compatibilidad:**\n\nPuedes acceder desde:\n\n✅ Computadora (Windows, Mac, Linux)\n✅ Tablet (iPad, Android)\n✅ Celular (iOS, Android)\n✅ Cualquier navegador moderno\n\nTu progreso se sincroniza automáticamente entre todos tus dispositivos.'
    },

    // Contenido y soporte
    'soporte|ayuda|contacto|problema|error': {
      respuesta: '💬 **Soporte y contacto:**\n\n📧 Email: contacto@detodoencursos.com\n⏰ Respondemos en menos de 24 horas\n🌎 Soporte en toda América Latina\n\n¿Tienes un problema específico? Envíanos un email con:\n- Tu nombre\n- Curso afectado\n- Descripción del problema\n\n¡Te ayudaremos lo antes posible!'
    },
    'requisito|necesito|previo': {
      respuesta: '📝 **Requisitos:**\n\nPara la mayoría de nuestros cursos:\n\n✅ No se requiere experiencia previa\n✅ Ganas de aprender\n✅ Conexión a internet\n✅ Cualquier dispositivo (PC, tablet, móvil)\n\nAlgunos cursos avanzados pueden requerir conocimientos básicos previos (se indica en la descripción del curso).'
    },

    // Cuenta y registro
    'cuenta|registro|crear|registrar': {
      respuesta: '👤 **Crear cuenta:**\n\n1. Click en "Registrarse"\n2. Completa tus datos\n3. Verifica tu email (revisa spam)\n4. ¡Listo! Ya puedes comprar cursos\n\nTu cuenta es **100% gratis** y te da acceso a:\n- Historial de compras\n- Progreso de cursos\n- Certificados descargables'
    },
    'login|iniciar|entrar|contraseña|password': {
      respuesta: '🔐 **Iniciar sesión:**\n\n¿Problemas para entrar?\n\n1. Verifica tu email en la bandeja de spam\n2. Si olvidaste tu contraseña, usa "¿Olvidaste tu contraseña?"\n3. Recibirás un email para restablecerla\n\n⚠️ Debes verificar tu email antes de poder iniciar sesión por primera vez.'
    },

    // Reembolsos y garantías
    'reembolso|devolucion|garantia': {
      respuesta: '💯 **Política de satisfacción:**\n\nSi un curso no cumple tus expectativas:\n\n✅ Contáctanos en las primeras 48 horas\n✅ Explícanos el motivo\n✅ Evaluaremos tu caso\n\n📧 Escríbenos a: contacto@detodoencursos.com\n\nQueremos que estés 100% satisfecho con tu compra.'
    }
  };

  const scrollToBottom = () => {
    mensajesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [mensajes]);

  const buscarRespuesta = (mensaje) => {
    const mensajeLower = mensaje.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    // Cat\u00e1logo en vivo: responde con los cursos/productos reales de la plataforma
    const catalogoKeywords = ['curso', 'cursos', 'que ense\u00f1an', 'que ensenan', 'temas', 'catalogo', 'que hay', 'que ofrecen', 'categoria', 'categorias', 'libro', 'libros', 'ebook', 'producto', 'productos'];
    if (catalogoKeywords.some((k) => mensajeLower.includes(k))) {
      return respuestaCatalogo();
    }

    // Buscar en la base de conocimiento
    for (const [keywords, data] of Object.entries(FAQ_BASE)) {
      const patterns = keywords.split('|');
      if (patterns.some(pattern => mensajeLower.includes(pattern))) {
        return data.respuesta;
      }
    }

    // Respuesta por defecto
    return '🤔 No encontré una respuesta específica para eso, pero puedo ayudarte con:\n\n• Cómo comprar cursos\n• Métodos de pago\n• Certificados\n• Acceso y dispositivos\n• Soporte técnico\n\n¿O prefieres contactar directamente?\n📧 contacto@detodoencursos.com';
  };

  const enviarMensaje = (e) => {
    e.preventDefault();
    
    if (!inputMensaje.trim()) return;

    const mensajeUsuario = inputMensaje.trim();
    setInputMensaje('');

    // Agregar mensaje del usuario
    const nuevoMensajeUsuario = {
      role: 'user',
      content: mensajeUsuario,
      timestamp: new Date()
    };
    setMensajes(prev => [...prev, nuevoMensajeUsuario]);

    // Buscar respuesta
    setTimeout(() => {
      const respuesta = buscarRespuesta(mensajeUsuario);
      setMensajes(prev => [...prev, {
        role: 'assistant',
        content: respuesta,
        timestamp: new Date()
      }]);
    }, 500);
  };

  const sugerencias = [
    '¿Cómo compro un curso?',
    '¿Cuánto tiempo tengo acceso?',
    '¿Dan certificado?',
    'Métodos de pago',
    'Necesito ayuda'
  ];

  const usarSugerencia = (sugerencia) => {
    const nuevoMensaje = {
      role: 'user',
      content: sugerencia,
      timestamp: new Date()
    };
    setMensajes(prev => [...prev, nuevoMensaje]);

    setTimeout(() => {
      const respuesta = buscarRespuesta(sugerencia);
      setMensajes(prev => [...prev, {
        role: 'assistant',
        content: respuesta,
        timestamp: new Date()
      }]);
    }, 500);
  };

  return (
    <>
      {/* Botón flotante */}
      <button 
        className="chatbot-btn-flotante"
        onClick={() => setAbierto(!abierto)}
        aria-label="Asistente Virtual"
      >
        {abierto ? <X size={24} /> : <MessageCircle size={24} />}
        {!abierto && <span className="chatbot-badge">FAQ</span>}
      </button>

      {/* Ventana de chat */}
      {abierto && (
        <div className="chatbot-ventana">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <Bot size={24} />
              <div>
                <h3>Asistente Virtual</h3>
                <span className="chatbot-estado">Respuestas instantáneas</span>
              </div>
            </div>
            <button 
              onClick={() => setAbierto(false)}
              className="chatbot-cerrar"
            >
              <X size={20} />
            </button>
          </div>

          {/* Mensajes */}
          <div className="chatbot-mensajes">
            {mensajes.map((mensaje, index) => (
              <div 
                key={index}
                className={`chatbot-mensaje ${mensaje.role === 'user' ? 'usuario' : 'bot'}`}
              >
                <div className="chatbot-mensaje-icono">
                  {mensaje.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className="chatbot-mensaje-contenido">
                  {mensaje.content.split('\n').map((linea, i) => (
                    <p key={i}>{renderLinea(linea)}</p>
                  ))}
                </div>
              </div>
            ))}
            <div ref={mensajesEndRef} />
          </div>

          {/* Sugerencias */}
          {mensajes.length === 1 && (
            <div className="chatbot-sugerencias">
              <p className="chatbot-sugerencias-titulo">Preguntas frecuentes:</p>
              {sugerencias.map((sug, index) => (
                <button
                  key={index}
                  onClick={() => usarSugerencia(sug)}
                  className="chatbot-sugerencia-btn"
                >
                  {sug}
                </button>
              ))}
            </div>
          )}

          {/* Contacto directo */}
          <div className="chatbot-contacto">
            <Mail size={16} />
            <a href="mailto:contacto@detodoencursos.com">
              contacto@detodoencursos.com
            </a>
          </div>

          {/* Input */}
          <form onSubmit={enviarMensaje} className="chatbot-input-container">
            <input
              type="text"
              value={inputMensaje}
              onChange={(e) => setInputMensaje(e.target.value)}
              placeholder="Escribe tu pregunta..."
              className="chatbot-input"
            />
            <button 
              type="submit" 
              className="chatbot-enviar-btn"
              disabled={!inputMensaje.trim()}
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatbotFAQ;