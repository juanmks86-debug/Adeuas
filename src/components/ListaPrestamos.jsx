import { saldoPendiente, estadoPrestamo, estadoLabel, formatMoney, formatDate } from '../prestamoUtils'

export default function ListaPrestamos({ prestamos, tab, setTab, onOpen }) {
  const filtrados = prestamos.filter((p) => p.tipo === tab)
  const countDoy = prestamos.filter((p) => p.tipo === 'doy').length
  const countTomo = prestamos.filter((p) => p.tipo === 'tomo').length

  return (
    <>
      <div className="tabs">
        <button
          className={`tab ${tab === 'doy' ? 'active' : ''}`}
          onClick={() => setTab('doy')}
        >
          Yo presto <span className="count">({countDoy})</span>
        </button>
        <button
          className={`tab ${tab === 'tomo' ? 'active' : ''}`}
          onClick={() => setTab('tomo')}
        >
          Yo debo <span className="count">({countTomo})</span>
        </button>
      </div>

      <div className="list">
        {filtrados.length === 0 && (
          <div className="empty-state">
            <div className="glyph">§</div>
            <p>
              {tab === 'doy'
                ? 'Todavía no registraste préstamos que hayas dado.'
                : 'Todavía no registraste deudas propias.'}
            </p>
          </div>
        )}

        {filtrados.map((p) => {
          const saldo = saldoPendiente(p)
          const estado = estadoPrestamo(p)
          return (
            <button
              key={p.id}
              className={`prestamo-row ${p.tipo}`}
              onClick={() => onOpen(p.id)}
            >
              <div>
                <div className="quien">{p.persona}</div>
                <div className="meta">Desde {formatDate(p.fecha)}</div>
                <span className={`estado-chip ${estado}`}>{estadoLabel(estado)}</span>
              </div>
              <div className="right">
                <div className="saldo">{formatMoney(saldo)}</div>
              </div>
            </button>
          )
        })}
      </div>
    </>
  )
}
