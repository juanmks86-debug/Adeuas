import { interesesNetos, formatMoney } from '../prestamoUtils'

export default function InteresesScreen({ prestamos }) {
  const { cobrado, pagado, neto } = interesesNetos(prestamos)

  return (
    <div className="screen">
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, margin: '4px 0 4px' }}>
        Intereses
      </h2>
      <p style={{ fontSize: 13, color: 'var(--ink-soft)', margin: '0 0 18px' }}>
        Lo que efectivamente cobraste de interés en los préstamos que diste, contra lo que pagaste de interés en los que tomaste.
      </p>

      <div className="balance-summary" style={{ margin: '0 0 12px' }}>
        <div className="balance-tile a-favor">
          <div className="tile-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14" /><path d="M6 13l6 6 6-6" />
            </svg>
          </div>
          <div className="label">Interés cobrado</div>
          <div className="amount">{formatMoney(cobrado)}</div>
        </div>
        <div className="balance-tile en-contra">
          <div className="tile-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 19V5" /><path d="M6 11l6-6 6 6" />
            </svg>
          </div>
          <div className="label">Interés pagado</div>
          <div className="amount">{formatMoney(pagado)}</div>
        </div>
      </div>

      <div className="balance-net" style={{ margin: 0 }}>
        <span>Neto ganado en intereses</span>
        <strong style={{ color: neto >= 0 ? 'var(--forest)' : 'var(--wine)' }}>{formatMoney(neto)}</strong>
      </div>

      <p style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 16 }}>
        Se calcula por cada pago registrado: lo que pagaron por encima del capital original de ese ciclo cuenta como
        interés. Incluye ciclos ya cerrados por renovaciones anteriores.
      </p>
    </div>
  )
}
