import { IconInicio, IconGraficos, IconCalculadora, IconPorcentaje, IconPersonas, IconReloj } from './icons'

const TABS = [
  { id: 'inicio', label: 'Inicio', Icon: IconInicio },
  { id: 'graficos', label: 'Gráficos', Icon: IconGraficos },
  { id: 'calculos', label: 'Cálculos', Icon: IconCalculadora },
  { id: 'intereses', label: 'Intereses', Icon: IconPorcentaje },
  { id: 'personas', label: 'Personas', Icon: IconPersonas },
  { id: 'historial', label: 'Historial', Icon: IconReloj },
]

export default function TabBar({ activa, onCambiar }) {
  return (
    <nav className="bottom-nav" aria-label="Navegación principal">
      {TABS.map(({ id, label, Icon }) => (
        <button
          key={id}
          className={`bottom-nav-item ${activa === id ? 'active' : ''}`}
          onClick={() => onCambiar(id)}
          aria-current={activa === id ? 'page' : undefined}
          aria-label={label}
        >
          <Icon width="20" height="20" />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  )
}
