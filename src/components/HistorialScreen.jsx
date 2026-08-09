import { historialPagosGeneral, formatMoney, formatDate } from '../prestamoUtils'

export default function HistorialScreen({ prestamos, onAbrirPrestamo }) {
  const items = historialPagosGeneral(prestamos)

  if (items.length === 0) {
    return (
      <div className="screen">
        <div className="empty-state">
          <p>Todavía no registraste ningún pago.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="screen" style={{ paddingLeft: 0, paddingRight: 0 }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, margin: '4px 20px 4px' }}>
        Historial
      </h2>
      <p style={{ fontSize: 13, color: 'var(--ink-soft)', margin: '0 20px 14px' }}>
        Todos los pagos registrados, de todos los préstamos, ordenados por fecha.
      </p>

      <div className="list" style={{ padding: '0 20px' }}>
        {items.map((it, i) => (
          <button
            key={`${it.prestamoId}-${it.fecha}-${i}`}
            className="pago-row"
            style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', borderBottom: '1px solid var(--paper-line)' }}
            onClick={() => onAbrirPrestamo(it.prestamoId)}
          >
            <span>
              <span style={{ fontWeight: 700, color: 'var(--ink)' }}>{it.persona}</span>
              <span style={{ color: 'var(--ink-soft)' }}> · {formatDate(it.fecha)}</span>
            </span>
            <span className="monto" style={{ color: it.tipo === 'doy' ? 'var(--forest)' : 'var(--wine)' }}>
              {it.tipo === 'doy' ? '+' : '−'}{formatMoney(it.monto)}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
