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

// Calcula, para un préstamo, el saldo pendiente tal como estaba al final de un mes dado
// (yyyy-mm), contando solo los pagos registrados hasta esa fecha.
function saldoAlFinDeMes(p, yyyyMm) {
  const limite = `${yyyyMm}-31`
  const pagosHastaMes = (p.pagos || []).filter((pago) => pago.fecha <= limite)
  const pagado = pagosHastaMes.reduce((acc, pago) => acc + Number(pago.monto), 0)
  const saldo = montoConInteres(p) - pagado
  return Math.max(0, Math.round(saldo * 100) / 100)
}

function mesKey(dateStr) {
  return dateStr.slice(0, 7) // yyyy-mm
}

function sumarMeses(yyyyMm, n) {
  const [y, m] = yyyyMm.split('-').map(Number)
  const d = new Date(y, m - 1 + n, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

// Devuelve una serie mensual [{ mes, meDeben, debo }] desde el mes del préstamo más
// antiguo hasta el mes actual, para graficar la evolución de la deuda.
export function historialMensual(prestamos) {
  if (prestamos.length === 0) return []

  const mesActual = mesKey(new Date().toISOString())
  const mesMasAntiguo = prestamos.reduce((min, p) => {
    const mes = mesKey(p.fecha)
    return mes < min ? mes : min
  }, mesActual)

  const serie = []
  let mes = mesMasAntiguo
  let guard = 0
  while (mes <= mesActual && guard < 240) {
    const prestamosDelMes = prestamos.filter((p) => mesKey(p.fecha) <= mes)
    const meDeben = prestamosDelMes
      .filter((p) => p.tipo === 'doy')
      .reduce((acc, p) => acc + saldoAlFinDeMes(p, mes), 0)
    const debo = prestamosDelMes
      .filter((p) => p.tipo === 'tomo')
      .reduce((acc, p) => acc + saldoAlFinDeMes(p, mes), 0)
    serie.push({ mes, meDeben, debo })
    mes = sumarMeses(mes, 1)
    guard++
  }
  return serie
}

export function formatMesCorto(yyyyMm) {
  const [y, m] = yyyyMm.split('-').map(Number)
  const d = new Date(y, m - 1, 1)
  return d.toLocaleDateString('es-AR', { month: 'short', year: '2-digit' })
}
