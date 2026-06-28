import { useNavigate } from 'react-router-dom';
import { Package } from 'lucide-react';
import { usePais } from '../../context/PaisContext';
import PubThumb from './PubThumb';

const ProductoCardPub = ({ producto, index = 0 }) => {
  const navigate = useNavigate();
  const { precioDeItem } = usePais();
  const free = producto.gratis || producto.precioUSD === 0;
  const ver = () => navigate(`/producto/${producto._id}`);

  return (
    <article className="card card-h ccard">
      <PubThumb src={producto.imagen} alt={producto.titulo} index={index + 3} icon={Package} className="thumb pointer" onClick={ver} />
      <div className="ccard-bd">
        <span className="pill pill-d upper xs" style={{ alignSelf: 'flex-start' }}>{producto.tipo || 'Producto'}</span>
        <h3 className="h3 pointer" style={{ margin: '14px 0 9px' }} onClick={ver}>{producto.titulo}</h3>
        <p className="muted sm" style={{ lineHeight: 1.55, margin: '0 0 16px' }}>{(producto.descripcion || '').substring(0, 90)}</p>
        <div className="rule" style={{ margin: '0 0 16px' }}></div>
        <div className="fx ac jb" style={{ marginTop: 'auto', gap: 10 }}>
          <span className={free ? 'price-free' : 'price'}>{free ? 'GRATIS' : precioDeItem(producto).formatted}</span>
          <button className="btn btnp btn-sm" onClick={ver}>Ver detalles</button>
        </div>
      </div>
    </article>
  );
};

export default ProductoCardPub;
