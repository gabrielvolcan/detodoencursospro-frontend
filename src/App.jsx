import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CarritoProvider } from './context/CarritoContext';
import { PaisProvider } from './context/PaisContext';
import Header from './components/Header';
import ChatbotFAQ from './components/ChatbotFAQ';
import Home from './pages/Home';
import Cursos from './pages/Cursos';
import DetalleCurso from './pages/DetalleCurso';
import Carrito from './pages/Carrito';
import CheckoutManual from './pages/CheckoutManual';
import MisCompras from './pages/MisCompras';
import MisCursos from './pages/MisCursos';
import AprendeCurso from './pages/AprendeCurso';
import Login from './pages/Login';
import Registro from './pages/Registro';
import RecuperarContraseña from './pages/RecuperarContraseña';
import RestablecerContraseña from './pages/RestablecerContraseña';
import VerificarEmail from './pages/VerificarEmail';
import Admin from './pages/Admin';
import CursoForm from './pages/CursoForm';
import Certificado from './pages/Certificado';
import VerificarCertificado from './pages/VerificarCertificado';
import EmailMasivo from './pages/EmailMasivo';

// ✅ COMPONENTES DE PRODUCTOS (ahora activos)
import Productos from './pages/Productos';
import ProductoDetalle from './pages/ProductoDetalle';
import ProductoForm from './pages/ProductoForm';

// Componente para rutas privadas
const PrivateRoute = ({ children }) => {
  const { usuario } = useAuth();
  return usuario ? children : <Navigate to="/login" />;
};

// Componente para rutas de admin
const AdminRoute = ({ children }) => {
  const { usuario } = useAuth();
  return usuario && usuario.rol === 'admin' ? children : <Navigate to="/" />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <CarritoProvider>
          <PaisProvider>
            <div className="app">
              <Header />
              <main>
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
                  <Route path="/cursos" element={<Cursos />} />
                  <Route path="/curso/:id" element={<DetalleCurso />} />
                  
                  {/* 🆕 VERIFICAR CERTIFICADO (Pública - para que cualquiera pueda verificar) */}
                  <Route path="/verificar-certificado/:codigo" element={<VerificarCertificado />} />
                  
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
                  <Route path="/carrito" element={<PrivateRoute><Carrito /></PrivateRoute>} />
                  <Route path="/checkout" element={<PrivateRoute><CheckoutManual /></PrivateRoute>} />
                  <Route path="/mis-compras" element={<PrivateRoute><MisCompras /></PrivateRoute>} />
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
                </Routes>
              </main>
              
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
