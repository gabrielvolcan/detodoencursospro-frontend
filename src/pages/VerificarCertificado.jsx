import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { cursosAPI } from '../services/api';
import { CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import './VerificarCertificado.css';

const VerificarCertificado = () => {
  const { codigo } = useParams();
  const navigate = useNavigate();
  const [certificado, setCertificado] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    verificarCertificado();
  }, [codigo]);

  const verificarCertificado = async () => {
    try {
      const { data } = await cursosAPI.verificarCertificado(codigo);
      setCertificado(data);
    } catch (error) {
      console.error('Error verificando certificado:', error);
      setError('Certificado no válido o no encontrado');
    } finally {
      setCargando(false);
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  if (cargando) {
    return (
      <div className="verificar-loading">
        <div className="spinner"></div>
        <p>Verificando certificado...</p>
      </div>
    );
  }

  return (
    <div className="verificar-page">
      <div className="verificar-container">
        <button onClick={() => navigate('/')} className="btn-volver-home">
          <ArrowLeft size={20} />
          Volver al inicio
        </button>

        {error ? (
          <div className="verificar-error">
            <XCircle size={80} color="#ff4444" />
            <h1>Certificado No Válido</h1>
            <p>{error}</p>
            <div className="codigo-invalido">
              <span>Código:</span>
              <code>{codigo}</code>
            </div>
          </div>
        ) : (
          <div className="verificar-success">
            <CheckCircle size={80} color="#00ff88" />
            <h1>✅ Certificado Válido</h1>
            <p>Este certificado ha sido emitido oficialmente por Detodo Cursos</p>

            <div className="certificado-detalles">
              <div className="detalle-item">
                <span className="detalle-label">Estudiante:</span>
                <span className="detalle-valor">{certificado.nombreEstudiante}</span>
              </div>

              <div className="detalle-item">
                <span className="detalle-label">Curso:</span>
                <span className="detalle-valor">{certificado.nombreCurso}</span>
              </div>

              <div className="detalle-item">
                <span className="detalle-label">Fecha de finalización:</span>
                <span className="detalle-valor">{formatearFecha(certificado.fechaCompletado)}</span>
              </div>

              <div className="detalle-item">
                <span className="detalle-label">Código de verificación:</span>
                <code className="detalle-codigo">{certificado.codigoCertificado}</code>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerificarCertificado;