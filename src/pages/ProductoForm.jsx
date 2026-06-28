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
    subtitulo: '',          // frase corta de gancho
    descripcionLarga: '',   // contenido extenso para la preventa
    tipo: 'libro',
    categoria: '',
    imagen: '',
    imagenes: [],           // galería: fotos adicionales del libro/producto
    incluye: [],            // "Lo que incluye": lista de bullets
    precioUSD: 0,
    archivoURL: '', // ⭐ NUEVO: URL del archivo descargable
    archivoPeso: ''  // OPCIONAL: Tamaño del archivo (ej: "5 MB")
  });

  // 📖 Archivo del libro (PDF/EPUB) para el lector en plataforma
  const [libroArchivo, setLibroArchivo] = useState(null);
  const [libroActual, setLibroActual] = useState(null); // info del libro ya subido (al editar)

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
        subtitulo: data.subtitulo || '',
        descripcionLarga: data.descripcionLarga || '',
        tipo: data.tipo || 'libro',
        categoria: data.categoria || '',
        imagen: data.imagen || '',
        imagenes: Array.isArray(data.imagenes) ? data.imagenes : [],
        incluye: Array.isArray(data.incluye) ? data.incluye.map((i) => (typeof i === 'string' ? i : (i?.texto || ''))).filter(Boolean) : [],
        precioUSD: data.precioUSD || 0,
        archivoURL: data.archivoURL || '',
        archivoPeso: data.archivoPeso || ''
      });
      if (data.libro?.archivoId) setLibroActual(data.libro);
    } catch (error) {
      console.error('Error cargando producto:', error);
      setError('Error al cargar producto');
    } finally {
      setCargando(false);
    }
  };

  // Helpers para listas dinámicas (galería de imágenes, "lo que incluye")
  const updateLista = (campo, idx, val) => setProducto((prev) => {
    const arr = [...prev[campo]]; arr[idx] = val; return { ...prev, [campo]: arr };
  });
  const addLista = (campo) => setProducto((prev) => ({ ...prev, [campo]: [...prev[campo], ''] }));
  const removeLista = (campo, idx) => setProducto((prev) => ({ ...prev, [campo]: prev[campo].filter((_, i) => i !== idx) }));

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
      // archivoURL es opcional: puede ser un producto de solo lectura (libro en plataforma)

      // Preparar datos
      const datos = {
        titulo: producto.titulo.trim(),
        descripcion: producto.descripcion.trim(),
        subtitulo: producto.subtitulo.trim(),
        descripcionLarga: producto.descripcionLarga.trim(),
        tipo: producto.tipo,
        categoria: producto.categoria.trim(),
        imagen: producto.imagen.trim() || 'https://via.placeholder.com/400x300?text=Producto',
        imagenes: (producto.imagenes || []).map((u) => u.trim()).filter(Boolean),
        incluye: (producto.incluye || []).map((t) => t.trim()).filter(Boolean),
        precioUSD: parseFloat(producto.precioUSD) || 0,
        archivoURL: producto.archivoURL.trim(),
        archivoPeso: producto.archivoPeso.trim() || ''
      };

      // Crear o actualizar (capturamos el id para subir el libro si hace falta)
      let productoId = id;
      if (esEdicion) {
        await productosAPI.actualizar(id, datos);
      } else {
        const { data } = await productosAPI.crear(datos);
        productoId = data?.producto?._id;
      }

      // Subir el libro (PDF/EPUB) para el lector en plataforma, si se eligió uno
      if (libroArchivo && productoId) {
        const fd = new FormData();
        fd.append('libro', libroArchivo);
        try {
          await productosAPI.subirLibro(productoId, fd);
        } catch (errLibro) {
          console.error('Error subiendo el libro:', errLibro);
          alert('El producto se guardó, pero hubo un error subiendo el libro. Probá de nuevo editándolo.');
          navigate('/admin');
          return;
        }
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
            
            {/* URL DEL ARCHIVO DESCARGABLE (opcional) */}
            <div className="form-group">
              <label>URL del Archivo Descargable (opcional)</label>
              <input
                type="url"
                name="archivoURL"
                value={producto.archivoURL}
                onChange={handleChange}
                placeholder="https://drive.google.com/file/d/xxx o https://tu-servidor.com/archivo.pdf"
              />
              <small className="help-text">
                📥 Link de descarga que recibe el cliente. Dejalo vacío si el producto es
                un libro de <strong>solo lectura</strong> (lo subís abajo y se lee en la web).
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

            {/* 📖 LIBRO PARA LECTOR EN PLATAFORMA (solo lectura) */}
            <div className="form-group">
              <label>📖 Libro para leer en la plataforma (PDF o EPUB)</label>
              <input
                type="file"
                accept=".pdf,.epub,application/pdf,application/epub+zip"
                onChange={(e) => setLibroArchivo(e.target.files[0] || null)}
              />
              <small className="help-text">
                El cliente lo lee dentro de la web (con marca de agua), <strong>sin descargarlo</strong>.
                {libroActual?.archivoId && (
                  <> Ya hay un libro cargado: <strong>{libroActual.nombreOriginal} ({libroActual.formato?.toUpperCase()})</strong>. Subí otro para reemplazarlo.</>
                )}
                {libroArchivo && <> · Seleccionado: <strong>{libroArchivo.name}</strong></>}
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

            {/* GALERÍA: fotos adicionales del libro/producto */}
            <div className="form-group">
              <label>📸 Galería de fotos (adicionales a la portada)</label>
              <small className="help-text" style={{ display: 'block', marginBottom: 10 }}>
                Agregá 2 o más fotos (interior del libro, contraportada, detalles…) para dar más confianza al comprador.
              </small>
              {(producto.imagenes || []).map((url, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                  {url ? <img src={url} alt={`Foto ${i + 1}`} style={{ width: 46, height: 46, objectFit: 'cover', borderRadius: 8, flex: 'none' }} /> : null}
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => updateLista('imagenes', i, e.target.value)}
                    placeholder={`https://ejemplo.com/foto-${i + 1}.jpg`}
                    style={{ flex: 1 }}
                  />
                  <button type="button" onClick={() => removeLista('imagenes', i)} className="btn-secundario" style={{ flex: 'none' }}>✕</button>
                </div>
              ))}
              <button type="button" onClick={() => addLista('imagenes')} className="btn-secundario">+ Agregar foto</button>
            </div>
          </section>

          {/* CONTENIDO DE PREVENTA */}
          <section className="form-section">
            <h2>📝 Contenido de la página de venta</h2>

            <div className="form-group">
              <label>Subtítulo / frase de gancho</label>
              <input
                type="text"
                name="subtitulo"
                value={producto.subtitulo}
                onChange={handleChange}
                placeholder="Ej: La guía definitiva para empezar hoy"
              />
            </div>

            <div className="form-group">
              <label>Descripción larga (detalles, qué aprenderás, para quién es…)</label>
              <textarea
                name="descripcionLarga"
                value={producto.descripcionLarga}
                onChange={handleChange}
                rows={6}
                placeholder="Contá de qué trata, qué incluye, beneficios, a quién está dirigido. Cuanto más completo, más vende."
              />
            </div>

            <div className="form-group">
              <label>✅ Lo que incluye (bullets)</label>
              {(producto.incluye || []).map((txt, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <input
                    type="text"
                    value={txt}
                    onChange={(e) => updateLista('incluye', i, e.target.value)}
                    placeholder="Ej: Acceso inmediato de por vida"
                    style={{ flex: 1 }}
                  />
                  <button type="button" onClick={() => removeLista('incluye', i)} className="btn-secundario" style={{ flex: 'none' }}>✕</button>
                </div>
              ))}
              <button type="button" onClick={() => addLista('incluye')} className="btn-secundario">+ Agregar ítem</button>
            </div>
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