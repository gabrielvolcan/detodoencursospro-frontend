import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productosAPI } from '../services/api';
import { 
  Save, ArrowLeft, X, Plus, 
  Image as ImageIcon
} from 'lucide-react';
import './ProductoForm.css';

const ProductoForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const esEdicion = Boolean(id);

  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  // TASAS DE CONVERSIÓN
  const TASAS = {
    internacional: { multiplicador: 1, moneda: 'USD' },
    peru: { multiplicador: 3.36, moneda: 'PEN' },
    chile: { multiplicador: 894, moneda: 'CLP' },
    argentina: { multiplicador: 1505, moneda: 'ARS' },
    uruguay: { multiplicador: 38.9, moneda: 'UYU' },
    venezuela: { multiplicador: 50, moneda: 'VES' }
  };

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
    imagen: '',
    activo: true,
    destacado: false,
    nuevo: false,
    
    // Precios por país (auto-calculados)
    precios: {
      internacional: { monto: 0, moneda: 'USD' },
      peru: { monto: 0, moneda: 'PEN' },
      chile: { monto: 0, moneda: 'CLP' },
      argentina: { monto: 0, moneda: 'ARS' },
      uruguay: { monto: 0, moneda: 'UYU' },
      venezuela: { monto: 0, moneda: 'VES' }
    },
    
    // Videos (solo para cursos)
    videos: [],
    
    // Metadatos según tipo
    metadatos: {
      autor: '',
      paginas: 0,
      isbn: '',
      editorial: '',
      añoPublicacion: 0,
      idioma: 'Español',
      version: '',
      compatibilidad: [],
      requisitos: '',
      software: '',
      versionSoftware: '',
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
    },
    
    // Oferta
    oferta: {
      activa: false,
      porcentajeDescuento: 0,
      fechaInicio: '',
      fechaFin: ''
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
      setProducto(data);
    } catch (error) {
      console.error('Error cargando producto:', error);
      setError('Error al cargar producto');
    } finally {
      setCargando(false);
    }
  };

  // Calcular precios automáticamente
  const calcularPreciosPorPais = (precioUSD) => {
    const nuevosPrecios = {};
    Object.keys(TASAS).forEach(pais => {
      nuevosPrecios[pais] = {
        monto: parseFloat((precioUSD * TASAS[pais].multiplicador).toFixed(2)),
        moneda: TASAS[pais].moneda
      };
    });
    return nuevosPrecios;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Si cambió el precio USD, recalcular todos los precios
    if (name === 'precioUSD') {
      const precioUSD = parseFloat(value) || 0;
      const nuevosPrecios = calcularPreciosPorPais(precioUSD);
      setProducto(prev => ({
        ...prev,
        precioUSD,
        precios: nuevosPrecios
      }));
    } else {
      setProducto(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
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

  const handleLimiteChange = (campo, valor) => {
    setProducto(prev => ({
      ...prev,
      limites: {
        ...prev.limites,
        [campo]: valor === '' ? null : parseInt(valor)
      }
    }));
  };

  const handleOfertaChange = (campo, valor) => {
    setProducto(prev => ({
      ...prev,
      oferta: {
        ...prev.oferta,
        [campo]: valor
      }
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

      // Preparar datos para enviar
      const datos = {
        titulo: producto.titulo,
        subtitulo: producto.subtitulo,
        descripcion: producto.descripcion,
        descripcionLarga: producto.descripcionLarga,
        tipo: producto.tipo,
        categoria: producto.categoria,
        precioUSD: producto.precioUSD,
        precios: producto.precios,
        tags: producto.tags,
        incluye: producto.incluye,
        metadatos: producto.metadatos,
        limites: producto.limites,
        oferta: producto.oferta,
        activo: producto.activo,
        destacado: producto.destacado,
        nuevo: producto.nuevo,
        imagen: producto.imagen || 'https://via.placeholder.com/400x300?text=Producto'
      };

      // Crear o actualizar
      if (esEdicion) {
        await productosAPI.actualizar(id, datos);
      } else {
        await productosAPI.crear(datos);
      }

      alert(esEdicion ? 'Producto actualizado exitosamente' : 'Producto creado exitosamente');
      navigate('/admin');
    } catch (error) {
      console.error('Error guardando producto:', error);
      setError(error.response?.data?.error || error.response?.data?.mensaje || 'Error al guardar producto');
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
              <select name="tipo" value={producto.tipo} onChange={handleChange} required>
                {tiposProducto.map(tipo => (
                  <option key={tipo.valor} value={tipo.valor}>{tipo.label}</option>
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
                placeholder="Descripción detallada del producto"
              />
            </div>

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
            <div className="form-group">
              <label>URL de la Imagen</label>
              <input
                type="text"
                name="imagen"
                value={producto.imagen}
                onChange={handleChange}
                placeholder="https://ejemplo.com/imagen.jpg"
              />
              <small>Por ahora, pega la URL de una imagen. Upload de archivos próximamente.</small>
            </div>
            {producto.imagen && (
              <div className="imagen-preview">
                <img src={producto.imagen} alt="Preview" />
              </div>
            )}
          </section>

          {/* ========================================
              PRECIOS (AUTO-CALCULADOS)
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
              <small>💡 Los precios en otras monedas se calculan automáticamente</small>
            </div>

            <div className="precios-grid">
              {Object.keys(producto.precios).map(pais => (
                <div key={pais} className="form-group">
                  <label>
                    {pais.charAt(0).toUpperCase() + pais.slice(1)} ({producto.precios[pais].moneda})
                  </label>
                  <input
                    type="number"
                    value={producto.precios[pais].monto}
                    readOnly
                    style={{ background: 'var(--gris-oscuro)', cursor: 'not-allowed', opacity: 0.7 }}
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
                      onChange={(e) => handleMetadatoChange('paginas', parseInt(e.target.value) || 0)}
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
              <div className="form-row">
                <div className="form-group">
                  <label>Versión</label>
                  <input
                    type="text"
                    value={producto.metadatos.version}
                    onChange={(e) => handleMetadatoChange('version', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Requisitos</label>
                  <input
                    type="text"
                    value={producto.metadatos.requisitos}
                    onChange={(e) => handleMetadatoChange('requisitos', e.target.value)}
                  />
                </div>
              </div>
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
              OFERTA (OPCIONAL)
          ======================================== */}
          <section className="form-section">
            <h2>Oferta (opcional)</h2>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={producto.oferta.activa}
                onChange={(e) => handleOfertaChange('activa', e.target.checked)}
              />
              Activar oferta
            </label>

            {producto.oferta.activa && (
              <div className="form-row">
                <div className="form-group">
                  <label>Porcentaje de Descuento</label>
                  <input
                    type="number"
                    value={producto.oferta.porcentajeDescuento}
                    onChange={(e) => handleOfertaChange('porcentajeDescuento', parseInt(e.target.value) || 0)}
                    min="0"
                    max="100"
                  />
                </div>
                <div className="form-group">
                  <label>Fecha Inicio</label>
                  <input
                    type="date"
                    value={producto.oferta.fechaInicio}
                    onChange={(e) => handleOfertaChange('fechaInicio', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Fecha Fin</label>
                  <input
                    type="date"
                    value={producto.oferta.fechaFin}
                    onChange={(e) => handleOfertaChange('fechaFin', e.target.value)}
                  />
                </div>
              </div>
            )}
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