import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CarritoProvider } from './context/CarritoContext';
import { PaisProvider } from './context/PaisContext';
import Header from './components/Header';
import Footer from './components/Footer';
import ChatbotFAQ from './components/ChatbotFAQ';
import RouteTracker from './components/RouteTracker';

// 🚀 Carga diferida (code-splitting): cada página se descarga solo al visitarla.
const Home = lazy(() => import('./pages/Home'));
const ComoComprar = lazy(() => import('./pages/ComoComprar'));
const Cursos = lazy(() => import('./pages/Cursos'));
const DetalleCurso = lazy(() => import('./pages/DetalleCurso'));
const Carrito = lazy(() => import('./pages/Carrito'));
const CheckoutManual = lazy(() => import('./pages/CheckoutManual'));
const MisCompras = lazy(() => import('./pages/MisCompras'));
const MisCursos = lazy(() => import('./pages/MisCursos'));
const AprendeCurso = lazy(() => import('./pages/AprendeCurso'));
const Login = lazy(() => import('./pages/Login'));
const Registro = lazy(() => import('./pages/Registro'));
const RecuperarContraseña = lazy(() => import('./pages/RecuperarContraseña'));
const RestablecerContraseña = lazy(() => import('./pages/RestablecerContraseña'));
const VerificarEmail = lazy(() => import('./pages/VerificarEmail'));
const Admin = lazy(() => import('./pages/Admin'));
const CursoForm = lazy(() => import('./pages/CursoForm'));
const Certificado = lazy(() => import('./pages/Certificado'));
const VerificarCertificado = lazy(() => import('./pages/VerificarCertificado'));
const EmailMasivo = lazy(() => import('./pages/EmailMasivo'));
const GraciasPrompts = lazy(() => import('./pages/GraciasPrompts'));
const Productos = lazy(() => import('./pages/Productos'));
const ProductoDetalle = lazy(() => import('./pages/ProductoDetalle'));
const LectorLibro = lazy(() => import('./pages/LectorLibro'));
const Legales = lazy(() => import('./pages/Legales'));
const ProductoForm = lazy(() => import('./pages/ProductoForm'));

// Loader mientras se verifica la sesión (evita rebotes antes de cargar el usuario)
const CargandoSesion = () => (
  <div className="loading-container" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div className="spinner"></div>
  </div>
);

// Componente para rutas privadas
const PrivateRoute = ({ children }) => {
  const { usuario, cargando } = useAuth();
  if (cargando) return <CargandoSesion />;
  return usuario ? children : <Navigate to="/login" />;
};

// Componente para rutas de admin
const AdminRoute = ({ children }) => {
  const { usuario, cargando } = useAuth();
  if (cargando) return <CargandoSesion />;
  return usuario && usuario.rol === 'admin' ? children : <Navigate to="/" />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <CarritoProvider>
          <PaisProvider>
            <div className="app">
              <RouteTracker />
              <Header />
              <main>
                <Suspense fallback={<CargandoSesion />}>
                <Routes>
                  {/* ========================================
                      RUTAS PÚBLICAS - HOME
                  ======================================== */}
                  <Route path="/" element={<Home />} />
                  
                  {/* ========================================
                      ✅ PRODUCTOS DIGITALES (Sistema nuevo - ACTIVO)
                  ======================================== */}
                  <Route path="/productos" element={<Productos />} />
                  <Route path="/producto/:id" element={<ProductoDetalle />} />
                  
                  {/* ========================================
                      CURSOS (Sistema actual - mantener)
                  ======================================== */}
                  <Route path="/como-comprar" element={<ComoComprar />} />
                  <Route path="/cursos" element={<Cursos />} />
                  <Route path="/curso/:id" element={<DetalleCurso />} />
                  
                  {/* 🆕 VERIFICAR CERTIFICADO (Pública - para que cualquiera pueda verificar) */}
                  <Route path="/verificar-certificado/:codigo" element={<VerificarCertificado />} />
                  
                  {/* 🆕 PÁGINA DE GRACIAS PROMPTS */}
                  <Route path="/gracias-prompts" element={<GraciasPrompts />} />
                  
                  {/* ========================================
                      AUTH - RUTAS PRINCIPALES (sin ñ)
                  ======================================== */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/registro" element={<Registro />} />
                  <Route path="/recuperar-contrasena" element={<RecuperarContraseña />} />
                  <Route path="/restablecer-contrasena/:token" element={<RestablecerContraseña />} />
                  <Route path="/verificar-email/:token" element={<VerificarEmail />} />
                  
                  {/* ✅ RUTAS ALTERNATIVAS CON Ñ (para compatibilidad) */}
                  <Route path="/recuperar-contraseña" element={<RecuperarContraseña />} />
                  <Route path="/restablecer-contraseña/:token" element={<RestablecerContraseña />} />
                  
                  {/* ========================================
                      RUTAS PRIVADAS (requieren login)
                  ======================================== */}
                  <Route path="/carrito" element={<Carrito />} />
                  <Route path="/checkout" element={<PrivateRoute><CheckoutManual /></PrivateRoute>} />
                  <Route path="/mis-compras" element={<PrivateRoute><MisCompras /></PrivateRoute>} />
                  <Route path="/leer/:id" element={<PrivateRoute><LectorLibro /></PrivateRoute>} />
                  <Route path="/mis-cursos-aprender" element={<PrivateRoute><MisCursos /></PrivateRoute>} />
                  <Route path="/certificado/:cursoId" element={<PrivateRoute><Certificado /></PrivateRoute>} />
                  
                  {/* 🎥 Reproductor de curso */}
                  <Route path="/aprender/:cursoId" element={<PrivateRoute><AprendeCurso /></PrivateRoute>} />
                  
                  {/* ========================================
                      RUTAS DE ADMIN - CURSOS (actual)
                  ======================================== */}
                  <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
                  <Route path="/admin/curso/nuevo" element={<AdminRoute><CursoForm /></AdminRoute>} />
                  <Route path="/admin/curso/:id/editar" element={<AdminRoute><CursoForm /></AdminRoute>} />
                  <Route path="/admin/email-masivo" element={<AdminRoute><EmailMasivo /></AdminRoute>} />
                  
                  {/* ========================================
                      ✅ RUTAS DE ADMIN - PRODUCTOS (nuevo - ACTIVO)
                  ======================================== */}
                  <Route path="/admin/producto/nuevo" element={<AdminRoute><ProductoForm /></AdminRoute>} />
                  <Route path="/admin/producto/:id/editar" element={<AdminRoute><ProductoForm /></AdminRoute>} />

                  {/* 📄 PÁGINAS LEGALES */}
                  <Route path="/terminos" element={<Legales documento="terminos" />} />
                  <Route path="/privacidad" element={<Legales documento="privacidad" />} />
                  <Route path="/reembolsos" element={<Legales documento="reembolsos" />} />
                </Routes>
                </Suspense>
              </main>

              <Footer />

              {/* 🤖 Chatbot flotante (visible en todas las páginas) */}
              <ChatbotFAQ />
            </div>
          </PaisProvider>
        </CarritoProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
