import { useState, useRef, useCallback } from 'react';
import ConfirmDialog from '../components/ConfirmDialog';

// Hook que expone un confirm()/prompt() basado en promesa, con UI propia.
// Uso:
//   const { confirm, confirmUI } = useConfirm();
//   if (!(await confirm({ title, message, confirmText, danger }))) return;
//   const motivo = await confirm({ withInput: true, inputLabel: '...' }); // string | null
// Renderizar {confirmUI} dentro del componente.
export function useConfirm() {
  const [opts, setOpts] = useState(null);
  const resolver = useRef(null);

  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      resolver.current = resolve;
      setOpts(options || {});
    });
  }, []);

  const close = (result) => {
    setOpts(null);
    if (resolver.current) {
      resolver.current(result);
      resolver.current = null;
    }
  };

  const confirmUI = opts ? (
    <ConfirmDialog
      {...opts}
      onConfirm={(val) => close(opts.withInput ? val : true)}
      onCancel={() => close(opts.withInput ? null : false)}
    />
  ) : null;

  return { confirm, confirmUI };
}
