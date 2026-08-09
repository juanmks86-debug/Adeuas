import { saldoPendiente, formatMoney } from '../prestamoUtils'
import EvolucionMensual from './EvolucionMensual'
import RecordatoriosVencimiento from './RecordatoriosVencimiento'

function IconFlechaAbajo(props) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 5v14" /><path d="M6 13l6 6 6-6" />
    </svg>
  )
}
function IconFlechaArriba(props) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 19V5" /><path d="M6 11l6-6 6 6" />
    </svg>
  )
}

export default function Dashboard({ prestamos, onAbrirPrestamo }) {
  const meDeben = prestamos
    .filter((p) => p.tipo === 'doy')
    .reduce((acc, p) => acc + saldoPendiente(p), 0)

  const debo = prestamos
    .filter((p) => p.tipo === 'tomo')
    .reduce((acc, p) => acc + saldoPendiente(p), 0)

  const neto = meDeben - debo

  return (
    <div>
      <div className="balance-summary">
        <div className="balance-tile a-favor">
          <div className="tile-icon"><IconFlechaAbajo /></div>
          <div className="label">Me deben</div>
          <div className="amount">{formatMoney(meDeben)}</div>
        </div>
        <div className="balance-tile en-contra">
          <div className="tile-icon"><IconFlechaArriba /></div>
          <div className="label">Debo</div>
          <div className="amount">{formatMoney(debo)}</div>
        </div>
      </div>
      <div className="balance-net">
        <span>Balance neto</span>
        <strong>{formatMoney(neto)}</strong>
      </div>
      <RecordatoriosVencimiento prestamos={prestamos} onAbrir={onAbrirPrestamo} />
      <EvolucionMensual prestamos={prestamos} />
    </div>
  )
}
