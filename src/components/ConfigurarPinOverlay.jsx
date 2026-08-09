import { useState } from 'react'
import { tienePin, configurarPin, verificarPin, desactivarPin, obtenerPregunta } from '../pinUtils'

const PREGUNTAS = [
  '¿Nombre de tu primera mascota?',
  '¿Ciudad donde naciste?',
  '¿Comida favorita?',
  '¿Nombre de tu mejor amigo/a de la infancia?',
  'Otra (la escribo yo)',
]

export default function ConfigurarPinOverlay({ onCerrar, onCambio }) {
  const yaTiene = tienePin()
  const [paso, setPaso] = useState(yaTiene ? 'menu' : 'crear-pin')

  // Crear / cambiar PIN
  const [pin, setPin] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [pregunta, setPregunta] = useState(PREGUNTAS[0])
  const [preguntaCustom, setPreguntaCustom] = useState('')
  const [respuesta, setRespuesta] = useState('')
  const [error, setError] = useState('')

  // Verificación de PIN actual (para cambiar o desactivar)
  const [pinActual, setPinActual] = useState('')
  const [errorActual, setErrorActual] = useState('')

  function preguntaFinal() {
    return pregunta === 'Otra (la escribo yo)' ? preguntaCustom.trim() : pregunta
  }

  async function handleCrear(e) {
    e.preventDefault()
    setError('')
    if (!/^\d{4}$/.test(pin)) return setError('El PIN debe tener 4 dígitos')
    if (pin !== confirmar) return setError('Los PIN no coinciden')
    if (!preguntaFinal()) return setError('Elegí o escribí una pregunta de seguridad')
    if (!respuesta.trim()) return setError('Ingresá una respuesta')
    await configurarPin(pin, preguntaFinal(), respuesta)
    onCambio()
    onCerrar()
  }

  async function handleVerificarActual(e) {
    e.preventDefault()
    const ok = await verificarPin(pinActual)
    if (!ok) {
      setErrorActual('PIN incorrecto')
      return
    }
    setErrorActual('')
    setPaso(paso === 'verificar-para-cambiar' ? 'crear-pin' : 'confirmar-desactivar')
  }

  function handleDesactivar() {
    desactivarPin()
    onCambio()
    onCerrar()
  }

  return (
    <div className="onboarding-overlay" role="dialog" aria-modal="true">
      <div className="onboarding-card">
        {paso === 'menu' && (
          <>
            <h2>Seguridad</h2>
            <p>Tu PIN protege el acceso a la app en este dispositivo.</p>
            <div className="action-row" style={{ flexDirection: 'column' }}>
              <button className="btn btn-secondary btn-block" onClick={() => setPaso('verificar-para-cambiar')}>
                Cambiar PIN
              </button>
              <button className="btn btn-danger btn-block" onClick={() => setPaso('verificar-para-desactivar')}>
                Desactivar PIN
              </button>
              <button className="btn btn-secondary btn-block" onClick={onCerrar}>
                Cerrar
              </button>
            </div>
          </>
        )}

        {(paso === 'verificar-para-cambiar' || paso === 'verificar-para-desactivar') && (
          <>
            <h2>Confirmá tu PIN actual</h2>
            <form onSubmit={handleVerificarActual}>
              <div className="form-group">
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={pinActual}
                  onChange={(e) => setPinActual(e.target.value.replace(/\D/g, ''))}
                  autoFocus
                  className={errorActual ? 'input-error' : ''}
                />
                {errorActual && <div className="field-error">{errorActual}</div>}
              </div>
              <div className="action-row">
                <button type="submit" className="btn btn-primary btn-block">Continuar</button>
              </div>
            </form>
          </>
        )}

        {paso === 'confirmar-desactivar' && (
          <>
            <h2>¿Desactivar el PIN?</h2>
            <p>Cualquiera que abra la app en este dispositivo va a poder ver tus préstamos sin pedir nada.</p>
            <div className="action-row">
              <button className="btn btn-danger btn-block" onClick={handleDesactivar}>Sí, desactivar</button>
              <button className="btn btn-secondary btn-block" onClick={onCerrar}>Cancelar</button>
            </div>
          </>
        )}

        {paso === 'crear-pin' && (
          <>
            <h2>{yaTiene ? 'Elegí un PIN nuevo' : 'Activar PIN'}</h2>
            <p>4 dígitos, más una pregunta de seguridad por si te lo olvidás.</p>
            <form onSubmit={handleCrear}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="pinNuevo">PIN</label>
                  <input
                    id="pinNuevo"
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                    autoFocus
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="pinConfirmar">Confirmar</label>
                  <input
                    id="pinConfirmar"
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    value={confirmar}
                    onChange={(e) => setConfirmar(e.target.value.replace(/\D/g, ''))}
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="pregunta">Pregunta de seguridad</label>
                <select id="pregunta" value={pregunta} onChange={(e) => setPregunta(e.target.value)}>
                  {PREGUNTAS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              {pregunta === 'Otra (la escribo yo)' && (
                <div className="form-group">
                  <label htmlFor="preguntaCustom">Tu pregunta</label>
                  <input
                    id="preguntaCustom"
                    type="text"
                    value={preguntaCustom}
                    onChange={(e) => setPreguntaCustom(e.target.value)}
                  />
                </div>
              )}
              <div className="form-group">
                <label htmlFor="respuesta">Respuesta</label>
                <input
                  id="respuesta"
                  type="text"
                  value={respuesta}
                  onChange={(e) => setRespuesta(e.target.value)}
                />
              </div>
              {error && <div className="field-error">{error}</div>}
              <div className="action-row">
                <button type="submit" className="btn btn-primary btn-block">Guardar</button>
                <button type="button" className="btn btn-secondary" onClick={onCerrar}>Cancelar</button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
