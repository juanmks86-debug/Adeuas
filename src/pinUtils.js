const KEY_HASH = 'cuentas-claras:pin-hash'
const KEY_PREGUNTA = 'cuentas-claras:pin-pregunta'
const KEY_RESPUESTA_HASH = 'cuentas-claras:pin-respuesta-hash'

async function hashTexto(texto) {
  const normalizado = texto.trim().toLowerCase()
  const datos = new TextEncoder().encode(normalizado)
  const buffer = await crypto.subtle.digest('SHA-256', datos)
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export function tienePin() {
  return Boolean(localStorage.getItem(KEY_HASH))
}

export function obtenerPregunta() {
  return localStorage.getItem(KEY_PREGUNTA) || ''
}

export async function configurarPin(pin, pregunta, respuesta) {
  const hashPin = await hashTexto(pin)
  const hashRespuesta = await hashTexto(respuesta)
  localStorage.setItem(KEY_HASH, hashPin)
  localStorage.setItem(KEY_PREGUNTA, pregunta)
  localStorage.setItem(KEY_RESPUESTA_HASH, hashRespuesta)
}

export async function verificarPin(pin) {
  const hash = await hashTexto(pin)
  return hash === localStorage.getItem(KEY_HASH)
}

export async function verificarRespuesta(respuesta) {
  const hash = await hashTexto(respuesta)
  return hash === localStorage.getItem(KEY_RESPUESTA_HASH)
}

export function desactivarPin() {
  localStorage.removeItem(KEY_HASH)
  localStorage.removeItem(KEY_PREGUNTA)
  localStorage.removeItem(KEY_RESPUESTA_HASH)
}
