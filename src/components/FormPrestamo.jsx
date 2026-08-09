import { useState } from 'react'
import { storage } from '../storage'

const hoy = () => new Date().toISOString().slice(0, 10)

export default function FormPrestamo({ tipoInicial, prestamoExistente, onCancel, onSave }) {
  const editando = Boolean(prestamoExistente)
  const [tipo, setTipo] = useState(prestamoExistente?.tipo || tipoInicial || 'doy')
  const [persona, setPersona] = useState(prestamoExistente?.persona || '')
  const [montoInicial, setMontoInicial] = useState(prestamoExistente?.montoInicial ?? '')
  const [fecha, setFecha] = useState(prestamoExistente?.fecha || hoy())
  const [fechaVencimiento, setFechaVencimiento] = useState(prestamoExistente?.fechaVencimiento || '')
  const [tasaInteres, setTasaInteres] = useState(prestamoExistente?.tasaInteres ?? '')
  const [modalidad, setModalidad] = useState(prestamoExistente?.modalidad || 'unico')
  const [cantidadCuotas, setCantidadCuotas] = useState(prestamoExistente?.cantidadCuotas ?? '')
  const [notas, setNotas] = useState(prestamoExistente?.notas || '')

  const puedeGuardar = persona.trim() && Number(montoInicial) > 0

  function handleSubmit(e) {
    e.preventDefault()
    if (!puedeGuardar) return
    const base = {
      id: editando ? prestamoExistente.id : storage.uid(),
      tipo,
      persona: persona.trim(),
      montoInicial: Number(montoInicial),
      fecha,
      fechaVencimiento: fechaVencimiento || null,
      tasaInteres: tasaInteres ? Number(tasaInteres) : 0,
      modalidad,
      cantidadCuotas: modalidad === 'cuotas' ? Number(cantidadCuotas) || null : null,
      notas: notas.trim(),
      pagos: editando ? prestamoExistente.pagos || [] : [],
    }
    if (editando && prestamoExistente.historial) {
      base.historial = prestamoExistente.historial
    }
    onSave(base)
  }

  return (
    <div className="screen">
      <div className="back-row">
        <button className="back-btn" onClick={onCancel}>← Cancelar</button>
      </div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, margin: '8px 0 20px' }}>
        {editando ? 'Editar préstamo' : 'Nuevo préstamo'}
      </h2>

      <div className="tipo-toggle">
        <button
          type="button"
          className={`doy ${tipo === 'doy' ? 'active' : ''}`}
          onClick={() => setTipo('doy')}
        >
          Yo presto
        </button>
        <button
          type="button"
          className={`tomo ${tipo === 'tomo' ? 'active' : ''}`}
          onClick={() => setTipo('tomo')}
        >
          Yo debo
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="persona">{tipo === 'doy' ? 'A quién le prestás' : 'A quién le debés'}</label>
          <input
            id="persona"
            type="text"
            value={persona}
            onChange={(e) => setPersona(e.target.value)}
            placeholder="Nombre"
            autoFocus
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="monto">Monto</label>
            <input
              id="monto"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={montoInicial}
              onChange={(e) => setMontoInicial(e.target.value)}
              placeholder="0"
            />
          </div>
          <div className="form-group">
            <label htmlFor="interes">Interés % (opcional)</label>
            <input
              id="interes"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={tasaInteres}
              onChange={(e) => setTasaInteres(e.target.value)}
              placeholder="0"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="fecha">Fecha</label>
            <input id="fecha" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="venc">Vencimiento (opcional)</label>
            <input
              id="venc"
              type="date"
              value={fechaVencimiento}
              onChange={(e) => setFechaVencimiento(e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="modalidad">Modalidad de pago</label>
          <select id="modalidad" value={modalidad} onChange={(e) => setModalidad(e.target.value)}>
            <option value="unico">Pago único</option>
            <option value="cuotas">En cuotas</option>
          </select>
        </div>

        {modalidad === 'cuotas' && (
          <div className="form-group">
            <label htmlFor="cuotas">Cantidad de cuotas</label>
            <input
              id="cuotas"
              type="number"
              min="1"
              step="1"
              value={cantidadCuotas}
              onChange={(e) => setCantidadCuotas(e.target.value)}
              placeholder="Ej: 6"
            />
          </div>
        )}

        <div className="form-group">
          <label htmlFor="notas">Notas (opcional)</label>
          <textarea
            id="notas"
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            placeholder="Detalles, acuerdo, etc."
          />
        </div>

        <div className="action-row">
          <button type="submit" className="btn btn-primary btn-block" disabled={!puedeGuardar}>
            {editando ? 'Guardar cambios' : 'Guardar préstamo'}
          </button>
        </div>
      </form>
    </div>
  )
}
