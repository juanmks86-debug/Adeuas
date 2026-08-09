import { useState } from 'react'
import { verificarPin, verificarRespuesta, obtenerPregunta, configurarPin } from '../pinUtils'
import { IconCandado } from './icons'

export default function LockScreen({ onUnlock }) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)
  const [verificando, setVerificando] = useState(false)
  const [modo, setModo] = useState('pin') // 'pin' | 'pregunta' | 'nuevo-pin'
  const [respuesta, setRespuesta] = useState('')
  const [errorRespuesta, setErrorRespuesta] = useState(false)
  const [nuevoPin, setNuevoPin] = useState('')
  const [confirmarPin, setConfirmarPin] = useState('')
  const [errorNuevoPin, setErrorNuevoPin] = useState('')

  async function intentarPin(valor) {
    setVerificando(true)
    const ok = await verificarPin(valor)
    setVerificando(false)
    if (ok) {
      onUnlock()
    } else {
      setError(true)
      setPin('')
      setTimeout(() => setError(false), 500)
    }
  }

  function tocarDigito(d) {
    if (verificando || pin.length >= 4) return
    const nuevo = pin + d
    setPin(nuevo)
    if (nuevo.length === 4) intentarPin(nuevo)
  }

  function borrar() {
    setPin((p) => p.slice(0, -1))
  }

  async function handleVerificarRespuesta(e) {
    e.preventDefault()
    const ok = await verificarRespuesta(respuesta)
    if (ok) {
      setErrorRespuesta(false)
      setModo('nuevo-pin')
    } else {
      setErrorRespuesta(true)
    }
  }

  async function handleGuardarNuevoPin(e) {
    e.preventDefault()
    if (!/^\d{4}$/.test(nuevoPin)) {
      setErrorNuevoPin('El PIN debe tener 4 dígitos')
      return
    }
    if (nuevoPin !== confirmarPin) {
      setErrorNuevoPin('Los PIN no coinciden')
      return
    }
    await configurarPin(nuevoPin, obtenerPregunta(), respuesta)
    onUnlock()
  }

  if (modo === 'pregunta') {
    return (
      <div className="lock-screen">
        <div className="lock-card">
          <h2>Recuperar acceso</h2>
          <p className="lock-pregunta">{obtenerPregunta()}</p>
          <form onSubmit={handleVerificarRespuesta}>
            <div className="form-group">
              <input
                type="text"
                value={respuesta}
                onChange={(e) => setRespuesta(e.target.value)}
                placeholder="Tu respuesta"
                autoFocus
                className={errorRespuesta ? 'input-error' : ''}
              />
              {errorRespuesta && <div className="field-error">Esa no es la respuesta correcta.</div>}
            </div>
            <div className="action-row">
              <button type="submit" className="btn btn-primary btn-block">Verificar</button>
            </div>
          </form>
          <button className="back-btn" style={{ marginTop: 14 }} onClick={() => setModo('pin')}>
            ← Volver a ingresar PIN
          </button>
        </div>
      </div>
    )
  }

  if (modo === 'nuevo-pin') {
    return (
      <div className="lock-screen">
        <div className="lock-card">
          <h2>Elegí un PIN nuevo</h2>
          <p className="lock-pregunta">4 dígitos, algo que puedas recordar.</p>
          <form onSubmit={handleGuardarNuevoPin}>
            <div className="form-group">
              <label htmlFor="nuevoPin">Nuevo PIN</label>
              <input
                id="nuevoPin"
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={nuevoPin}
                onChange={(e) => setNuevoPin(e.target.value.replace(/\D/g, ''))}
                autoFocus
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmarPin">Confirmar PIN</label>
              <input
                id="confirmarPin"
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={confirmarPin}
                onChange={(e) => setConfirmarPin(e.target.value.replace(/\D/g, ''))}
              />
            </div>
            {errorNuevoPin && <div className="field-error">{errorNuevoPin}</div>}
            <div className="action-row">
              <button type="submit" className="btn btn-primary btn-block">Guardar y entrar</button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="lock-screen">
      <div className="lock-card">
        <div className="lock-icon"><IconCandado width="24" height="24" /></div>
        <h2>Cuentas Claras</h2>
        <p className="lock-pregunta">Ingresá tu PIN</p>
        <div className={`lock-dots ${error ? 'shake' : ''}`}>
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className={`lock-dot ${i < pin.length ? 'filled' : ''}`} />
          ))}
        </div>
        {error && <div className="field-error" style={{ textAlign: 'center' }}>PIN incorrecto</div>}
        <div className="lock-keypad">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
            <button key={d} className="lock-key" onClick={() => tocarDigito(d)} disabled={verificando}>
              {d}
            </button>
          ))}
          <span />
          <button className="lock-key" onClick={() => tocarDigito('0')} disabled={verificando}>0</button>
          <button className="lock-key lock-key-borrar" onClick={borrar} disabled={verificando} aria-label="Borrar">
            ⌫
          </button>
        </div>
        <button className="back-btn" style={{ marginTop: 10 }} onClick={() => setModo('pregunta')}>
          Olvidé mi PIN
        </button>
      </div>
    </div>
  )
}
