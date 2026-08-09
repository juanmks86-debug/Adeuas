import { useState } from 'react'
import { saldoPendiente, estadoPrestamo, estadoLabel, formatMoney, formatDate, iniciales, colorAvatar } from '../prestamoUtils'

function IlustracionVacio() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true">
      <circle cx="20" cy="20" r="18" fill="none" stroke="var(--gold)" strokeWidth="1.4" strokeDasharray="3 3" />
      <path d="M13 24 L18 17 L22 21 L27 14" fill="none" stroke="var(--gold)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function ListaPrestamos({ prestamos, tab, setTab, onOpen }) {
  const [busqueda, setBusqueda] = useState('')

  const delTab = prestamos.filter((p) => p.tipo === tab)
  const filtrados = busqueda.trim()
    ? delTab.filter((p) => p.persona.toLowerCase().includes(busqueda.trim().toLowerCase()))
    : delTab

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

      {delTab.length > 0 && (
        <div className="search-wrap">
          <input
            type="search"
            className="search-input"
            placeholder="Buscar por nombre"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      )}

      <div className="list">
        {filtrados.length === 0 && (
          <div className="empty-state">
            <IlustracionVacio />
            <p>
              {busqueda.trim()
                ? 'No encontramos a nadie con ese nombre.'
                : tab === 'doy'
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
              <div className="avatar" style={{ background: colorAvatar(p.persona) }}>
                {iniciales(p.persona)}
              </div>
              <div style={{ flex: 1 }}>
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
