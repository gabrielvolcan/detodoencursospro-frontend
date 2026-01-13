// src/components/SoporteFlotante.jsx
import { MessageCircle, Mail, X } from 'lucide-react';
import { useState } from 'react';
import './SoporteFlotante.css';

const SoporteFlotante = () => {
  const [abierto, setAbierto] = useState(false);

  return (
    <>
      {/* Botón flotante */}
      <button 
        className="soporte-btn-flotante"
        onClick={() => setAbierto(!abierto)}
        aria-label="Soporte"
      >
        {abierto ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* Panel de soporte */}
      {abierto && (
        <div className="soporte-panel">
          <h3>¿Necesitas ayuda?</h3>
          <p>Estamos aquí para ayudarte</p>
          
          <a 
            href="mailto:contacto@detodoencursos.com" 
            className="soporte-email-btn"
          >
            <Mail size={20} />
            <span>contacto@detodoencursos.com</span>
          </a>
          
          <p className="soporte-horario">
            Respondemos en menos de 24 horas
          </p>
        </div>
      )}
    </>
  );
};

export default SoporteFlotante;