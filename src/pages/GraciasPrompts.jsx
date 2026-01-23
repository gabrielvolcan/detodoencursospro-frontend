import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, CheckCircle, BookOpen, ArrowRight, Sparkles } from 'lucide-react';
import { usePais } from '../context/PaisContext';
import { cursosAPI } from '../services/api';
import './GraciasPrompts.css';

const GraciasPrompts = () => {
  const navigate = useNavigate();
  const { obtenerPrecio } = usePais();
  const [cursoIA, setCursoIA] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarCursoIA();
  }, []);

  const cargarCursoIA = async () => {
    try {
      // Buscar el curso de IA (ajusta el título según tu curso real)
      const { data } = await cursosAPI.obtenerTodos();
      const curso = data.find(c => 
        c.titulo.toLowerCase().includes('inteligencia artificial') ||
        c.titulo.toLowerCase().includes('ia') ||
        c._id === 'TU_ID_DEL_CURSO_IA' // Reemplaza con el ID real si lo tienes
      );
      setCursoIA(curso);
    } catch (error) {
      console.error('Error cargando curso:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gracias-prompts-page">
      <div className="gracias-container">
        
        {/* CONFIRMACIÓN */}
        <div className="confirmacion-box">
          <div className="icono-exito">
            <CheckCircle size={64} />
          </div>
          <h1>¡Todo listo! 🎉</h1>
          <p className="mensaje-principal">
            Ya tienes acceso a los <strong>30 Prompts de IA</strong> para comenzar a usar inteligencia artificial en tu día a día.
          </p>
          
          <button 
            className="btn-acceder-prompts"
            onClick={() => navigate('/mis-cursos')}
          >
            <BookOpen size={20} />
            Acceder a mis Prompts
          </button>
        </div>

        {/* SEPARADOR */}
        <div className="separador-suave">
          <span>El siguiente paso</span>
        </div>

        {/* RECOMENDACIÓN CURSO */}
        {!loading && cursoIA ? (
          <div className="recomendacion-curso">
            <div className="badge-recomendado">
              <Sparkles size={16} />
              Recomendado para ti
            </div>
            
            <div className="curso-detalle">
              <div className="curso-imagen-wrapper">
                <img 
                  src={cursoIA.imagen} 
                  alt={cursoIA.titulo}
                  className="curso-imagen"
                />
              </div>
              
              <div className="curso-info">
                <h2>{cursoIA.titulo}</h2>
                <p className="curso-descripcion">
                  {cursoIA.descripcionCorta || 'Domina la inteligencia artificial desde cero y lleva tus habilidades al siguiente nivel.'}
                </p>
                
                <div className="curso-beneficios">
                  <div className="beneficio-item">
                    <CheckCircle size={18} />
                    <span>Más de {cursoIA.cantidadClases || 20} clases prácticas</span>
                  </div>
                  <div className="beneficio-item">
                    <CheckCircle size={18} />
                    <span>Certificado al completar</span>
                  </div>
                  <div className="beneficio-item">
                    <CheckCircle size={18} />
                    <span>Acceso de por vida</span>
                  </div>
                </div>

                <div className="curso-footer">
                  <div className="precio-info">
                    <span className="precio-actual">
                      {obtenerPrecio(cursoIA.precioUSD, cursoIA.precios)}
                    </span>
                    <span className="texto-precio">Inversión única</span>
                  </div>
                  
                  <button 
                    className="btn-ver-curso"
                    onClick={() => navigate(`/curso/${cursoIA._id}`)}
                  >
                    Ver curso completo
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            </div>

            <p className="nota-suave">
              💡 Los prompts que acabas de recibir son perfectos para comenzar. Este curso te enseña cómo crear tus propios prompts profesionales y sacarle el máximo provecho a la IA.
            </p>
          </div>
        ) : (
          <div className="loading-curso">
            <p>Cargando recomendación...</p>
          </div>
        )}

        {/* VOLVER AL INICIO */}
        <button 
          className="btn-volver-inicio"
          onClick={() => navigate('/')}
        >
          Volver al inicio
        </button>
      </div>
    </div>
  );
};

export default GraciasPrompts;