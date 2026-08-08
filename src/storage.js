const KEY = 'cuentas-claras:prestamos:v1'

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    return JSON.parse(raw)
  } catch {
    return []
  }
}

function save(prestamos) {
  localStorage.setItem(KEY, JSON.stringify(prestamos))
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export const storage = {
  load,
  save,
  uid,
}
