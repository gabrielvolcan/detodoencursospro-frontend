import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, Share2, ArrowLeft } from 'lucide-react';
import { cursosAPI } from '../services/api';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import './Certificado.css';

const Certificado = () => {
  const { cursoId } = useParams();
  const navigate = useNavigate();
  const certificadoRef = useRef(null);
  
  const [certificado, setCertificado] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [descargando, setDescargando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarCertificado();
  }, [cursoId]);

  const cargarCertificado = async () => {
    try {
      const { data } = await cursosAPI.obtenerCertificado(cursoId);
      setCertificado(data);
    } catch (error) {
      console.error('Error cargando certificado:', error);
      
      if (error.response?.status === 403) {
        setError('No has comprado este curso');
      } else if (error.response?.status === 400) {
        const progreso = error.response?.data?.progreso;
        if (progreso) {
          setError(`Debes completar el curso para obtener el certificado. Progreso: ${progreso.videosVistos}/${progreso.totalVideos} videos vistos.`);
        } else {
          setError('Debes completar el curso para obtener el certificado');
        }
      } else if (error.response?.status === 404) {
        setError('Curso no encontrado');
      } else {
        setError(error.response?.data?.error || 'Error cargando certificado');
      }
      
      setTimeout(() => navigate('/mis-cursos-aprender'), 4000);
    } finally {
      setCargando(false);
    }
  };

  const descargarPDF = async () => {
    if (!certificadoRef.current) return;
    
    setDescargando(true);
    try {
      const canvas = await html2canvas(certificadoRef.current, {
        scale: 3,
        logging: false,
        useCORS: true,
        backgroundColor: '#3a3a3a',
        width: 1920,
        height: 1080
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [1920, 1080]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, 1920, 1080);
      pdf.save(`Certificado-${certificado.nombreCurso.replace(/\s+/g, '-')}.pdf`);
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Error al generar PDF. Por favor intenta de nuevo.');
    } finally {
      setDescargando(false);
    }
  };

  const compartir = async () => {
    const texto = `¡Acabo de completar el curso "${certificado.nombreCurso}" en Detodo en Cursos! 🎓`;
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Mi Certificado',
          text: texto,
          url: url
        });
      } catch (error) {
        console.log('Error compartiendo:', error);
      }
    } else {
      navigator.clipboard.writeText(`${texto}\n${url}`);
      alert('¡Enlace copiado al portapapeles!');
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'Fecha no disponible';
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (cargando) {
    return (
      <div className="certificado-loading">
        <div className="spinner"></div>
        <p>Generando tu certificado...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="certificado-error">
        <h2>⚠️ {error}</h2>
        <p>Serás redirigido a Mis Cursos en unos segundos...</p>
        <button onClick={() => navigate('/mis-cursos-aprender')} className="btn-volver">
          Volver a Mis Cursos
        </button>
      </div>
    );
  }

  if (!certificado) return null;

  return (
    <div className="certificado-page">
      {/* Header con acciones */}
      <div className="certificado-header">
        <button onClick={() => navigate('/mis-cursos-aprender')} className="btn-back">
          <ArrowLeft size={20} />
          Volver a Mis Cursos
        </button>
        
        <div className="header-actions">
          <button onClick={compartir} className="btn-compartir">
            <Share2 size={20} />
            Compartir
          </button>
          <button 
            onClick={descargarPDF} 
            className="btn-descargar"
            disabled={descargando}
          >
            <Download size={20} />
            {descargando ? 'Descargando...' : 'Descargar PDF'}
          </button>
        </div>
      </div>

      {/* Certificado diseñado con CSS puro */}
      <div className="certificado-container">
        <div className="certificado-canvas" ref={certificadoRef}>
          
          {/* Formas geométricas decorativas */}
          <div className="geometric-shapes">
            {/* Triángulos y hexágonos izquierda */}
            <div className="shape triangle-left"></div>
            <div className="shape hexagon-left-top"></div>
            <div className="shape hexagon-left-bottom"></div>
            
            {/* Hexágonos derecha */}
            <div className="shape hexagon-right-top"></div>
            <div className="shape hexagon-right-bottom"></div>
            
            {/* Formas verdes esquinas */}
            <div className="shape green-corner-tl"></div>
            <div className="shape green-corner-tr"></div>
            <div className="shape green-corner-br"></div>
            <div className="shape green-corner-bl"></div>
          </div>

          {/* Logo superior izquierdo */}
          <div className="cert-logo-top">
            <svg viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg">
              <g>
                <path d="M32.5 10L50 20V40L32.5 50L15 40V20L32.5 10Z" fill="none" stroke="#00ff88" strokeWidth="2"/>
                <rect x="20" y="15" width="10" height="30" fill="#ffffff"/>
                <rect x="35" y="15" width="10" height="30" fill="#ffffff"/>
                <rect x="27.5" y="35" width="10" height="10" fill="#00ff88"/>
                <text x="65" y="30" fill="#00ff88" fontSize="18" fontWeight="700" fontFamily="Montserrat">Detodo</text>
                <text x="65" y="48" fill="#ffffff" fontSize="16" fontWeight="400" fontFamily="Montserrat">Cursos</text>
                <text x="65" y="58" fill="#cccccc" fontSize="8" fontFamily="Montserrat">¡Aprende lo que necesitas Hoy!</text>
              </g>
            </svg>
          </div>

          {/* Línea diagonal decorativa superior */}
          <div className="diagonal-line-top"></div>

          {/* Código de verificación - rectángulo verde claro */}
          <div className="codigo-box">
            <span className="codigo-text">{certificado.codigoCertificado}</span>
          </div>

          {/* Contenido principal */}
          <div className="cert-content">
            {/* Título principal */}
            <h1 className="cert-titulo-principal">CERTIFICADO</h1>
            <p className="cert-subtitulo">DE CURSO COMPLETADO</p>

            {/* Texto de otorgamiento */}
            <p className="cert-texto-otorga">Este certificado se otorga a:</p>

            {/* Nombre del estudiante */}
            <h2 className="cert-nombre-estudiante">{certificado.nombreEstudiante}</h2>
            
            {/* Línea decorativa */}
            <div className="cert-linea-nombre"></div>

            {/* Nombre del curso */}
            <h3 className="cert-nombre-curso">{certificado.nombreCurso}</h3>

            {/* Texto explicativo */}
            <p className="cert-texto-explicativo">
              Se otorga el presente certificado por haber completado satisfactoriamente el curso de<br />
              {certificado.nombreCurso} aplicada a casos reales en el ámbito laboral
            </p>
          </div>

          {/* Fecha inferior izquierda */}
          <div className="cert-fecha-box">
            <div className="fecha-valor">{formatearFecha(certificado.fechaCompletado)}</div>
            <div className="fecha-linea"></div>
            <div className="fecha-label">FECHA</div>
          </div>

          {/* Logo y plataforma inferior derecha */}
          <div className="cert-logo-bottom">
            <svg viewBox="0 0 80 60" xmlns="http://www.w3.org/2000/svg">
              <g>
                <path d="M20 10L30 15V25L20 30L10 25V15L20 10Z" fill="none" stroke="#00ff88" strokeWidth="1.5"/>
                <rect x="15" y="13" width="4" height="14" fill="#ffffff"/>
                <rect x="21" y="13" width="4" height="14" fill="#ffffff"/>
                <rect x="18" y="21" width="4" height="4" fill="#00ff88"/>
                <text x="35" y="20" fill="#00ff88" fontSize="10" fontWeight="700" fontFamily="Montserrat">Detodo</text>
                <text x="35" y="28" fill="#ffffff" fontSize="8" fontWeight="400" fontFamily="Montserrat">Cursos</text>
                <text x="35" y="33" fill="#cccccc" fontSize="4" fontFamily="Montserrat">¡Aprende lo que necesitas Hoy!</text>
              </g>
            </svg>
            <div className="plataforma-linea"></div>
            <div className="plataforma-label">PLATAFORMA</div>
          </div>

          {/* Triángulo decorativo inferior central */}
          <div className="triangulo-inferior"></div>
        </div>
      </div>

      {/* Info adicional */}
      <div className="certificado-info">
        <div className="info-card">
          <h3>Sobre tu certificado</h3>
          <ul>
            <li>✅ Certificado digital oficial</li>
            <li>✅ Código de verificación único</li>
            <li>✅ Válido para CV y LinkedIn</li>
            <li>✅ Descargable en PDF de alta calidad</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Certificado;