const base = { width: 15, height: 15, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }

export function IconMonedas(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="9" cy="9" r="6" />
      <path d="M14.5 6.5A6 6 0 1 1 6.5 14.5" />
    </svg>
  )
}

export function IconRenovar(props) {
  return (
    <svg {...base} {...props}>
      <path d="M21 12a9 9 0 1 1-3-6.7" />
      <path d="M21 3v5h-5" />
    </svg>
  )
}

export function IconPapelera(props) {
  return (
    <svg {...base} {...props}>
      <path d="M4 7h16" />
      <path d="M10 11v6" /><path d="M14 11v6" />
      <path d="M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13" />
      <path d="M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3" />
    </svg>
  )
}

export function IconLapiz(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  )
}

export function IconPersona(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
    </svg>
  )
}

export function IconCalendario(props) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M8 3v4" /><path d="M16 3v4" /><path d="M3 10h18" />
    </svg>
  )
}

export function IconListaCuotas(props) {
  return (
    <svg {...base} {...props}>
      <path d="M8 6h13" /><path d="M8 12h13" /><path d="M8 18h13" />
      <path d="M3 6h.01" /><path d="M3 12h.01" /><path d="M3 18h.01" />
    </svg>
  )
}
