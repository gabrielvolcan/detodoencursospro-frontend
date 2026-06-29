import { useState, useEffect } from 'react';
import { Plus, Trash2, Save, CreditCard } from 'lucide-react';
import { adminAPI } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import ToastContainer from '../../components/ToastContainer';

const GestionMetodosPago = () => {
  const { toasts, showToast } = useToast();
  const [paises, setPaises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState('');

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    try {
      setLoading(true);
      const { data } = await adminAPI.obtenerMetodosPagoAdmin();
      setPaises(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error cargando métodos:', error);
      showToast('Error al cargar los métodos de pago', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Helpers para editar en memoria
  const setMetodo = (pi, mi, campo, valor) => setPaises((prev) => {
    const copia = prev.map((p) => ({ ...p, metodos: p.metodos.map((m) => ({ ...m })) }));
    copia[pi].metodos[mi][campo] = valor;
    return copia;
  });
  const addMetodo = (pi) => setPaises((prev) => {
    const copia = prev.map((p) => ({ ...p, metodos: p.metodos.map((m) => ({ ...m })) }));
    copia[pi].metodos.push({ tipo: 'transferencia', nombre: '', instrucciones: '' });
    return copia;
  });
  const removeMetodo = (pi, mi) => setPaises((prev) => {
    const copia = prev.map((p) => ({ ...p, metodos: p.metodos.map((m) => ({ ...m })) }));
    copia[pi].metodos.splice(mi, 1);
    return copia;
  });

  const guardar = async (pais) => {
    try {
      setGuardando(pais.pais);
      await adminAPI.guardarMetodosPago(pais.pais, { nombre: pais.nombre, metodos: pais.metodos });
      showToast(`Métodos de ${pais.nombre} guardados`);
    } catch (error) {
      console.error('Error guardando:', error);
      showToast('Error al guardar', 'error');
    } finally {
      setGuardando('');
    }
  };

  if (loading) return <div className="admin-cargando">Cargando métodos de pago...</div>;

  return (
    <section>
      <ToastContainer toasts={toasts} />
      <div className="phead">
        <h1 className="h1">Métodos de Pago</h1>
      </div>
      <p className="muted" style={{ marginTop: -8, marginBottom: 8 }}>
        Editá las cuentas y datos que ve el comprador en el checkout, por país. Los cambios se aplican al instante.
      </p>
      <div className="divider-green"></div>

      <div style={{ display: 'grid', gap: 18 }}>
        {paises.map((p, pi) => (
          <div key={p.pais} className="mp-card" style={{ background: '#111114', border: '1px solid #1d1d22', borderRadius: 16, padding: 22 }}>
            <div className="fx ac jb wrap gap12" style={{ marginBottom: 14 }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <CreditCard size={18} /> {p.nombre}
                <span className="muted" style={{ fontSize: 12, fontWeight: 500 }}>({p.pais})</span>
              </h3>
              <button className="btn-green" onClick={() => guardar(p)} disabled={guardando === p.pais}>
                <Save size={16} /> {guardando === p.pais ? 'Guardando...' : 'Guardar'}
              </button>
            </div>

            {p.metodos.map((m, mi) => (
              <div key={mi} style={{ border: '1px solid #1d1d22', borderRadius: 12, padding: 14, marginBottom: 12, background: '#0c0c0f' }}>
                <div className="fx ac gap10" style={{ marginBottom: 8 }}>
                  <input
                    type="text"
                    value={m.nombre}
                    onChange={(e) => setMetodo(pi, mi, 'nombre', e.target.value)}
                    placeholder="Nombre visible (ej: BCP - Yape)"
                    style={inp(1)}
                  />
                  <input
                    type="text"
                    value={m.tipo}
                    onChange={(e) => setMetodo(pi, mi, 'tipo', e.target.value)}
                    placeholder="tipo (ej: paypal)"
                    style={{ ...inp(), maxWidth: 150 }}
                  />
                  <button className="abtn del" onClick={() => removeMetodo(pi, mi)} title="Quitar método" style={{ flex: 'none' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
                <textarea
                  value={m.instrucciones}
                  onChange={(e) => setMetodo(pi, mi, 'instrucciones', e.target.value)}
                  placeholder={'Datos de la cuenta / instrucciones que verá el comprador.\nEj:\nCuenta: 123456\nTitular: Tu Nombre\nConcepto: Pago Curso + Tu Nombre'}
                  rows={5}
                  style={{ ...inp(), width: '100%', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.5 }}
                />
              </div>
            ))}

            <button className="btn-outline" onClick={() => addMetodo(pi)} style={{ marginTop: 2 }}>
              <Plus size={16} /> Agregar método
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

// estilo de inputs reutilizado
function inp(flex) {
  return {
    flex: flex ? 1 : undefined,
    background: '#0c0c0f',
    border: '1px solid #26262c',
    borderRadius: 8,
    padding: '10px 12px',
    color: '#f3f3f5',
    fontSize: 14
  };
}

export default GestionMetodosPago;
