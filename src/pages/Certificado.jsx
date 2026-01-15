import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, Share2, ArrowLeft } from 'lucide-react';
import { cursosAPI } from '../services/api';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { QRCodeSVG } from 'qrcode.react';
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
        backgroundColor: '#1a1a1a',
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
    const texto = `¡Acabo de completar el curso "${certificado.nombreCurso}" en Detodo Cursos! 🎓`;
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
      month: 'long',
      year: 'numeric'
    });
  };

  // URL para verificar el certificado con QR
  const urlVerificacion = certificado 
    ? `${window.location.origin}/verificar-certificado/${certificado.codigoCertificado}`
    : '';

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

      {/* Certificado generado con CSS */}
      <div className="certificado-container">
        <div className="certificado-canvas" ref={certificadoRef}>
          {/* Patrón de fondo decorativo */}
          <div className="pattern-bg"></div>
          
          {/* Borde decorativo */}
          <div className="certificado-border"></div>

          {/* Header con logo */}
          <div className="certificado-header-logo">
            <img src="/images/dtcisotipo.webp" alt="DTC Logo" className="logo-isotipo" />
            <img src="/images/letras_y_eslogan.webp" alt="Detodo Cursos" className="logo-letras" />
          </div>

          {/* QR CODE - Reemplaza código de texto ✅ */}
          <div className="qr-container">
            <QRCodeSVG 
              value={urlVerificacion}
              size={110}
              bgColor="#00ff88"
              fgColor="#000000"
              level="H"
              includeMargin={false}
            />
            <span className="qr-label">Verificar autenticidad</span>
          </div>

          {/* Contenido principal */}
          <div className="certificado-content">
            <h1 className="certificado-titulo">CERTIFICADO</h1>
            <p className="certificado-subtitulo">DE CURSO COMPLETADO</p>

            <div className="certificado-otorgado">
              <p className="otorgado-texto">Este certificado se otorga a:</p>
            </div>

            {/* Nombre del estudiante con fuente Blacksword */}
            <h2 className="estudiante-nombre">{certificado.nombreEstudiante}</h2>

            <div className="curso-info">
              <p className="curso-descripcion">
                Por haber completado satisfactoriamente el curso
              </p>
              <h3 className="curso-nombre">{certificado.nombreCurso}</h3>
            </div>

            {/* Línea decorativa */}
            <div className="linea-decorativa">
              <div className="linea-punto"></div>
              <div className="linea-central"></div>
              <div className="linea-punto"></div>
            </div>

            {/* Footer con fecha */}
            <div className="certificado-footer-content">
              <div className="fecha-container">
                <span className="fecha-label">FECHA DE FINALIZACIÓN</span>
                <span className="fecha-valor">{formatearFecha(certificado.fechaCompletado)}</span>
              </div>

              <div className="logo-footer">
                <img src="/images/dtcisotipo.webp" alt="DTC" className="logo-footer-img" />
                <span className="plataforma-nombre">Detodo Cursos</span>
              </div>
            </div>
          </div>

          {/* Decoraciones geométricas */}
          <div className="deco deco-1"></div>
          <div className="deco deco-2"></div>
          <div className="deco deco-3"></div>
          <div className="deco deco-4"></div>
        </div>
      </div>

      {/* Info adicional */}
      <div className="certificado-info">
        <div className="info-card">
          <h3>Sobre tu certificado</h3>
          <ul>
            <li>✅ Certificado digital oficial</li>
            <li>✅ Código QR de verificación único</li>
            <li>✅ Válido para CV y LinkedIn</li>
            <li>✅ Descargable en PDF de alta calidad</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Certificado;