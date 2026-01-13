import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, Share2, ArrowLeft, Award, Calendar, Clock, BookOpen } from 'lucide-react';
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
      
      // Mensajes de error más específicos
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
        scale: 2,
        logging: false,
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
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
      // Fallback: copiar al portapapeles
      navigator.clipboard.writeText(`${texto}\n${url}`);
      alert('¡Enlace copiado al portapapeles!');
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'Fecha no disponible';
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
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

      {/* Certificado */}
      <div className="certificado-container">
        <div className="certificado-wrapper" ref={certificadoRef}>
          {/* Borde decorativo */}
          <div className="certificado-border">
            <div className="border-corner tl"></div>
            <div className="border-corner tr"></div>
            <div className="border-corner bl"></div>
            <div className="border-corner br"></div>
          </div>

          {/* Contenido */}
          <div className="certificado-content">
            {/* Logo */}
            <div className="certificado-logo">
              <img src="/images/dtcisotipo.webp" alt="Logo" />
            </div>

            {/* Título */}
            <h1 className="certificado-titulo">Certificado de Finalización</h1>
            <p className="certificado-subtitulo">Este documento certifica que</p>

            {/* Nombre del estudiante */}
            <h2 className="certificado-nombre">{certificado.nombreEstudiante}</h2>

            {/* Texto */}
            <p className="certificado-texto">
              ha completado satisfactoriamente el curso
            </p>

            {/* Nombre del curso */}
            <h3 className="certificado-curso">{certificado.nombreCurso}</h3>

            {/* Detalles */}
            <div className="certificado-detalles">
              <div className="detalle-item">
                <Calendar size={18} />
                <div>
                  <span className="detalle-label">Fecha de finalización</span>
                  <span className="detalle-valor">{formatearFecha(certificado.fechaCompletado)}</span>
                </div>
              </div>
              
              <div className="detalle-item">
                <Clock size={18} />
                <div>
                  <span className="detalle-label">Duración</span>
                  <span className="detalle-valor">{certificado.duracionCurso}</span>
                </div>
              </div>
              
              <div className="detalle-item">
                <BookOpen size={18} />
                <div>
                  <span className="detalle-label">Categoría</span>
                  <span className="detalle-valor">{certificado.categoria}</span>
                </div>
              </div>
            </div>

            {/* Firma digital */}
            <div className="certificado-firma">
              <div className="firma-linea"></div>
              <div className="firma-texto">
                <p className="firma-nombre">Detodo en Cursos</p>
                <p className="firma-cargo">Plataforma de Educación Online</p>
              </div>
            </div>

            {/* Código de verificación */}
            <div className="certificado-codigo">
              <Award size={16} />
              <span>Código de verificación: <strong>{certificado.codigoCertificado}</strong></span>
            </div>

            {/* Footer */}
            <div className="certificado-footer">
              <p>www.detodoencursos.com</p>
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