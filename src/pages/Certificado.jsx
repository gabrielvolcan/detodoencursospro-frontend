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
        backgroundColor: null,
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

      {/* Certificado con imagen de fondo */}
      <div className="certificado-container">
        <div className="certificado-wrapper" ref={certificadoRef}>
          {/* Imagen de fondo */}
          <img 
            src="/images/certificado.png" 
            alt="Certificado Template" 
            className="certificado-background"
          />
          
          {/* Campos dinámicos superpuestos */}
          <div className="certificado-overlay">
            {/* Código de verificación - Superior derecha */}
            <div className="campo-codigo">
              {certificado.codigoCertificado}
            </div>

            {/* Nombre del estudiante - Centro */}
            <div className="campo-nombre">
              {certificado.nombreEstudiante}
            </div>

            {/* Nombre del curso - Debajo del nombre */}
            <div className="campo-curso">
              {certificado.nombreCurso}
            </div>

            {/* Fecha - Inferior izquierda */}
            <div className="campo-fecha">
              {formatearFecha(certificado.fechaCompletado)}
            </div>
          </div>
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