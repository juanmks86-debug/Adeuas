export function montoConInteres(p) {
  const interes = p.tasaInteres ? p.montoInicial * (Number(p.tasaInteres) / 100) : 0
  return p.montoInicial + interes
}

export function totalPagado(p) {
  return (p.pagos || []).reduce((acc, pago) => acc + Number(pago.monto), 0)
}

export function saldoPendiente(p) {
  const saldo = montoConInteres(p) - totalPagado(p)
  return Math.max(0, Math.round(saldo * 100) / 100)
}

export function estadoPrestamo(p) {
  const saldo = saldoPendiente(p)
  if (saldo <= 0) return 'pagado'
  if (p.fechaVencimiento) {
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    const venc = new Date(p.fechaVencimiento)
    if (venc < hoy) return 'vencido'
  }
  return 'al-dia'
}

export function estadoLabel(estado) {
  return { 'al-dia': 'Al día', vencido: 'Vencido', pagado: 'Pagado' }[estado] || estado
}

export function formatMoney(n) {
  const num = Number(n) || 0
  return num.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })
}

export function formatDate(d) {
  if (!d) return '—'
  const date = new Date(d + 'T00:00:00')
  return date.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
}
