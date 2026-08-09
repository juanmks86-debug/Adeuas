export default function Toast({ toast, onClose }) {
  if (!toast) return null
  return (
    <div className="toast" role="status" aria-live="polite">
      <span>{toast.mensaje}</span>
      {toast.accion && (
        <button className="toast-accion" onClick={toast.accion.onClick}>
          {toast.accion.label}
        </button>
      )}
      <button className="toast-cerrar" onClick={onClose} aria-label="Cerrar aviso">
        ×
      </button>
    </div>
  )
}
