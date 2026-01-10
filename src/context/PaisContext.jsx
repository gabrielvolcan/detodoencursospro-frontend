import { Globe } from 'lucide-react';
import { usePais } from '../context/PaisContext';
import './PaisSelector.css';

const PaisSelector = () => {
  const { paisSeleccionado, setPaisSeleccionado, paises, obtenerPaisActual } = usePais();
  const paisActual = obtenerPaisActual();

  return (
    <div className="pais-selector">
      <button className="pais-button">
        <Globe size={18} />
        <span className="pais-bandera">{paisActual.bandera}</span>
        <span className="pais-nombre-mobile">{paisActual.nombre}</span>
      </button>
      <div className="pais-dropdown">
        {paises.map(pais => (
          <button
            key={pais.codigo}
            className={`pais-option ${paisSeleccionado === pais.codigo ? 'activo' : ''}`}
            onClick={() => setPaisSeleccionado(pais.codigo)}
          >
            <span className="pais-bandera">{pais.bandera}</span>
            <span>{pais.nombre}</span>
            {paisSeleccionado === pais.codigo && <span className="check">✓</span>}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PaisSelector;
