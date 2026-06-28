import { BookOpen } from 'lucide-react';

const GRADS = ['g-1', 'g-2', 'g-3', 'g-4', 'g-5', 'g-6'];

// Miniatura para tarjetas públicas: imagen real si existe, si no gradiente + icono.
const PubThumb = ({ src, alt, index = 0, icon: Icon = BookOpen, className = 'thumb' }) => (
  <div className={`${className}${src ? '' : ' ' + GRADS[index % GRADS.length]}`}>
    {src ? <img src={src} alt={alt || ''} /> : <Icon className="tic" />}
  </div>
);

export default PubThumb;
