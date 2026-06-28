// Pila de toasts (abajo-centro). Recibe la lista del hook useToast.
const ToastContainer = ({ toasts }) => {
  if (!toasts.length) return null;
  return (
    <div className="admin-rd-toast-stack">
      {toasts.map((t) => (
        <div key={t.id} className={`admin-rd-toast ${t.tipo === 'error' ? 'error' : ''}`}>
          {t.texto}
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
