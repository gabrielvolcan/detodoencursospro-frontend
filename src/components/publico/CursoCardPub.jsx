import { useNavigate } from 'react-router-dom';
import { Users, Award, ShoppingCart, BookOpen } from 'lucide-react';
import { usePais } from '../../context/PaisContext';
import { useCarrito } from '../../context/CarritoContext';
import PubThumb from './PubThumb';

const CursoCardPub = ({ curso, index = 0 }) => {
  const navigate = useNavigate();
  const { precioDeItem } = usePais();
  const { agregarAlCarrito } = useCarrito();
  const free = curso.esGratuito || curso.precioUSD === 0;
  const ver = () => navigate(`/curso/${curso._id}`);

  return (
    <article className="card card-h ccard">
      <PubThumb src={curso.imagen} alt={curso.titulo} index={index} icon={BookOpen} className="thumb pointer" onClick={ver} />
      <div className="ccard-bd">
        <span className="pill pill-d upper xs" style={{ alignSelf: 'flex-start' }}>{curso.categoria}</span>
        <h3 className="h3 pointer" style={{ margin: '14px 0 9px' }} onClick={ver}>{curso.titulo}</h3>
        <p className="muted sm" style={{ lineHeight: 1.55, margin: '0 0 16px' }}>{curso.descripcionCorta || ''}</p>
        <div className="ccard-meta">
          <span className="mi"><Users className="ic ic-s" />{curso.estudiantes || 0} estudiantes</span>
          {curso.nivel && <span className="mi"><Award className="ic ic-s" />{curso.nivel}</span>}
        </div>
        <div className="rule" style={{ margin: '16px 0' }}></div>
        <div className="fx ac jb" style={{ marginTop: 'auto', gap: 10 }}>
          <span className={free ? 'price-free' : 'price'}>{free ? 'GRATIS' : precioDeItem(curso).formatted}</span>
          {free
            ? <button className="btn btnp btn-sm" onClick={ver}>Inscribirme</button>
            : <button className="btn btnp btn-sm" onClick={() => agregarAlCarrito(curso)}><ShoppingCart className="ic ic-s" />Agregar</button>}
        </div>
      </div>
    </article>
  );
};

export default CursoCardPub;
