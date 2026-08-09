import { useMemo, useRef, useState } from 'react'
import { saldoPendiente, estadoPrestamo, estadoLabel, formatMoney, formatDate, iniciales, colorAvatar } from '../prestamoUtils'

function IlustracionVacio() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true">
      <circle cx="20" cy="20" r="18" fill="none" stroke="var(--gold)" strokeWidth="1.4" strokeDasharray="3 3" />
      <path d="M13 24 L18 17 L22 21 L27 14" fill="none" stroke="var(--gold)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ordenar(lista, criterio) {
  const copia = [...lista]
  switch (criterio) {
    case 'vencimiento':
      return copia.sort((a, b) => {
        if (!a.fechaVencimiento) return 1
        if (!b.fechaVencimiento) return -1
        return a.fechaVencimiento < b.fechaVencimiento ? -1 : 1
      })
    case 'monto':
      return copia.sort((a, b) => saldoPendiente(b) - saldoPendiente(a))
    case 'alfabetico':
      return copia.sort((a, b) => a.persona.localeCompare(b.persona, 'es'))
    default:
      return copia
  }
}

export default function ListaPrestamos({ prestamos, tab, setTab, onOpen, onPagoRapido }) {
  const [busqueda, setBusqueda] = useState('')
  const [orden, setOrden] = useState('reciente')
  const [revelado, setRevelado] = useState(null)
  const [pagoAbierto, setPagoAbierto] = useState(null)
  const [montoRapido, setMontoRapido] = useState('')
  const touchStartX = useRef(0)

  const delTab = prestamos.filter((p) => p.tipo === tab)
  const filtrados = busqueda.trim()
    ? delTab.filter((p) => p.persona.toLowerCase().includes(busqueda.trim().toLowerCase()))
    : delTab

  const ordenados = useMemo(() => ordenar(filtrados, orden), [filtrados, orden])

  const countDoy = prestamos.filter((p) => p.tipo === 'doy').length
  const countTomo = prestamos.filter((p) => p.tipo === 'tomo').length

  function onTouchStart(e) {
    touchStartX.current = e.touches[0].clientX
  }
  function onTouchEnd(e, id) {
    const delta = e.changedTouches[0].clientX - touchStartX.current
    if (delta < -40) setRevelado(id)
    else if (delta > 20) setRevelado(null)
  }

  function abrirPagoRapido(id) {
    setPagoAbierto(id)
    setRevelado(null)
    setMontoRapido('')
  }

  function confirmarPagoRapido(id) {
    const monto = Number(montoRapido)
    if (!monto || monto <= 0) return
    onPagoRapido(id, monto)
    setPagoAbierto(null)
    setMontoRapido('')
  }

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
        <>
          <div className="search-wrap" style={{ display: 'flex', gap: 8 }}>
            <input
              type="search"
              className="search-input"
              placeholder="Buscar por nombre"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            <select
              className="search-input"
              style={{ flexShrink: 0, width: 'auto' }}
              value={orden}
              onChange={(e) => setOrden(e.target.value)}
              aria-label="Ordenar por"
            >
              <option value="reciente">Más reciente</option>
              <option value="vencimiento">Por vencimiento</option>
              <option value="monto">Por monto</option>
              <option value="alfabetico">Alfabético</option>
            </select>
          </div>
          <div className="swipe-hint">Deslizá una fila hacia la izquierda para registrar un pago rápido</div>
        </>
      )}

      <div className="list">
        {ordenados.length === 0 && (
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

        {ordenados.map((p) => {
          const saldo = saldoPendiente(p)
          const estado = estadoPrestamo(p)
          const estaRevelado = revelado === p.id
          const estaAbierto = pagoAbierto === p.id
          return (
            <div key={p.id}>
              <div className="swipe-wrap">
                <button
                  className="swipe-action"
                  onClick={() => abrirPagoRapido(p.id)}
                  aria-label={`Registrar pago rápido de ${p.persona}`}
                >
                  Pago
                </button>
                <button
                  className={`prestamo-row ${p.tipo}`}
                  style={{ transform: estaRevelado ? 'translateX(-84px)' : 'translateX(0)' }}
                  onClick={() => (estaRevelado ? setRevelado(null) : onOpen(p.id))}
                  onTouchStart={onTouchStart}
                  onTouchEnd={(e) => onTouchEnd(e, p.id)}
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
              </div>

              {estaAbierto && (
                <div className="pago-rapido-form">
                  <input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.01"
                    placeholder="Monto del pago"
                    value={montoRapido}
                    onChange={(e) => setMontoRapido(e.target.value)}
                    autoFocus
                    aria-label={`Monto del pago rápido de ${p.persona}`}
                  />
                  <button className="btn btn-primary" onClick={() => confirmarPagoRapido(p.id)}>
                    Confirmar
                  </button>
                  <button className="btn btn-secondary" onClick={() => setPagoAbierto(null)}>
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}
