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

const COLORES_AVATAR = ['#22c55e', '#f0654f', '#f59e0b', '#3b82f6', '#a78bfa']

export function iniciales(nombre) {
  const partes = nombre.trim().split(/\s+/).filter(Boolean)
  if (partes.length === 0) return '?'
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase()
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase()
}

export function colorAvatar(nombre) {
  let hash = 0
  for (let i = 0; i < nombre.length; i++) hash = (hash * 31 + nombre.charCodeAt(i)) >>> 0
  return COLORES_AVATAR[hash % COLORES_AVATAR.length]
}

// Préstamos que vencen dentro de los próximos `diasAntes` días, o que ya vencieron
// y siguen con saldo pendiente. Se usa para el aviso de recordatorios al abrir la app.
export function proximosVencimientos(prestamos, diasAntes = 3) {
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)

  return prestamos
    .filter((p) => p.fechaVencimiento && saldoPendiente(p) > 0)
    .map((p) => {
      const venc = new Date(p.fechaVencimiento + 'T00:00:00')
      const diffDias = Math.round((venc - hoy) / (1000 * 60 * 60 * 24))
      return { prestamo: p, diffDias }
    })
    .filter((item) => item.diffDias <= diasAntes)
    .sort((a, b) => a.diffDias - b.diffDias)
}

function sumarMesesAFecha(fechaStr, n) {
  const [y, m, d] = fechaStr.split('-').map(Number)
  const fecha = new Date(y, m - 1 + n, d)
  return fecha.toISOString().slice(0, 10)
}

// Genera el cronograma de cuotas (fecha de vencimiento y monto de cada una) y marca
// cada cuota como pagada/pendiente/vencida según los pagos acumulados hasta ahora.
export function cronogramaCuotas(p) {
  if (p.modalidad !== 'cuotas' || !p.cantidadCuotas || p.cantidadCuotas < 1) return []

  const total = montoConInteres(p)
  const montoCuota = Math.round((total / p.cantidadCuotas) * 100) / 100
  const pagos = [...(p.pagos || [])].sort((a, b) => (a.fecha < b.fecha ? -1 : 1))
  const totalPagadoAcum = pagos.reduce((acc, pago) => acc + Number(pago.monto), 0)

  const hoy = new Date().toISOString().slice(0, 10)
  const cuotas = []
  let acumuladoEsperado = 0

  for (let i = 1; i <= p.cantidadCuotas; i++) {
    acumuladoEsperado += montoCuota
    const fechaVencimiento = sumarMesesAFecha(p.fecha, i)
    let estado = 'pendiente'
    if (totalPagadoAcum >= acumuladoEsperado - 0.01) {
      estado = 'pagada'
    } else if (fechaVencimiento < hoy) {
      estado = 'vencida'
    }
    cuotas.push({ numero: i, fechaVencimiento, monto: montoCuota, estado })
  }
  return cuotas
}

// Renueva un préstamo: el saldo pendiente (capital + interés no pagado) pasa a ser
// el nuevo capital, arranca un ciclo nuevo con nueva fecha/vencimiento/tasa, y el
// ciclo anterior queda guardado en el historial del préstamo.
export function renovarPrestamo(p, { fechaVencimiento, tasaInteres, fecha }) {
  const saldoAlRenovar = saldoPendiente(p)
  const cicloAnterior = {
    montoInicial: p.montoInicial,
    tasaInteres: p.tasaInteres,
    fecha: p.fecha,
    fechaVencimiento: p.fechaVencimiento,
    pagos: p.pagos || [],
    saldoAlRenovar,
    fechaRenovacion: fecha || new Date().toISOString().slice(0, 10),
  }
  return {
    ...p,
    montoInicial: saldoAlRenovar,
    tasaInteres: tasaInteres !== undefined && tasaInteres !== '' ? Number(tasaInteres) : p.tasaInteres,
    fecha: fecha || new Date().toISOString().slice(0, 10),
    fechaVencimiento: fechaVencimiento || null,
    pagos: [],
    historial: [...(p.historial || []), cicloAnterior],
  }
}

function round2(n) {
  return Math.round(n * 100) / 100
}

// Proyecta cómo crece un capital con una tasa de interés por período, en modo
// simple (interés siempre sobre el capital original) o compuesto (interés sobre
// el saldo acumulado, como hace la app al renovar un préstamo impago).
export function proyeccionInteres(capital, tasaPorPeriodo, cantidadPeriodos, modo = 'compuesto') {
  const tasa = tasaPorPeriodo / 100
  const filas = []
  let saldo = capital
  for (let i = 1; i <= cantidadPeriodos; i++) {
    const interesDelPeriodo = modo === 'compuesto' ? saldo * tasa : capital * tasa
    saldo = modo === 'compuesto' ? saldo + interesDelPeriodo : capital + capital * tasa * i
    filas.push({
      periodo: i,
      interesDelPeriodo: round2(interesDelPeriodo),
      saldoAcumulado: round2(saldo),
    })
  }
  return filas
}

// Interés efectivamente cobrado/pagado hasta ahora, sumando todos los ciclos
// (incluidas renovaciones pasadas) de todos los préstamos: lo que se pagó por
// encima del capital de cada ciclo se cuenta como interés.
export function interesesNetos(prestamos) {
  let cobrado = 0
  let pagado = 0
  for (const p of prestamos) {
    const ciclos = [
      ...(p.historial || []).map((c) => ({ montoInicial: c.montoInicial, pagos: c.pagos || [] })),
      { montoInicial: p.montoInicial, pagos: p.pagos || [] },
    ]
    for (const c of ciclos) {
      const totalPagadoCiclo = c.pagos.reduce((acc, x) => acc + Number(x.monto), 0)
      const interes = Math.max(0, totalPagadoCiclo - c.montoInicial)
      if (p.tipo === 'doy') cobrado += interes
      else pagado += interes
    }
  }
  return { cobrado: round2(cobrado), pagado: round2(pagado), neto: round2(cobrado - pagado) }
}

// Agrupa todos los préstamos por persona (sin importar mayúsculas/espacios) y
// calcula el saldo neto que tenés con cada una.
export function agruparPorPersona(prestamos) {
  const mapa = new Map()
  for (const p of prestamos) {
    const key = p.persona.trim().toLowerCase()
    if (!mapa.has(key)) {
      mapa.set(key, { persona: p.persona.trim(), prestamos: [], saldoDoy: 0, saldoTomo: 0, renovaciones: 0 })
    }
    const entry = mapa.get(key)
    entry.prestamos.push(p)
    const saldo = saldoPendiente(p)
    if (p.tipo === 'doy') {
      entry.saldoDoy += saldo
      entry.renovaciones += (p.historial || []).length
    } else {
      entry.saldoTomo += saldo
    }
  }
  return Array.from(mapa.values())
    .map((e) => ({ ...e, neto: round2(e.saldoDoy - e.saldoTomo) }))
    .sort((a, b) => Math.abs(b.neto) - Math.abs(a.neto))
}

// Ranking de personas que más veces renovaron sin terminar de pagar (solo
// préstamos que vos diste). Útil para decidir a quién no convendría prestarle de nuevo.
export function rankingRiesgo(prestamos) {
  return agruparPorPersona(prestamos)
    .filter((g) => g.renovaciones > 0)
    .sort((a, b) => b.renovaciones - a.renovaciones)
}

// Lista plana de todos los pagos de todos los préstamos (incluidos los de
// ciclos ya cerrados por renovaciones), ordenada del más reciente al más viejo.
export function historialPagosGeneral(prestamos) {
  const items = []
  for (const p of prestamos) {
    for (const pago of p.pagos || []) {
      items.push({ prestamoId: p.id, persona: p.persona, tipo: p.tipo, fecha: pago.fecha, monto: Number(pago.monto) })
    }
    for (const ciclo of p.historial || []) {
      for (const pago of ciclo.pagos || []) {
        items.push({ prestamoId: p.id, persona: p.persona, tipo: p.tipo, fecha: pago.fecha, monto: Number(pago.monto) })
      }
    }
  }
  return items.sort((a, b) => (a.fecha < b.fecha ? 1 : -1))
}

// Texto listo para copiar y mandar como comprobante de un pago recibido/hecho.
export function textoComprobante(prestamo, pago, saldoRestante) {
  const accion = prestamo.tipo === 'doy' ? 'Recibí de' : 'Le pagué a'
  return (
    `${accion} ${prestamo.persona}: ${formatMoney(pago.monto)} el ${formatDate(pago.fecha)}.\n` +
    `Saldo restante: ${formatMoney(saldoRestante)}.`
  )
}
