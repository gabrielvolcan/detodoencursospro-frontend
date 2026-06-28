// Miniatura: usa la imagen real si existe; si no, un gradiente con iniciales.
const GRADS = ['g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7', 'g8'];

export const gradFor = (i = 0) => GRADS[i % 8];

export const inicialesDe = (t) =>
  (t || '')
    .replace(/[^A-Za-z0-9 ]/g, '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0] || '')
    .join('')
    .toUpperCase() || '?';

const Thumb = ({ src, title, index = 0 }) => {
  if (src) return <img className="thumb" src={src} alt={title || ''} />;
  return <div className={`thumb ${gradFor(index)}`}>{inicialesDe(title)}</div>;
};

export default Thumb;
