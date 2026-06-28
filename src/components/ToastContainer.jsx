import { CheckCircle, AlertCircle } from 'lucide-react';

// Pila de toasts (arriba a la derecha). Recibe la lista del hook useToast.
const ToastContainer = ({ toasts }) => {
  if (!toasts.length) return null;
  return (
    <div className="toast-stack">
      {toasts.map((t) => (
        <div key={t.id} className={`admin-toast ${t.tipo}`}>
          {t.tipo === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
          <span>{t.texto}</span>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
