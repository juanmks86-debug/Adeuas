const TABS = [
  { id: 'inicio', label: 'Inicio' },
  { id: 'graficos', label: 'Gráficos' },
  { id: 'calculos', label: 'Cálculos' },
  { id: 'intereses', label: 'Intereses' },
  { id: 'personas', label: 'Personas' },
]

export default function TabBar({ activa, onCambiar }) {
  return (
    <div className="tabbar">
      {TABS.map((t) => (
        <button
          key={t.id}
          className={`tabbar-item ${activa === t.id ? 'active' : ''}`}
          onClick={() => onCambiar(t.id)}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}
