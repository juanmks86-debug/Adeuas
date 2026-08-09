const NIVELES = [
  { valor: '1', etiqueta: 'Aa' },
  { valor: '1.15', etiqueta: 'Aa' },
  { valor: '1.3', etiqueta: 'Aa' },
]

export default function ControlTamañoLetra({ escala, onCambiar }) {
  const idx = NIVELES.findIndex((n) => n.valor === escala)

  function siguiente() {
    const nextIdx = (idx + 1) % NIVELES.length
    onCambiar(NIVELES[nextIdx].valor)
  }

  return (
    <button
      className="backup-btn"
      onClick={siguiente}
      aria-label={`Tamaño de letra: ${idx === 0 ? 'normal' : idx === 1 ? 'grande' : 'muy grande'}. Tocar para cambiar.`}
      title="Cambiar tamaño de letra"
    >
      <span style={{ fontSize: 12 + idx * 2 }}>Aa</span>
    </button>
  )
}
