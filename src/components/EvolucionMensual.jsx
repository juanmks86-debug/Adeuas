import { historialMensual, formatMesCorto, formatMoney } from '../prestamoUtils'

const WIDTH = 600
const HEIGHT = 180
const PAD_LEFT = 8
const PAD_RIGHT = 8
const PAD_TOP = 14
const PAD_BOTTOM = 26

function buildPath(valores, maxValor, innerW, innerH) {
  if (valores.length === 1) {
    const y = PAD_TOP + innerH - (valores[0] / maxValor) * innerH
    return `M ${PAD_LEFT} ${y} L ${PAD_LEFT + innerW} ${y}`
  }
  return valores
    .map((v, i) => {
      const x = PAD_LEFT + (i / (valores.length - 1)) * innerW
      const y = PAD_TOP + innerH - (maxValor === 0 ? innerH : (v / maxValor) * innerH)
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`
    })
    .join(' ')
}

export default function EvolucionMensual({ prestamos }) {
  const serie = historialMensual(prestamos)

  if (serie.length < 2) {
    return null
  }

  const innerW = WIDTH - PAD_LEFT - PAD_RIGHT
  const innerH = HEIGHT - PAD_TOP - PAD_BOTTOM

  const meDebenValores = serie.map((s) => s.meDeben)
  const deboValores = serie.map((s) => s.debo)
  const maxValor = Math.max(1, ...meDebenValores, ...deboValores)

  const pathMeDeben = buildPath(meDebenValores, maxValor, innerW, innerH)
  const pathDebo = buildPath(deboValores, maxValor, innerW, innerH)

  // Mostrar como mucho ~6 etiquetas de mes para no amontonar
  const step = Math.max(1, Math.ceil(serie.length / 6))

  const ultimo = serie[serie.length - 1]

  return (
    <div style={{ margin: '4px 20px 18px' }}>
      <div className="section-title" style={{ margin: '0 0 8px' }}>
        Evolución mensual
      </div>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width="100%" height={HEIGHT} role="img"
        aria-label={`Evolución de deuda: me deben ${formatMoney(ultimo.meDeben)}, debo ${formatMoney(ultimo.debo)}`}>
        {/* líneas de ledger horizontales, mismo lenguaje visual que el resto de la app */}
        {[0.25, 0.5, 0.75].map((f) => (
          <line
            key={f}
            x1={PAD_LEFT}
            x2={WIDTH - PAD_RIGHT}
            y1={PAD_TOP + innerH * f}
            y2={PAD_TOP + innerH * f}
            stroke="var(--paper-line)"
            strokeWidth="1"
          />
        ))}
        <line
          x1={PAD_LEFT}
          x2={WIDTH - PAD_RIGHT}
          y1={PAD_TOP + innerH}
          y2={PAD_TOP + innerH}
          stroke="var(--paper-line)"
          strokeWidth="1"
        />

        <path d={pathMeDeben} fill="none" stroke="var(--forest)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d={pathDebo} fill="none" stroke="var(--wine)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* puntos finales destacados */}
        <circle
          cx={PAD_LEFT + innerW}
          cy={PAD_TOP + innerH - (ultimo.meDeben / maxValor) * innerH}
          r="3.5"
          fill="var(--forest)"
        />
        <circle
          cx={PAD_LEFT + innerW}
          cy={PAD_TOP + innerH - (ultimo.debo / maxValor) * innerH}
          r="3.5"
          fill="var(--wine)"
        />

        {/* etiquetas de mes */}
        {serie.map((s, i) =>
          i % step === 0 || i === serie.length - 1 ? (
            <text
              key={s.mes}
              x={PAD_LEFT + (serie.length === 1 ? 0 : (i / (serie.length - 1)) * innerW)}
              y={HEIGHT - 8}
              fontSize="10"
              fontFamily="var(--font-mono)"
              fill="var(--ink-soft)"
              textAnchor={i === serie.length - 1 ? 'end' : i === 0 ? 'start' : 'middle'}
            >
              {formatMesCorto(s.mes)}
            </text>
          ) : null
        )}
      </svg>
      <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--ink-soft)', marginTop: 4 }}>
        <span><span style={{ color: 'var(--forest)' }}>●</span> Me deben</span>
        <span><span style={{ color: 'var(--wine)' }}>●</span> Debo</span>
      </div>
    </div>
  )
}
