import { useState } from 'react'
import { agruparPorPersona, rankingRiesgo, formatMoney, saldoPendiente, iniciales, colorAvatar } from '../prestamoUtils'

export default function PersonasScreen({ prestamos, onAbrirPrestamo }) {
  const [expandido, setExpandido] = useState(null)
  const grupos = agruparPorPersona(prestamos)
  const riesgosos = rankingRiesgo(prestamos)

  if (grupos.length === 0) {
    return (
      <div className="screen">
        <div className="empty-state">
          <p>Todavía no hay préstamos cargados con ninguna persona.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="screen" style={{ paddingLeft: 0, paddingRight: 0 }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, margin: '4px 20px 4px' }}>
        Personas
      </h2>
      <p style={{ fontSize: 13, color: 'var(--ink-soft)', margin: '0 20px 14px' }}>
        Balance consolidado por cada persona, sumando todos sus préstamos.
      </p>

      {riesgosos.length > 0 && (
        <div className="renovar-box" style={{ margin: '0 20px 16px' }}>
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, color: 'var(--gold)', marginBottom: 8 }}>
            Renovaron sin terminar de pagar
          </div>
          {riesgosos.slice(0, 3).map((g) => (
            <div key={g.persona} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '4px 0' }}>
              <span>{g.persona}</span>
              <span style={{ color: 'var(--ink-soft)' }}>
                {g.renovaciones} renovación{g.renovaciones === 1 ? '' : 'es'}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="list" style={{ padding: '0 20px' }}>
        {grupos.map((g) => {
          const key = g.persona.toLowerCase()
          const abierto = expandido === key
          return (
            <div key={key}>
              <button
                className="prestamo-row"
                onClick={() => setExpandido(abierto ? null : key)}
              >
                <div className="avatar" style={{ background: colorAvatar(g.persona) }}>
                  {iniciales(g.persona)}
                </div>
                <div style={{ flex: 1 }}>
                  <div className="quien">{g.persona}</div>
                  <div className="meta">
                    {g.prestamos.length} préstamo{g.prestamos.length === 1 ? '' : 's'}
                    {g.renovaciones > 0 && ` · ${g.renovaciones} renovación${g.renovaciones === 1 ? '' : 'es'}`}
                  </div>
                </div>
                <div className="right">
                  <div className="saldo" style={{ color: g.neto >= 0 ? 'var(--forest)' : 'var(--wine)' }}>
                    {formatMoney(Math.abs(g.neto))}
                  </div>
                  <div className="meta">{g.neto >= 0 ? 'a tu favor' : 'en contra'}</div>
                </div>
              </button>

              {abierto && (
                <div style={{ paddingLeft: 46, paddingBottom: 8 }}>
                  {g.prestamos.map((p) => (
                    <button
                      key={p.id}
                      className="pago-row"
                      style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                      onClick={() => onAbrirPrestamo(p.id)}
                    >
                      <span>{p.tipo === 'doy' ? 'Le presté' : 'Le debo'}</span>
                      <span className="monto" style={{ color: p.tipo === 'doy' ? 'var(--forest)' : 'var(--wine)' }}>
                        {formatMoney(saldoPendiente(p))}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
