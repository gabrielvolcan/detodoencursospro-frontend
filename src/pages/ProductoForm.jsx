import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productosAPI } from '../services/api';
import { Save, ArrowLeft, FileText, Link2, DollarSign } from 'lucide-react';
import './ProductoForm.css';

const ProductoForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const esEdicion = Boolean(id);

  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  // Estado del formulario con campo de descarga
  const [producto, setProducto] = useState({
    titulo: '',
    descripcion: '',
    tipo: 'libro',
    categoria: '',
    imagen: '',
    precioUSD: 0,
    archivoURL: '', // ⭐ NUEVO: URL del archivo descargable
    archivoPeso: ''  // OPCIONAL: Tamaño del archivo (ej: "5 MB")
  });

  // Tipos de producto
  const tiposProducto = [
    { valor: 'libro', label: '📚 Libro PDF' },
    { valor: 'ebook', label: '📖 Ebook Digital' },
    { valor: 'curso', label: '🎓 Curso' },
    { valor: 'plantilla', label: '📄 Plantilla' },
    { valor: 'guia', label: '📋 Guía' },
    { valor: 'software', label: '💻 Software' },
    { valor: 'recurso', label: '🎨 Recurso' },
    { valor: 'bundle', label: '📦 Bundle' }
  ];

  useEffect(() => {
    if (esEdicion) {
      cargarProducto();
    }
  }, [id]);

  const cargarProducto = async () => {
    try {
      setCargando(true);
      // Endpoint admin: trae el producto completo (incluye archivoURL, que el endpoint público oculta)
      const { data } = await productosAPI.obtenerPorIdAdmin(id);
      setProducto({
        titulo: data.titulo || '',
        descripcion: data.descripcion || '',
        tipo: data.tipo || 'libro',
        categoria: data.categoria || '',
        imagen: data.imagen || '',
        precioUSD: data.precioUSD || 0,
        archivoURL: data.archivoURL || '',
        archivoPeso: data.archivoPeso || ''
      });
    } catch (error) {
      console.error('Error cargando producto:', error);
      setError('Error al cargar producto');
    } finally {
      setCargando(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProducto(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setGuardando(true);
      setError('');

      // Validación
      if (!producto.titulo.trim()) {
        setError('El título es obligatorio');
        return;
      }
      if (!producto.descripcion.trim()) {
        setError('La descripción es obligatoria');
        return;
      }
      if (!producto.categoria.trim()) {
        setError('La categoría es obligatoria');
        return;
      }
      if (!producto.archivoURL.trim()) {
        setError('La URL del archivo descargable es obligatoria');
        return;
      }

      // Preparar datos
      const datos = {
        titulo: producto.titulo.trim(),
        descripcion: producto.descripcion.trim(),
        tipo: producto.tipo,
        categoria: producto.categoria.trim(),
        imagen: producto.imagen.trim() || 'https://via.placeholder.com/400x300?text=Producto',
        precioUSD: parseFloat(producto.precioUSD) || 0,
        archivoURL: producto.archivoURL.trim(),
        archivoPeso: producto.archivoPeso.trim() || ''
      };

      console.log('📤 Enviando datos:', datos);

      // Crear o actualizar
      if (esEdicion) {
        await productosAPI.actualizar(id, datos);
      } else {
        await productosAPI.crear(datos);
      }

      alert(esEdicion ? 'Producto actualizado' : 'Producto creado exitosamente');
      navigate('/admin');
    } catch (error) {
      console.error('Error guardando producto:', error);
      setError(error.response?.data?.mensaje || 'Error al guardar producto');
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
          <h1>{esEdicion ? '✏️ Editar Producto' : '➕ Crear Producto'}</h1>
        </div>

        {error && <div className="error-message">⚠️ {error}</div>}

        <form onSubmit={handleSubmit} className="producto-form">
          
          {/* INFORMACIÓN BÁSICA */}
          <section className="form-section">
            <h2><FileText size={20} /> Información Básica</h2>
            
            {/* TIPO */}
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

            {/* TÍTULO */}
            <div className="form-group">
              <label>Título *</label>
              <input
                type="text"
                name="titulo"
                value={producto.titulo}
                onChange={handleChange}
                required
                placeholder="Ej: Curso Completo de React"
              />
            </div>

            {/* DESCRIPCIÓN */}
            <div className="form-group">
              <label>Descripción *</label>
              <textarea
                name="descripcion"
                value={producto.descripcion}
                onChange={handleChange}
                required
                rows={5}
                placeholder="Describe tu producto, qué incluye, qué aprenderán, etc..."
              />
            </div>

            {/* CATEGORÍA */}
            <div className="form-group">
              <label>Categoría *</label>
              <input
                type="text"
                name="categoria"
                value={producto.categoria}
                onChange={handleChange}
                required
                placeholder="Ej: Programación, Diseño, Marketing"
              />
            </div>
          </section>

          {/* ARCHIVOS Y MULTIMEDIA */}
          <section className="form-section">
            <h2><Link2 size={20} /> Archivos y Multimedia</h2>
            
            {/* URL DEL ARCHIVO DESCARGABLE - ⭐ NUEVO */}
            <div className="form-group">
              <label>URL del Archivo Descargable * 🎯</label>
              <input
                type="url"
                name="archivoURL"
                value={producto.archivoURL}
                onChange={handleChange}
                required
                placeholder="https://drive.google.com/file/d/xxx o https://tu-servidor.com/archivo.pdf"
              />
              <small className="help-text">
                📥 Este es el link que recibirán los clientes después de comprar. 
                Puede ser de Google Drive, Dropbox, tu servidor, etc.
              </small>
            </div>

            {/* TAMAÑO DEL ARCHIVO - OPCIONAL */}
            <div className="form-group">
              <label>Tamaño del Archivo (opcional)</label>
              <input
                type="text"
                name="archivoPeso"
                value={producto.archivoPeso}
                onChange={handleChange}
                placeholder="Ej: 5 MB, 150 MB, 1.2 GB"
              />
              <small className="help-text">
                📊 Ayuda a los usuarios a saber cuánto espacio necesitarán
              </small>
            </div>

            {/* IMAGEN DE PORTADA */}
            <div className="form-group">
              <label>URL de Imagen de Portada</label>
              <input
                type="url"
                name="imagen"
                value={producto.imagen}
                onChange={handleChange}
                placeholder="https://ejemplo.com/portada.jpg"
              />
              <small className="help-text">
                🖼️ Opcional - se usará imagen por defecto si se deja vacío
              </small>
            </div>
            
            {producto.imagen && (
              <div className="imagen-preview">
                <img src={producto.imagen} alt="Preview" />
                <p className="preview-label">Vista previa de la portada</p>
              </div>
            )}
          </section>

          {/* PRECIO */}
          <section className="form-section">
            <h2><DollarSign size={20} /> Precio</h2>
            
            <div className="form-group">
              <label>Precio en USD *</label>
              <input
                type="number"
                name="precioUSD"
                value={producto.precioUSD}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                placeholder="0.00"
              />
              <small className="help-text">
                💵 El precio se convertirá automáticamente a la moneda local del comprador
              </small>
            </div>
          </section>

          {/* BOTONES */}
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
              {guardando ? 'Guardando...' : esEdicion ? 'Actualizar Producto' : 'Crear Producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductoForm;