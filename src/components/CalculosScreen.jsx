import { useMemo, useState } from 'react'
import { proyeccionInteres, formatMoney, saldoPendiente } from '../prestamoUtils'

export default function CalculosScreen({ prestamos }) {
  const prestamosConSaldo = prestamos.filter((p) => p.tipo === 'doy' && saldoPendiente(p) > 0)

  const [capital, setCapital] = useState('100000')
  const [tasa, setTasa] = useState('30')
  const [vista, setVista] = useState('mensual') // 'mensual' | 'anual'
  const [modo, setModo] = useState('compuesto') // 'compuesto' | 'simple'
  const [cantidad, setCantidad] = useState(vista === 'mensual' ? '12' : '3')

  function prellenarDesde(id) {
    const p = prestamosConSaldo.find((x) => x.id === id)
    if (!p) return
    setCapital(String(saldoPendiente(p)))
    if (p.tasaInteres) setTasa(String(p.tasaInteres))
  }

  const periodosAMostrar = vista === 'anual' ? Number(cantidad) * 12 : Number(cantidad)
  const filas = useMemo(() => {
    const cap = Number(capital)
    const t = Number(tasa)
    if (!cap || !t || !periodosAMostrar) return []
    const mensuales = proyeccionInteres(cap, t, periodosAMostrar, modo)
    if (vista === 'mensual') return mensuales.map((f) => ({ etiqueta: `Mes ${f.periodo}`, ...f }))
    // Agrupar de a 12 para vista anual
    const anuales = []
    for (let a = 0; a < Number(cantidad); a++) {
      const delAño = mensuales.slice(a * 12, a * 12 + 12)
      if (delAño.length === 0) continue
      const interesDelAño = delAño.reduce((acc, f) => acc + f.interesDelPeriodo, 0)
      anuales.push({
        etiqueta: `Año ${a + 1}`,
        interesDelPeriodo: Math.round(interesDelAño * 100) / 100,
        saldoAcumulado: delAño[delAño.length - 1].saldoAcumulado,
      })
    }
    return anuales
  }, [capital, tasa, periodosAMostrar, modo, vista, cantidad])

  return (
    <div className="screen">
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, margin: '4px 0 4px' }}>
        Proyección de interés
      </h2>
      <p style={{ fontSize: 13, color: 'var(--ink-soft)', margin: '0 0 18px' }}>
        Calculá cuánto interés podés ganar sobre un capital, mes a mes o año a año.
      </p>

      {prestamosConSaldo.length > 0 && (
        <div className="form-group">
          <label htmlFor="prellenar">Prellenar desde un préstamo (opcional)</label>
          <select id="prellenar" onChange={(e) => prellenarDesde(e.target.value)} defaultValue="">
            <option value="" disabled>Elegí un préstamo…</option>
            {prestamosConSaldo.map((p) => (
              <option key={p.id} value={p.id}>
                {p.persona} — {formatMoney(saldoPendiente(p))}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="capital">Capital</label>
          <input
            id="capital"
            type="number"
            inputMode="decimal"
            min="0"
            value={capital}
            onChange={(e) => setCapital(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="tasa">Interés % por mes</label>
          <input
            id="tasa"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.1"
            value={tasa}
            onChange={(e) => setTasa(e.target.value)}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="vista">Ver por</label>
          <select
            id="vista"
            value={vista}
            onChange={(e) => {
              setVista(e.target.value)
              setCantidad(e.target.value === 'mensual' ? '12' : '3')
            }}
          >
            <option value="mensual">Mes</option>
            <option value="anual">Año</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="cantidad">Cantidad de {vista === 'mensual' ? 'meses' : 'años'}</label>
          <input
            id="cantidad"
            type="number"
            min="1"
            step="1"
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="modo">Tipo de interés</label>
        <select id="modo" value={modo} onChange={(e) => setModo(e.target.value)}>
          <option value="compuesto">Compuesto (interés sobre el saldo acumulado)</option>
          <option value="simple">Simple (interés siempre sobre el capital original)</option>
        </select>
      </div>

      {filas.length > 0 && (
        <>
          <div className="section-title" style={{ marginTop: 20 }}>Resultado</div>
          {filas.map((f) => (
            <div className="cuota-row" key={f.etiqueta}>
              <span className="cuota-fecha">{f.etiqueta}</span>
              <span style={{ color: 'var(--forest)', fontWeight: 700 }}>+{formatMoney(f.interesDelPeriodo)}</span>
              <span className="cuota-monto">{formatMoney(f.saldoAcumulado)}</span>
            </div>
          ))}
        </>
      )}
    </div>
  )
}
