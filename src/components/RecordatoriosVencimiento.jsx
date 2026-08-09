import { useEffect, useState } from 'react'
import { proximosVencimientos, formatMoney, formatDate } from '../prestamoUtils'

const KEY_ULTIMA_NOTIF = 'cuentas-claras:ultima-notif'

export default function RecordatoriosVencimiento({ prestamos, onAbrir }) {
  const [permiso, setPermiso] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  )
  const items = proximosVencimientos(prestamos, 3)

  useEffect(() => {
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return
    if (items.length === 0) return

    const hoy = new Date().toISOString().slice(0, 10)
    const ultima = localStorage.getItem(KEY_ULTIMA_NOTIF)
    if (ultima === hoy) return // ya avisamos hoy, no repetir en cada apertura

    const vencidos = items.filter((i) => i.diffDias < 0).length
    const proximos = items.length - vencidos
    let cuerpo = ''
    if (vencidos > 0) cuerpo += `${vencidos} préstamo${vencidos === 1 ? '' : 's'} vencido${vencidos === 1 ? '' : 's'}. `
    if (proximos > 0) cuerpo += `${proximos} por vencer en los próximos días.`

    new Notification('Cuentas Claras', { body: cuerpo.trim(), icon: '/icon-192.png' })
    localStorage.setItem(KEY_ULTIMA_NOTIF, hoy)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length])

  function pedirPermiso() {
    Notification.requestPermission().then(setPermiso)
  }

  if (items.length === 0) return null

  return (
    <div className="recordatorios">
      <div className="recordatorios-header">
        <span>Vencimientos próximos</span>
        {permiso === 'default' && (
          <button className="recordatorios-permiso" onClick={pedirPermiso}>
            Avisarme mientras tengo la app abierta
          </button>
        )}
      </div>
      {items.slice(0, 4).map(({ prestamo, diffDias }) => (
        <button key={prestamo.id} className="recordatorio-row" onClick={() => onAbrir(prestamo.id)}>
          <span className={`recordatorio-dot ${diffDias < 0 ? 'vencido' : 'proximo'}`} />
          <span className="recordatorio-persona">{prestamo.persona}</span>
          <span className="recordatorio-cuando">
            {diffDias < 0
              ? `venció ${formatDate(prestamo.fechaVencimiento)}`
              : diffDias === 0
              ? 'vence hoy'
              : `vence en ${diffDias} día${diffDias === 1 ? '' : 's'}`}
          </span>
        </button>
      ))}
    </div>
  )
}
