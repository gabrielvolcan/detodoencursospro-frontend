import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import { ReactReader } from 'react-reader';
import { ChevronLeft, ChevronRight, ArrowLeft, ZoomIn, ZoomOut, Moon, Sun, Bookmark, BookmarkCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { productosAPI } from '../services/api';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import './LectorLibro.css';

// Worker de PDF.js (compatible con Vite)
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

const LectorLibro = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario } = useAuth();

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [info, setInfo] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [epubData, setEpubData] = useState(null);

  const [oscuro, setOscuro] = useState(() => localStorage.getItem('lector:oscuro') !== 'false');

  // PDF
  const [numPaginas, setNumPaginas] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [escala, setEscala] = useState(1);
  const contenedorRef = useRef(null);
  const [anchoPagina, setAnchoPagina] = useState(700);

  // EPUB
  const [locationEpub, setLocationEpub] = useState(null);
  const renditionRef = useRef(null);

  // Marcador manual
  const claveMarca = `lector:${id}:marca`;
  const [marca, setMarca] = useState(() => localStorage.getItem(`lector:${id}:marca`) || null);
  const [aviso, setAviso] = useState('');

  const marcaAgua = usuario?.email || 'Detodo en Cursos';
  const clavePdf = `lector:${id}:pdfPagina`;
  const claveEpub = `lector:${id}:epubCfi`;

  // Ocultar el chat flotante mientras se lee
  useEffect(() => {
    document.body.classList.add('lector-abierto');
    return () => document.body.classList.remove('lector-abierto');
  }, []);

  useEffect(() => {
    localStorage.setItem('lector:oscuro', oscuro ? 'true' : 'false');
  }, [oscuro]);

  // Tema EPUB (cubre html + body para que NO queden bordes claros)
  const aplicarTemaEpub = useCallback((rend, esOscuro) => {
    if (!rend) return;
    rend.themes.register('claro', {
      'html, body': { background: '#ffffff !important', color: '#1a1a1a !important' }
    });
    rend.themes.register('oscuro', {
      'html, body': { background: '#15171a !important', color: '#d6d6d6 !important' },
      'p, span, div, h1, h2, h3, h4, h5, h6, li, a, blockquote, em, strong, td, th': { color: '#d6d6d6 !important' },
      'a': { color: '#5fd9a6 !important' },
      'img': { 'background-color': 'transparent !important' }
    });
    rend.themes.select(esOscuro ? 'oscuro' : 'claro');
  }, []);

  useEffect(() => {
    if (renditionRef.current) aplicarTemaEpub(renditionRef.current, oscuro);
  }, [oscuro, aplicarTemaEpub]);

  // Cargar info + archivo
  useEffect(() => {
    let urlCreada = null;
    const cargar = async () => {
      try {
        setCargando(true);
        const { data: meta } = await productosAPI.libroInfo(id);
        setInfo(meta);
        const { data: blob } = await productosAPI.leerLibroBlob(id);
        if (meta.formato === 'pdf') {
          urlCreada = URL.createObjectURL(blob);
          setPdfFile(urlCreada);
        } else {
          const buf = await blob.arrayBuffer();
          setEpubData(buf);
          const cfiGuardado = localStorage.getItem(claveEpub);
          if (cfiGuardado) setLocationEpub(cfiGuardado);
        }
      } catch (e) {
        console.error('Error abriendo libro:', e);
        setError(e.response?.status === 403
          ? 'No tenés acceso a este libro. Primero tenés que comprarlo.'
          : 'No se pudo abrir el libro.');
      } finally {
        setCargando(false);
      }
    };
    cargar();
    return () => { if (urlCreada) URL.revokeObjectURL(urlCreada); };
  }, [id, claveEpub]);

  useEffect(() => {
    const calcular = () => {
      const w = contenedorRef.current?.clientWidth || 700;
      setAnchoPagina(Math.min(w - 24, 820));
    };
    calcular();
    window.addEventListener('resize', calcular);
    return () => window.removeEventListener('resize', calcular);
  }, [info]);

  const onPdfCargado = ({ numPages }) => {
    setNumPaginas(numPages);
    const guardada = Number.parseInt(localStorage.getItem(clavePdf), 10);
    if (guardada && guardada >= 1 && guardada <= numPages) setPagina(guardada);
  };

  const irAPagina = (nueva) => {
    const p = Math.min(numPaginas || nueva, Math.max(1, nueva));
    setPagina(p);
    localStorage.setItem(clavePdf, String(p));
  };

  // Marcador: guardar la posición actual
  const marcar = () => {
    const valor = info?.formato === 'pdf' ? String(pagina) : (locationEpub || '');
    if (!valor) return;
    localStorage.setItem(claveMarca, valor);
    setMarca(valor);
    setAviso('📑 Página marcada');
    setTimeout(() => setAviso(''), 2000);
  };

  // Marcador: ir a la marca guardada
  const irAMarca = () => {
    if (!marca) return;
    if (info?.formato === 'pdf') irAPagina(Number.parseInt(marca, 10) || 1);
    else setLocationEpub(marca);
    setAviso('Fuiste a tu marca');
    setTimeout(() => setAviso(''), 1500);
  };

  const sinClickDerecho = useCallback((e) => { e.preventDefault(); }, []);

  if (cargando) {
    return (
      <div className="lector-estado">
        <div className="spinner"></div>
        <p>Abriendo el libro…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="lector-estado">
        <p>{error}</p>
        <button className="btn-primary" onClick={() => navigate(-1)}>Volver</button>
      </div>
    );
  }

  const marcaEnPaginaActual = info?.formato === 'pdf' && marca && Number(marca) === pagina;

  return (
    <div className={`lector-page ${oscuro ? 'oscuro' : ''}`} onContextMenu={sinClickDerecho}>
      {/* Barra superior */}
      <div className="lector-topbar">
        <button className="lector-btn" onClick={() => navigate(-1)} title="Volver">
          <ArrowLeft size={18} /> <span className="solo-desktop">Volver</span>
        </button>
        <span className="lector-titulo">{info?.titulo}</span>
        <div className="lector-controles">
          <button className="lector-btn" onClick={marcar} title="Marcar esta página">
            {marcaEnPaginaActual ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
          </button>
          {marca && (
            <button className="lector-btn" onClick={irAMarca} title="Ir a mi marca">
              <span className="solo-desktop">Mi marca</span><span className="solo-mobile">📑</span>
            </button>
          )}
          <button className="lector-btn" onClick={() => setOscuro(o => !o)} title={oscuro ? 'Modo claro' : 'Modo oscuro'}>
            {oscuro ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          {info?.formato === 'pdf' && (
            <>
              <button className="lector-btn" onClick={() => setEscala(s => Math.max(0.6, s - 0.15))} title="Alejar"><ZoomOut size={18} /></button>
              <button className="lector-btn" onClick={() => setEscala(s => Math.min(2.2, s + 0.15))} title="Acercar"><ZoomIn size={18} /></button>
            </>
          )}
        </div>
      </div>

      {aviso && <div className="lector-aviso">{aviso}</div>}

      {/* Marca de agua (disuasor sutil) */}
      <div className="lector-marca-agua" aria-hidden="true">
        {Array.from({ length: 30 }).map((_, i) => (
          <span key={i}>{marcaAgua}</span>
        ))}
      </div>

      {/* Contenido */}
      <div className={`lector-contenido ${oscuro ? 'oscuro' : ''}`} ref={contenedorRef}>
        {info?.formato === 'pdf' && pdfFile && (
          <>
            <Document
              file={pdfFile}
              onLoadSuccess={onPdfCargado}
              onLoadError={() => setError('No se pudo leer el PDF.')}
              loading={<p style={{ color: '#fff' }}>Cargando página…</p>}
            >
              <Page
                pageNumber={pagina}
                width={anchoPagina}
                scale={escala}
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            </Document>

            <div className="lector-paginador">
              <button className="lector-btn" disabled={pagina <= 1} onClick={() => irAPagina(pagina - 1)}>
                <ChevronLeft size={18} /> Anterior
              </button>
              <span>Página {pagina} de {numPaginas || '…'}</span>
              <button className="lector-btn" disabled={pagina >= numPaginas} onClick={() => irAPagina(pagina + 1)}>
                Siguiente <ChevronRight size={18} />
              </button>
            </div>
          </>
        )}

        {info?.formato === 'epub' && epubData && (
          <div className="lector-epub">
            <ReactReader
              url={epubData}
              location={locationEpub}
              locationChanged={(loc) => {
                setLocationEpub(loc);
                if (loc) localStorage.setItem(claveEpub, loc);
              }}
              getRendition={(rend) => {
                renditionRef.current = rend;
                aplicarTemaEpub(rend, oscuro);
              }}
              epubOptions={{ flow: 'paginated' }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default LectorLibro;
