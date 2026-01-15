import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Eye, Users, ArrowLeft, Mail } from 'lucide-react';
import axios from 'axios';
import { cursosAPI } from '../services/api';
import './EmailMasivo.css';

const EmailMasivo = () => {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [previsualizar, setPrevisualizar] = useState(false);
  const [cursos, setCursos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  
  const [formData, setFormData] = useState({
    tipo: 'todos',
    plantilla: 'personalizado',
    asunto: '',
    mensaje: '',
    cursoId: '',
    categoria: ''
  });
  
  const [destinatarios, setDestinatarios] = useState(0);
  const [resultado, setResultado] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    obtenerDestinatarios();
  }, [formData.tipo, formData.cursoId, formData.categoria]);

  const cargarDatos = async () => {
    try {
      const [cursosRes, categoriasRes] = await Promise.all([
        cursosAPI.obtenerTodos(),
        cursosAPI.obtenerCategorias()
      ]);
      setCursos(cursosRes.data);
      setCategorias(categoriasRes.data);
    } catch (error) {
      console.error('Error cargando datos:', error);
    }
  };

  const obtenerDestinatarios = async () => {
    try {
      const { data } = await axios.post('/email-masivo/previsualizar', {
        tipo: formData.tipo,
        cursoId: formData.cursoId,
        categoria: formData.categoria
      });
      setDestinatarios(data.destinatarios);
    } catch (error) {
      console.error('Error obteniendo destinatarios:', error);
      setDestinatarios(0);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEnviar = async () => {
    if (!formData.asunto || !formData.mensaje) {
      alert('Por favor completa el asunto y mensaje');
      return;
    }

    if (destinatarios === 0) {
      alert('No hay destinatarios para enviar');
      return;
    }

    const confirmar = window.confirm(
      `¿Estás seguro de enviar este email a ${destinatarios} destinatarios?`
    );

    if (!confirmar) return;

    setEnviando(true);
    setResultado(null);

    try {
      const { data } = await axios.post('/email-masivo/enviar', formData);
      setResultado(data);
      
      if (data.exito) {
        alert(`✅ Emails enviados exitosamente!\n\nTotal: ${data.estadisticas.total}\nEnviados: ${data.estadisticas.enviados}\nErrores: ${data.estadisticas.errores}`);
        
        // Resetear formulario
        setFormData({
          tipo: 'todos',
          plantilla: 'personalizado',
          asunto: '',
          mensaje: '',
          cursoId: '',
          categoria: ''
        });
      }
    } catch (error) {
      console.error('Error enviando emails:', error);
      alert('❌ Error al enviar emails. Revisa los logs del servidor.');
    } finally {
      setEnviando(false);
    }
  };

  const renderPlantilla = () => {
    switch (formData.plantilla) {
      case 'nuevoCurso':
        return (
          <div className="plantilla-selector">
            <label>Selecciona el curso:</label>
            <select name="cursoId" value={formData.cursoId} onChange={handleChange}>
              <option value="">Selecciona un curso</option>
              {cursos.map(curso => (
                <option key={curso._id} value={curso._id}>
                  {curso.titulo}
                </option>
              ))}
            </select>
          </div>
        );

      case 'descuento':
        return (
          <div className="plantilla-selector">
            <label>Porcentaje de descuento:</label>
            <input
              type="number"
              placeholder="Ej: 20"
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                datosAdicionales: { porcentaje: e.target.value }
              }))}
            />
          </div>
        );

      case 'actualizacion':
        return (
          <div className="plantilla-selector">
            <label>Curso actualizado:</label>
            <select name="cursoId" value={formData.cursoId} onChange={handleChange}>
              <option value="">Selecciona un curso</option>
              {cursos.map(curso => (
                <option key={curso._id} value={curso._id}>
                  {curso.titulo}
                </option>
              ))}
            </select>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="email-masivo-page">
      <div className="email-masivo-container">
        {/* Header */}
        <div className="email-header">
          <button onClick={() => navigate('/admin')} className="btn-back">
            <ArrowLeft size={20} />
            Volver al Admin
          </button>
          <h1>📧 Email Masivo</h1>
        </div>

        <div className="email-content">
          {/* Sidebar - Configuración */}
          <div className="email-sidebar">
            <div className="config-section">
              <h3>Destinatarios</h3>
              
              <div className="form-group">
                <label>Enviar a:</label>
                <select name="tipo" value={formData.tipo} onChange={handleChange}>
                  <option value="todos">Todos los usuarios</option>
                  <option value="conCursos">Usuarios con cursos</option>
                  <option value="cursoEspecifico">Curso específico</option>
                  <option value="categoria">Categoría</option>
                </select>
              </div>

              {formData.tipo === 'cursoEspecifico' && (
                <div className="form-group">
                  <label>Curso:</label>
                  <select name="cursoId" value={formData.cursoId} onChange={handleChange}>
                    <option value="">Selecciona un curso</option>
                    {cursos.map(curso => (
                      <option key={curso._id} value={curso._id}>
                        {curso.titulo}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {formData.tipo === 'categoria' && (
                <div className="form-group">
                  <label>Categoría:</label>
                  <select name="categoria" value={formData.categoria} onChange={handleChange}>
                    <option value="">Selecciona una categoría</option>
                    {categorias.map(cat => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="destinatarios-count">
                <Users size={20} />
                <span>{destinatarios} destinatarios</span>
              </div>
            </div>

            <div className="config-section">
              <h3>Plantilla</h3>
              
              <div className="form-group">
                <label>Tipo de email:</label>
                <select name="plantilla" value={formData.plantilla} onChange={handleChange}>
                  <option value="personalizado">Personalizado</option>
                  <option value="nuevoCurso">Nuevo Curso</option>
                  <option value="descuento">Descuento</option>
                  <option value="actualizacion">Actualización</option>
                </select>
              </div>

              {renderPlantilla()}
            </div>
          </div>

          {/* Main - Editor */}
          <div className="email-editor">
            <div className="editor-section">
              <h3>Contenido del Email</h3>

              <div className="form-group">
                <label>Asunto:</label>
                <input
                  type="text"
                  name="asunto"
                  value={formData.asunto}
                  onChange={handleChange}
                  placeholder="Ej: ¡Nuevo curso disponible en Detodo Cursos!"
                  disabled={formData.plantilla !== 'personalizado'}
                />
              </div>

              <div className="form-group">
                <label>Mensaje:</label>
                <textarea
                  name="mensaje"
                  value={formData.mensaje}
                  onChange={handleChange}
                  placeholder="Escribe el mensaje del email aquí..."
                  rows="15"
                  disabled={formData.plantilla !== 'personalizado'}
                />
              </div>

              {formData.plantilla !== 'personalizado' && (
                <div className="plantilla-info">
                  ℹ️ Esta plantilla tiene contenido predefinido. 
                  Selecciona "Personalizado" para escribir tu propio mensaje.
                </div>
              )}
            </div>

            {/* Vista previa */}
            {previsualizar && (
              <div className="preview-section">
                <h3>Vista Previa</h3>
                <div className="email-preview">
                  <div className="preview-header">
                    <Mail size={20} />
                    <strong>{formData.asunto || 'Sin asunto'}</strong>
                  </div>
                  <div className="preview-body">
                    <p style={{ whiteSpace: 'pre-wrap' }}>
                      {formData.mensaje || 'Sin mensaje'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Botones de acción */}
            <div className="email-actions">
              <button
                onClick={() => setPrevisualizar(!previsualizar)}
                className="btn-previsualizar"
              >
                <Eye size={20} />
                {previsualizar ? 'Ocultar' : 'Vista Previa'}
              </button>

              <button
                onClick={handleEnviar}
                className="btn-enviar"
                disabled={enviando || destinatarios === 0}
              >
                <Send size={20} />
                {enviando ? 'Enviando...' : `Enviar a ${destinatarios} personas`}
              </button>
            </div>

            {/* Resultado */}
            {resultado && (
              <div className={`resultado ${resultado.exito ? 'exito' : 'error'}`}>
                <h4>{resultado.mensaje}</h4>
                {resultado.estadisticas && (
                  <div className="estadisticas">
                    <p>✅ Enviados: {resultado.estadisticas.enviados}</p>
                    <p>❌ Errores: {resultado.estadisticas.errores}</p>
                    <p>📊 Total: {resultado.estadisticas.total}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailMasivo;