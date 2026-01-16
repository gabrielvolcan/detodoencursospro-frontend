import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productosAPI, adminAPI } from '../services/api';
import { 
  Save, ArrowLeft, Upload, X, Plus, FileText, 
  Image as ImageIcon, DollarSign, Package 
} from 'lucide-react';
import './ProductoForm.css';
const ProductoForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const esEdicion = Boolean(id);

  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  // Estado del formulario
  const [producto, setProducto] = useState({
    titulo: '',
    subtitulo: '',
    descripcion: '',
    descripcionLarga: '',
    tipo: 'libro',
    categoria: '',
    tags: [],
    precioUSD: 0,
    imagen: null,
    imagenPreview: '',
    activo: true,
    destacado: false,
    nuevo: false,
    
    // Precios por país
    precios: {
      internacional: { monto: 0, moneda: 'USD' },
      peru: { monto: 0, moneda: 'PEN' },
      chile: { monto: 0, moneda: 'CLP' },
      argentina: { monto: 0, moneda: 'ARS' },
      uruguay: { monto: 0, moneda: 'UYU' },
      venezuela: { monto: 0, moneda: 'VES' }
    },
    
    // Archivos descargables
    archivos: [],
    archivosNuevos: [],
    
    // Videos (solo para cursos)
    videos: [],
    
    // Metadatos según tipo
    metadatos: {
      autor: '',
      paginas: 0,
      isbn: '',
      editorial: '',
      idioma: 'Español',
      version: '',
      compatibilidad: [],
      software: '',
      capas: false,
      instructor: '',
      certificado: false,
      actualizaciones: false,
      soporte: ''
    },
    
    // Lo que incluye
    incluye: [],
    
    // Límites
    limites: {
      descargasMaximas: null,
      diasAcceso: null,
      dispositivosMaximos: null
    }
  });

  const [nuevoTag, setNuevoTag] = useState('');
  const [nuevoIncluye, setNuevoIncluye] = useState('');

  // Tipos de producto
  const tiposProducto = [
    { valor: 'curso', label: 'Curso con Videos' },
    { valor: 'libro', label: 'Libro PDF' },
    { valor: 'ebook', label: 'Ebook Digital' },
    { valor: 'plantilla', label: 'Plantilla' },
    { valor: 'guia', label: 'Guía Descargable' },
    { valor: 'software', label: 'Software' },
    { valor: 'recurso', label: 'Recurso Gráfico' },
    { valor: 'bundle', label: 'Bundle/Paquete' }
  ];

  useEffect(() => {
    if (esEdicion) {
      cargarProducto();
    }
  }, [id]);

  const cargarProducto = async () => {
    try {
      setCargando(true);
      const { data } = await productosAPI.obtenerPorId(id);
      setProducto({
        ...data,
        imagenPreview: data.imagen,
        archivosNuevos: []
      });
    } catch (error) {
      console.error('Error cargando producto:', error);
      setError('Error al cargar producto');
    } finally {
      setCargando(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProducto(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleMetadatoChange = (campo, valor) => {
    setProducto(prev => ({
      ...prev,
      metadatos: {
        ...prev.metadatos,
        [campo]: valor
      }
    }));
  };

  const handlePrecioChange = (pais, valor) => {
    setProducto(prev => ({
      ...prev,
      precios: {
        ...prev.precios,
        [pais]: {
          ...prev.precios[pais],
          monto: parseFloat(valor) || 0
        }
      }
    }));
  };

  const handleLimiteChange = (campo, valor) => {
    setProducto(prev => ({
      ...prev,
      limites: {
        ...prev.limites,
        [campo]: valor === '' ? null : parseInt(valor)
      }
    }));
  };

  // Manejo de imagen
  const handleImagenChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProducto(prev => ({
        ...prev,
        imagen: file,
        imagenPreview: URL.createObjectURL(file)
      }));
    }
  };

  // Manejo de archivos descargables
  const handleArchivosChange = (e) => {
    const files = Array.from(e.target.files);
    const nuevosArchivos = files.map(file => ({
      file,
      nombre: file.name,
      descripcion: '',
      tipo: file.name.split('.').pop(),
      tamaño: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
      esVistPrevia: false
    }));
    
    setProducto(prev => ({
      ...prev,
      archivosNuevos: [...prev.archivosNuevos, ...nuevosArchivos]
    }));
  };

  const eliminarArchivoNuevo = (index) => {
    setProducto(prev => ({
      ...prev,
      archivosNuevos: prev.archivosNuevos.filter((_, i) => i !== index)
    }));
  };

  const actualizarArchivoNuevo = (index, campo, valor) => {
    setProducto(prev => ({
      ...prev,
      archivosNuevos: prev.archivosNuevos.map((archivo, i) => 
        i === index ? { ...archivo, [campo]: valor } : archivo
      )
    }));
  };

  // Tags
  const agregarTag = () => {
    if (nuevoTag.trim() && !producto.tags.includes(nuevoTag.trim())) {
      setProducto(prev => ({
        ...prev,
        tags: [...prev.tags, nuevoTag.trim()]
      }));
      setNuevoTag('');
    }
  };

  const eliminarTag = (tag) => {
    setProducto(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  // Incluye
  const agregarIncluye = () => {
    if (nuevoIncluye.trim()) {
      setProducto(prev => ({
        ...prev,
        incluye: [...prev.incluye, { texto: nuevoIncluye.trim(), icono: 'CheckCircle' }]
      }));
      setNuevoIncluye('');
    }
  };

  const eliminarIncluye = (index) => {
    setProducto(prev => ({
      ...prev,
      incluye: prev.incluye.filter((_, i) => i !== index)
    }));
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setGuardando(true);
      setError('');

      // Crear FormData para enviar archivos
      const formData = new FormData();
      
      // Datos básicos
      formData.append('titulo', producto.titulo);
      formData.append('subtitulo', producto.subtitulo || '');
      formData.append('descripcion', producto.descripcion);
      formData.append('descripcionLarga', producto.descripcionLarga || '');
      formData.append('tipo', producto.tipo);
      formData.append('categoria', producto.categoria);
      formData.append('precioUSD', producto.precioUSD);
      formData.append('activo', producto.activo);
      formData.append('destacado', producto.destacado);
      formData.append('nuevo', producto.nuevo);
      
      // Arrays
      formData.append('tags', JSON.stringify(producto.tags));
      formData.append('incluye', JSON.stringify(producto.incluye));
      formData.append('precios', JSON.stringify(producto.precios));
      formData.append('metadatos', JSON.stringify(producto.metadatos));
      formData.append('limites', JSON.stringify(producto.limites));
      
      // Imagen de portada
      if (producto.imagen instanceof File) {
        formData.append('imagen', producto.imagen);
      }
      
      // Archivos descargables
      if (producto.archivosNuevos.length > 0) {
        producto.archivosNuevos.forEach((archivo, index) => {
          formData.append('archivos', archivo.file);
          formData.append(`archivosMeta[${index}][nombre]`, archivo.nombre);
          formData.append(`archivosMeta[${index}][descripcion]`, archivo.descripcion || '');
          formData.append(`archivosMeta[${index}][esVistPrevia]`, archivo.esVistPrevia);
        });
      }

      // Crear o actualizar
      if (esEdicion) {
        await productosAPI.actualizar(id, formData);
      } else {
        await productosAPI.crear(formData);
      }

      alert(esEdicion ? 'Producto actualizado' : 'Producto creado');
      navigate('/admin');
    } catch (error) {
      console.error('Error guardando producto:', error);
      setError(error.response?.data?.error || 'Error al guardar producto');
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return <div className="loading">Cargando...</div>;
  }

  return (
    <div className="producto-form-page">
      <div className="container">
        <div className="form-header">
          <button onClick={() => navigate('/admin')} className="btn-volver">
            <ArrowLeft size={20} />
            Volver
          </button>
          <h1>{esEdicion ? 'Editar Producto' : 'Crear Producto'}</h1>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="producto-form">
          {/* ========================================
              INFORMACIÓN BÁSICA
          ======================================== */}
          <section className="form-section">
            <h2>Información Básica</h2>
            
            <div className="form-group">
              <label>Tipo de Producto *</label>
              <select
                name="tipo"
                value={producto.tipo}
                onChange={handleChange}
                required
              >
                {tiposProducto.map(tipo => (
                  <option key={tipo.valor} value={tipo.valor}>
                    {tipo.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Título *</label>
              <input
                type="text"
                name="titulo"
                value={producto.titulo}
                onChange={handleChange}
                required
                placeholder="Ej: Curso Completo de CCTV"
              />
            </div>

            <div className="form-group">
              <label>Subtítulo</label>
              <input
                type="text"
                name="subtitulo"
                value={producto.subtitulo}
                onChange={handleChange}
                placeholder="Ej: Aprende instalación profesional"
              />
            </div>

            <div className="form-group">
              <label>Descripción Corta *</label>
              <textarea
                name="descripcion"
                value={producto.descripcion}
                onChange={handleChange}
                required
                rows={3}
                placeholder="Descripción breve que aparecerá en las tarjetas"
              />
            </div>

            <div className="form-group">
              <label>Descripción Larga</label>
              <textarea
                name="descripcionLarga"
                value={producto.descripcionLarga}
                onChange={handleChange}
                rows={6}
                placeholder="Descripción detallada del producto (soporta HTML)"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Categoría *</label>
                <input
                  type="text"
                  name="categoria"
                  value={producto.categoria}
                  onChange={handleChange}
                  required
                  placeholder="Ej: Seguridad, CCTV, Diseño"
                />
              </div>
            </div>

            {/* Tags */}
            <div className="form-group">
              <label>Tags/Etiquetas</label>
              <div className="tags-input">
                <input
                  type="text"
                  value={nuevoTag}
                  onChange={(e) => setNuevoTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), agregarTag())}
                  placeholder="Agregar tag y presiona Enter"
                />
                <button type="button" onClick={agregarTag}>
                  <Plus size={18} />
                </button>
              </div>
              <div className="tags-list">
                {producto.tags.map(tag => (
                  <span key={tag} className="tag">
                    {tag}
                    <button type="button" onClick={() => eliminarTag(tag)}>
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* ========================================
              IMAGEN DE PORTADA
          ======================================== */}
          <section className="form-section">
            <h2>Imagen de Portada</h2>
            <div className="imagen-upload">
              <input
                type="file"
                accept="image/*"
                onChange={handleImagenChange}
                id="imagen-input"
                hidden
              />
              <label htmlFor="imagen-input" className="upload-btn">
                <ImageIcon size={24} />
                Seleccionar Imagen
              </label>
              {producto.imagenPreview && (
                <div className="imagen-preview">
                  <img src={producto.imagenPreview} alt="Preview" />
                </div>
              )}
            </div>
          </section>

          {/* ========================================
              ARCHIVOS DESCARGABLES (si no es curso)
          ======================================== */}
          {producto.tipo !== 'curso' && (
            <section className="form-section">
              <h2>Archivos Descargables</h2>
              <div className="archivos-upload">
                <input
                  type="file"
                  multiple
                  onChange={handleArchivosChange}
                  id="archivos-input"
                  hidden
                />
                <label htmlFor="archivos-input" className="upload-btn">
                  <Upload size={24} />
                  Agregar Archivos
                </label>
                <p className="help-text">
                  Formatos: PDF, ZIP, RAR, PSD, AI, EPUB, EXE, DMG, etc.
                </p>
              </div>

              {producto.archivosNuevos.length > 0 && (
                <div className="archivos-lista">
                  {producto.archivosNuevos.map((archivo, index) => (
                    <div key={index} className="archivo-item">
                      <div className="archivo-info">
                        <FileText size={24} />
                        <div>
                          <input
                            type="text"
                            value={archivo.nombre}
                            onChange={(e) => actualizarArchivoNuevo(index, 'nombre', e.target.value)}
                            placeholder="Nombre del archivo"
                          />
                          <input
                            type="text"
                            value={archivo.descripcion}
                            onChange={(e) => actualizarArchivoNuevo(index, 'descripcion', e.target.value)}
                            placeholder="Descripción (opcional)"
                          />
                          <span className="archivo-meta">{archivo.tamaño}</span>
                        </div>
                      </div>
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={archivo.esVistPrevia}
                          onChange={(e) => actualizarArchivoNuevo(index, 'esVistPrevia', e.target.checked)}
                        />
                        Vista previa gratuita
                      </label>
                      <button
                        type="button"
                        onClick={() => eliminarArchivoNuevo(index)}
                        className="btn-eliminar"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* ========================================
              PRECIOS
          ======================================== */}
          <section className="form-section">
            <h2>Precios</h2>
            <div className="form-group">
              <label>Precio Base (USD) *</label>
              <input
                type="number"
                name="precioUSD"
                value={producto.precioUSD}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
              />
            </div>

            <div className="precios-grid">
              {Object.keys(producto.precios).map(pais => (
                <div key={pais} className="form-group">
                  <label>{pais.charAt(0).toUpperCase() + pais.slice(1)} ({producto.precios[pais].moneda})</label>
                  <input
                    type="number"
                    value={producto.precios[pais].monto}
                    onChange={(e) => handlePrecioChange(pais, e.target.value)}
                    min="0"
                    step="0.01"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* ========================================
              METADATOS SEGÚN TIPO
          ======================================== */}
          <section className="form-section">
            <h2>Información Adicional</h2>
            
            {/* Para libros/ebooks */}
            {['libro', 'ebook'].includes(producto.tipo) && (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label>Autor</label>
                    <input
                      type="text"
                      value={producto.metadatos.autor}
                      onChange={(e) => handleMetadatoChange('autor', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Páginas</label>
                    <input
                      type="number"
                      value={producto.metadatos.paginas}
                      onChange={(e) => handleMetadatoChange('paginas', parseInt(e.target.value))}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>ISBN</label>
                    <input
                      type="text"
                      value={producto.metadatos.isbn}
                      onChange={(e) => handleMetadatoChange('isbn', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Editorial</label>
                    <input
                      type="text"
                      value={producto.metadatos.editorial}
                      onChange={(e) => handleMetadatoChange('editorial', e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Para software */}
            {producto.tipo === 'software' && (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label>Versión</label>
                    <input
                      type="text"
                      value={producto.metadatos.version}
                      onChange={(e) => handleMetadatoChange('version', e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Para plantillas */}
            {producto.tipo === 'plantilla' && (
              <>
                <div className="form-group">
                  <label>Software Requerido</label>
                  <input
                    type="text"
                    value={producto.metadatos.software}
                    onChange={(e) => handleMetadatoChange('software', e.target.value)}
                    placeholder="Ej: Photoshop, Figma, Illustrator"
                  />
                </div>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={producto.metadatos.capas}
                    onChange={(e) => handleMetadatoChange('capas', e.target.checked)}
                  />
                  Capas editables
                </label>
              </>
            )}

            {/* Campos comunes */}
            <div className="form-group">
              <label>Idioma</label>
              <select
                value={producto.metadatos.idioma}
                onChange={(e) => handleMetadatoChange('idioma', e.target.value)}
              >
                <option value="Español">Español</option>
                <option value="Inglés">Inglés</option>
                <option value="Portugués">Portugués</option>
              </select>
            </div>

            <div className="form-group">
              <label>Soporte</label>
              <input
                type="text"
                value={producto.metadatos.soporte}
                onChange={(e) => handleMetadatoChange('soporte', e.target.value)}
                placeholder="Ej: 6 meses, Ilimitado"
              />
            </div>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={producto.metadatos.actualizaciones}
                onChange={(e) => handleMetadatoChange('actualizaciones', e.target.checked)}
              />
              Incluye actualizaciones gratuitas
            </label>
          </section>

          {/* ========================================
              LO QUE INCLUYE
          ======================================== */}
          <section className="form-section">
            <h2>Lo que Incluye</h2>
            <div className="form-group">
              <div className="tags-input">
                <input
                  type="text"
                  value={nuevoIncluye}
                  onChange={(e) => setNuevoIncluye(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), agregarIncluye())}
                  placeholder="Ej: Acceso de por vida"
                />
                <button type="button" onClick={agregarIncluye}>
                  <Plus size={18} />
                </button>
              </div>
              <div className="incluye-lista">
                {producto.incluye.map((item, index) => (
                  <div key={index} className="incluye-item">
                    <span>{item.texto}</span>
                    <button type="button" onClick={() => eliminarIncluye(index)}>
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ========================================
              LÍMITES Y RESTRICCIONES
          ======================================== */}
          <section className="form-section">
            <h2>Límites y Restricciones (opcional)</h2>
            <div className="form-row">
              <div className="form-group">
                <label>Descargas Máximas</label>
                <input
                  type="number"
                  value={producto.limites.descargasMaximas || ''}
                  onChange={(e) => handleLimiteChange('descargasMaximas', e.target.value)}
                  placeholder="Ilimitadas"
                  min="1"
                />
                <small>Dejar vacío para ilimitadas</small>
              </div>
              <div className="form-group">
                <label>Días de Acceso</label>
                <input
                  type="number"
                  value={producto.limites.diasAcceso || ''}
                  onChange={(e) => handleLimiteChange('diasAcceso', e.target.value)}
                  placeholder="Permanente"
                  min="1"
                />
                <small>Dejar vacío para permanente</small>
              </div>
            </div>
          </section>

          {/* ========================================
              CONFIGURACIONES
          ======================================== */}
          <section className="form-section">
            <h2>Configuraciones</h2>
            <div className="checkboxes-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="activo"
                  checked={producto.activo}
                  onChange={handleChange}
                />
                Producto activo (visible para usuarios)
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="destacado"
                  checked={producto.destacado}
                  onChange={handleChange}
                />
                Producto destacado
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="nuevo"
                  checked={producto.nuevo}
                  onChange={handleChange}
                />
                Marcar como "Nuevo"
              </label>
            </div>
          </section>

          {/* ========================================
              BOTONES
          ======================================== */}
          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="btn-cancelar"
              disabled={guardando}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-guardar"
              disabled={guardando}
            >
              <Save size={20} />
              {guardando ? 'Guardando...' : esEdicion ? 'Actualizar' : 'Crear Producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductoForm;