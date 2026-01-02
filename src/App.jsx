import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CarritoProvider } from './context/CarritoContext';
import { PaisProvider } from './context/PaisContext';
import Header from './components/Header';
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
import Admin from './pages/Admin';
import CursoForm from './pages/CursoForm';

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
                      RUTAS PÚBLICAS
                  ======================================== */}
                  <Route path="/" element={<Home />} />
                  <Route path="/cursos" element={<Cursos />} />
                  <Route path="/curso/:id" element={<DetalleCurso />} />
                  
                  {/* Auth */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/registro" element={<Registro />} />
                  <Route path="/recuperar-contraseña" element={<RecuperarContraseña />} />
                  <Route path="/restablecer-contraseña/:token" element={<RestablecerContraseña />} />
                  
                  {/* ========================================
                      RUTAS PRIVADAS (requieren login)
                  ======================================== */}
                  <Route path="/carrito" element={<PrivateRoute><Carrito /></PrivateRoute>} />
                  <Route path="/checkout" element={<PrivateRoute><CheckoutManual /></PrivateRoute>} />
                  <Route path="/mis-compras" element={<PrivateRoute><MisCompras /></PrivateRoute>} />
                  <Route path="/mis-cursos-aprender" element={<PrivateRoute><MisCursos /></PrivateRoute>} />
                  
                  {/* 🎥 Reproductor de curso */}
                  <Route path="/aprender/:cursoId" element={<PrivateRoute><AprendeCurso /></PrivateRoute>} />
                  
                  {/* ========================================
                      RUTAS DE ADMIN
                  ======================================== */}
                  <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
                  <Route path="/admin/curso/nuevo" element={<AdminRoute><CursoForm /></AdminRoute>} />
                  <Route path="/admin/curso/:id/editar" element={<AdminRoute><CursoForm /></AdminRoute>} />
                </Routes>
              </main>
            </div>
          </PaisProvider>
        </CarritoProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
