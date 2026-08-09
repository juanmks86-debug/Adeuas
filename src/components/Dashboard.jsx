import { saldoPendiente, formatMoney } from '../prestamoUtils'
import EvolucionMensual from './EvolucionMensual'
import RecordatoriosVencimiento from './RecordatoriosVencimiento'

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
          <div className="label">Me deben</div>
          <div className="amount">{formatMoney(meDeben)}</div>
        </div>
        <div className="balance-tile en-contra">
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
