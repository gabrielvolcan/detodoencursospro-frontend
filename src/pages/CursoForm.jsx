import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Trash2, Save, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cursosAPI } from '../services/api';
import './CursoForm.css';
import '../components/cursosGratuitos.css';

const CursoForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { esAdmin } = useAuth();
  const [cargando, setCargando] = useState(false);

  const [formData, setFormData] = useState({
    titulo: '',
    descripcionCorta: '',
    descripcionCompleta: '',
    precioUSD: '',
    categoria: '',
    nivel: 'Principiante',
    duracion: '',
    imagen: '',
    destacado: false,
    activo: true,
    esGratuito: false, // 🆕 NUEVO CAMPO
    temario: []
  });

  useEffect(() => {
    if (!esAdmin()) {
      navigate('/');
      return;
    }
    if (id) {
      cargarCurso();
    }
  }, [id]);

  const cargarCurso = async () => {
    try {
      setCargando(true);
      const { data } = await cursosAPI.obtenerPorId(id);
      setFormData({
        titulo: data.titulo || '',
        descripcionCorta: data.descripcionCorta || '',
        descripcionCompleta: data.descripcionCompleta || '',
        precioUSD: data.precioUSD || '',
        categoria: data.categoria || '',
        nivel: data.nivel || 'Principiante',
        duracion: data.duracion || '',
        imagen: data.imagen || '',
        destacado: data.destacado || false,
        activo: data.activo !== undefined ? data.activo : true,
        esGratuito: data.esGratuito || false, // 🆕 CARGAR CAMPO
        temario: data.temario || []
      });
    } catch (error) {
      console.error('Error cargando curso:', error);
      alert('Error al cargar el curso');
    } finally {
      setCargando(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // 🆕 LÓGICA ESPECIAL: Si marca "Curso Gratuito", precio = 0
    if (name === 'esGratuito' && checked) {
      setFormData(prev => ({
        ...prev,
        esGratuito: true,
        precioUSD: '0'
      }));
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const agregarModulo = () => {
    setFormData(prev => ({
      ...prev,
      temario: [...prev.temario, { titulo: '', temas: [] }]
    }));
  };

  const eliminarModulo = (index) => {
    setFormData(prev => ({
      ...prev,
      temario: prev.temario.filter((_, i) => i !== index)
    }));
  };

  const actualizarModulo = (index, valor) => {
    setFormData(prev => ({
      ...prev,
      temario: prev.temario.map((modulo, i) => 
        i === index ? { ...modulo, titulo: valor } : modulo
      )
    }));
  };

  const agregarTema = (moduloIndex) => {
    setFormData(prev => ({
      ...prev,
      temario: prev.temario.map((modulo, i) => 
        i === moduloIndex 
          ? { ...modulo, temas: [...modulo.temas, { titulo: '', videoUrl: '', duracion: '' }] }
          : modulo
      )
    }));
  };

  const eliminarTema = (moduloIndex, temaIndex) => {
    setFormData(prev => ({
      ...prev,
      temario: prev.temario.map((modulo, i) => 
        i === moduloIndex 
          ? { ...modulo, temas: modulo.temas.filter((_, j) => j !== temaIndex) }
          : modulo
      )
    }));
  };

  const actualizarTema = (moduloIndex, temaIndex, campo, valor) => {
    setFormData(prev => ({
      ...prev,
      temario: prev.temario.map((modulo, i) => 
        i === moduloIndex 
          ? {
              ...modulo,
              temas: modulo.temas.map((tema, j) => 
                j === temaIndex ? { ...tema, [campo]: valor } : tema
              )
            }
          : modulo
      )
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.titulo || !formData.categoria) {
      alert('Por favor completa: Título y Categoría');
      return;
    }

    // 🆕 VALIDACIÓN: Si es gratuito, precio debe ser 0
    if (formData.esGratuito && parseFloat(formData.precioUSD) !== 0) {
      alert('❌ Los cursos gratuitos deben tener precio $0');
      return;
    }

    try {
      setCargando(true);
      
      const cursoData = {
        ...formData,
        precioUSD: parseFloat(formData.precioUSD) || 0
      };

      if (id) {
        await cursosAPI.actualizar(id, cursoData);
        alert('✅ Curso actualizado exitosamente');
      } else {
        await cursosAPI.crear(cursoData);
        alert('✅ Curso creado exitosamente');
      }
      
      navigate('/admin');
    } catch (error) {
      console.error('Error guardando curso:', error);
      alert('❌ Error: ' + (error.response?.data?.error || error.message));
    } finally {
      setCargando(false);
    }
  };

  if (cargando && id) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando curso...</p>
      </div>
    );
  }

  return (
    <div className="curso-form-page">
      <div className="container py-4">
        <div className="form-header">
          <h1>{id ? 'Editar Curso' : 'Crear Nuevo Curso'}</h1>
          <button className="btn-cancelar" onClick={() => navigate('/admin')}>
            <X size={20} />
            Cancelar
          </button>
        </div>

        <form onSubmit={handleSubmit} className="curso-form">
          {/* INFORMACIÓN BÁSICA */}
          <div className="form-section">
            <h2>Información Básica</h2>
            
            <div className="form-group">
              <label>Título del Curso *</label>
              <input
                type="text"
                name="titulo"
                value={formData.titulo}
                onChange={handleChange}
                placeholder="Ej: Instalación de Cámaras CCTV"
                required
              />
            </div>

            <div className="form-group">
              <label>Descripción Corta * (máx 200 caracteres)</label>
              <textarea
                name="descripcionCorta"
                value={formData.descripcionCorta}
                onChange={handleChange}
                placeholder="Descripción breve que aparecerá en la tarjeta del curso"
                rows="2"
                maxLength="200"
                required
              />
              <small>{formData.descripcionCorta.length}/200 caracteres</small>
            </div>

            <div className="form-group">
              <label>Descripción Completa</label>
              <textarea
                name="descripcionCompleta"
                value={formData.descripcionCompleta}
                onChange={handleChange}
                placeholder="Descripción detallada del curso"
                rows="5"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Categoría *</label>
                <input
                  type="text"
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleChange}
                  placeholder="Ej: Seguridad, Redes, Electricidad"
                  required
                />
              </div>

              <div className="form-group">
                <label>Nivel *</label>
                <select name="nivel" value={formData.nivel} onChange={handleChange}>
                  <option value="Principiante">Principiante</option>
                  <option value="Intermedio">Intermedio</option>
                  <option value="Avanzado">Avanzado</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Precio Base (USD) *</label>
                <input
                  type="number"
                  name="precioUSD"
                  value={formData.precioUSD}
                  onChange={handleChange}
                  placeholder="50"
                  step="0.01"
                  min="0"
                  disabled={formData.esGratuito} // 🆕 DESHABILITADO SI ES GRATUITO
                  required
                />
                <small>
                  {formData.esGratuito 
                    ? '🎁 Curso marcado como GRATUITO' 
                    : 'Los precios en otras monedas se calcularán automáticamente'}
                </small>
              </div>

              <div className="form-group">
                <label>Duración Total</label>
                <input
                  type="text"
                  name="duracion"
                  value={formData.duracion}
                  onChange={handleChange}
                  placeholder="8 horas"
                />
              </div>
            </div>

            <div className="form-group">
              <label>URL de la Imagen</label>
              <input
                type="url"
                name="imagen"
                value={formData.imagen}
                onChange={handleChange}
                placeholder="https://ejemplo.com/imagen.jpg"
              />
              {formData.imagen && (
                <img src={formData.imagen} alt="Preview" className="imagen-preview" />
              )}
            </div>

            <div className="form-checks">
              {/* 🆕 NUEVO CHECKBOX: CURSO GRATUITO */}
              <label className="checkbox-label checkbox-gratuito">
                <input
                  type="checkbox"
                  name="esGratuito"
                  checked={formData.esGratuito}
                  onChange={handleChange}
                />
                <span>🎁 Curso GRATUITO (Lead Magnet)</span>
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="destacado"
                  checked={formData.destacado}
                  onChange={handleChange}
                />
                <span>⭐ Curso Destacado</span>
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="activo"
                  checked={formData.activo}
                  onChange={handleChange}
                />
                <span>✅ Curso Activo</span>
              </label>
            </div>
          </div>

          {/* TEMARIO */}
          <div className="form-section">
            <div className="section-header">
              <h2>Temario del Curso</h2>
              <button type="button" className="btn-agregar-modulo" onClick={agregarModulo}>
                <Plus size={18} />
                Agregar Módulo
              </button>
            </div>

            {formData.temario.map((modulo, moduloIndex) => (
              <div key={moduloIndex} className="modulo-card">
                <div className="modulo-header">
                  <input
                    type="text"
                    value={modulo.titulo}
                    onChange={(e) => actualizarModulo(moduloIndex, e.target.value)}
                    placeholder={`Módulo ${moduloIndex + 1}: Título`}
                    className="modulo-titulo-input"
                  />
                  <button
                    type="button"
                    className="btn-eliminar-modulo"
                    onClick={() => eliminarModulo(moduloIndex)}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="temas-list">
                  {modulo.temas && modulo.temas.map((tema, temaIndex) => (
                    <div key={temaIndex} className="tema-item">
                      <div className="tema-numero">{temaIndex + 1}</div>
                      <div className="tema-inputs">
                        <input
                          type="text"
                          value={tema.titulo}
                          onChange={(e) => actualizarTema(moduloIndex, temaIndex, 'titulo', e.target.value)}
                          placeholder="Título del tema"
                          className="tema-titulo-input"
                        />
                        <input
                          type="url"
                          value={tema.videoUrl || ''}
                          onChange={(e) => actualizarTema(moduloIndex, temaIndex, 'videoUrl', e.target.value)}
                          placeholder="https://www.youtube.com/watch?v=..."
                          className="tema-video-input"
                        />
                        <input
                          type="text"
                          value={tema.duracion || ''}
                          onChange={(e) => actualizarTema(moduloIndex, temaIndex, 'duracion', e.target.value)}
                          placeholder="10:30"
                          className="tema-duracion-input"
                        />
                      </div>
                      <button
                        type="button"
                        className="btn-eliminar-tema"
                        onClick={() => eliminarTema(moduloIndex, temaIndex)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  className="btn-agregar-tema"
                  onClick={() => agregarTema(moduloIndex)}
                >
                  <Plus size={16} />
                  Agregar Tema
                </button>
              </div>
            ))}

            {formData.temario.length === 0 && (
              <div className="sin-modulos">
                <p>📚 No hay módulos aún. Haz click en "Agregar Módulo".</p>
              </div>
            )}
          </div>

          {/* BOTONES DE ACCIÓN */}
          <div className="form-actions">
            <button type="button" className="btn-cancelar" onClick={() => navigate('/admin')}>
              Cancelar
            </button>
            <button type="submit" className="btn-guardar" disabled={cargando}>
              <Save size={20} />
              {cargando ? 'Guardando...' : (id ? 'Actualizar Curso' : 'Crear Curso')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CursoForm;
