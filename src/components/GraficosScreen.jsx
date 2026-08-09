import { saldoPendiente, formatMoney } from '../prestamoUtils'
import EvolucionMensual from './EvolucionMensual'

function BarraComparativa({ prestamos }) {
  const meDeben = prestamos.filter((p) => p.tipo === 'doy').reduce((acc, p) => acc + saldoPendiente(p), 0)
  const debo = prestamos.filter((p) => p.tipo === 'tomo').reduce((acc, p) => acc + saldoPendiente(p), 0)
  const max = Math.max(1, meDeben, debo)

  return (
    <div style={{ margin: '4px 20px 24px' }}>
      <div className="section-title icon-title">Comparativo actual</div>
      <div className="bar-comparativa">
        <div className="bar-comparativa-row">
          <span className="bar-comparativa-label">Me deben</span>
          <div className="bar-comparativa-track">
            <div className="bar-comparativa-fill a-favor" style={{ width: `${(meDeben / max) * 100}%` }} />
          </div>
          <span className="bar-comparativa-valor">{formatMoney(meDeben)}</span>
        </div>
        <div className="bar-comparativa-row">
          <span className="bar-comparativa-label">Debo</span>
          <div className="bar-comparativa-track">
            <div className="bar-comparativa-fill en-contra" style={{ width: `${(debo / max) * 100}%` }} />
          </div>
          <span className="bar-comparativa-valor">{formatMoney(debo)}</span>
        </div>
      </div>
    </div>
  )
}

export default function GraficosScreen({ prestamos }) {
  return (
    <div className="screen" style={{ paddingLeft: 0, paddingRight: 0 }}>
      <BarraComparativa prestamos={prestamos} />
      <EvolucionMensual prestamos={prestamos} />
      {prestamos.length === 0 && (
        <div className="empty-state">
          <p>Cuando cargues préstamos, acá vas a ver cómo evoluciona tu deuda con el tiempo.</p>
        </div>
      )}
    </div>
  )
}
