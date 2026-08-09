import { useState } from 'react'

const PASOS = [
  {
    titulo: 'Llevá el control de tus préstamos',
    texto: 'Registrá lo que le prestás a otras personas y lo que vos debés, todo en el mismo lugar. Tus datos quedan guardados solo en este dispositivo.',
  },
  {
    titulo: 'Explorá las pestañas',
    texto: 'Además de Inicio, tenés Gráficos, Cálculos de interés, cuánto ganaste en Intereses, un resumen por Personas y el Historial completo de pagos.',
  },
  {
    titulo: 'No pierdas tus datos',
    texto: 'Usá Exportar (arriba) cada tanto para guardar una copia de respaldo. Podés Importarla en otro dispositivo cuando quieras.',
  },
]

export default function OnboardingOverlay({ onCerrar }) {
  const [paso, setPaso] = useState(0)
  const esUltimo = paso === PASOS.length - 1

  return (
    <div className="onboarding-overlay" role="dialog" aria-modal="true">
      <div className="onboarding-card">
        <h2>{PASOS[paso].titulo}</h2>
        <p>{PASOS[paso].texto}</p>
        <div className="onboarding-dots">
          {PASOS.map((_, i) => (
            <span key={i} className={`onboarding-dot ${i === paso ? 'active' : ''}`} />
          ))}
        </div>
        <div className="onboarding-actions">
          <button className="btn btn-secondary" onClick={onCerrar}>
            Saltear
          </button>
          <button
            className="btn btn-primary"
            onClick={() => (esUltimo ? onCerrar() : setPaso((p) => p + 1))}
          >
            {esUltimo ? 'Empezar' : 'Siguiente'}
          </button>
        </div>
      </div>
    </div>
  )
}
