import { useState } from 'react'
import {
  montoConInteres,
  totalPagado,
  saldoPendiente,
  estadoPrestamo,
  estadoLabel,
  formatMoney,
  formatDate,
  renovarPrestamo,
} from '../prestamoUtils'
import { storage } from '../storage'

export default function DetallePrestamo({ prestamo, onBack, onUpdate, onDelete }) {
  const [montoPago, setMontoPago] = useState('')
  const [fechaPago, setFechaPago] = useState(new Date().toISOString().slice(0, 10))
  const [mostrarRenovar, setMostrarRenovar] = useState(false)
  const [nuevaTasa, setNuevaTasa] = useState(prestamo.tasaInteres || '')
  const [nuevaFechaVenc, setNuevaFechaVenc] = useState('')

  const saldo = saldoPendiente(prestamo)
  const estado = estadoPrestamo(prestamo)
  const total = montoConInteres(prestamo)
  const pagado = totalPagado(prestamo)

  function registrarPago(e) {
    e.preventDefault()
    const monto = Number(montoPago)
    if (!monto || monto <= 0) return
    const pagos = [...(prestamo.pagos || []), { id: storage.uid(), monto, fecha: fechaPago }]
    onUpdate({ ...prestamo, pagos })
    setMontoPago('')
  }

  function eliminarPago(id) {
    const pagos = (prestamo.pagos || []).filter((p) => p.id !== id)
    onUpdate({ ...prestamo, pagos })
  }

  function handleRenovar(e) {
    e.preventDefault()
    const renovado = renovarPrestamo(prestamo, {
      fechaVencimiento: nuevaFechaVenc || null,
      tasaInteres: nuevaTasa,
    })
    onUpdate(renovado)
    setMostrarRenovar(false)
    setNuevaFechaVenc('')
  }

  function handleDelete() {
    if (confirm(`¿Eliminar el registro de ${prestamo.persona}? Esta acción no se puede deshacer.`)) {
      onDelete(prestamo.id)
    }
  }

  return (
    <div className="screen">
      <div className="back-row">
        <button className="back-btn" onClick={onBack}>← Volver</button>
      </div>

      <div className="detail-header">
        <span className={`tipo-badge ${prestamo.tipo}`}>
          {prestamo.tipo === 'doy' ? 'Le presté a' : 'Le debo a'}
        </span>
        <h2>{prestamo.persona}</h2>
        <div className={`saldo-hero ${prestamo.tipo}`}>{formatMoney(saldo)}</div>
        <div className="saldo-hero-label">
          {saldo <= 0 ? 'Saldado' : 'Saldo pendiente'} · <span className={`estado-chip ${estado}`}>{estadoLabel(estado)}</span>
        </div>
      </div>

      <div className="field-grid">
        <div>
          <div className="field-label">Monto original</div>
          <div className="field-value">{formatMoney(prestamo.montoInicial)}</div>
        </div>
        <div>
          <div className="field-label">Con interés</div>
          <div className="field-value">{formatMoney(total)}</div>
        </div>
        <div>
          <div className="field-label">Fecha</div>
          <div className="field-value">{formatDate(prestamo.fecha)}</div>
        </div>
        <div>
          <div className="field-label">Vencimiento</div>
          <div className="field-value">{prestamo.fechaVencimiento ? formatDate(prestamo.fechaVencimiento) : '—'}</div>
        </div>
        <div>
          <div className="field-label">Modalidad</div>
          <div className="field-value">
            {prestamo.modalidad === 'cuotas' ? `${prestamo.cantidadCuotas || '?'} cuotas` : 'Pago único'}
          </div>
        </div>
        <div>
          <div className="field-label">Ya pagado</div>
          <div className="field-value">{formatMoney(pagado)}</div>
        </div>
      </div>

      {prestamo.notas && (
        <>
          <div className="section-title">Notas</div>
          <div className="notas-box">{prestamo.notas}</div>
        </>
      )}

      <div className="section-title">Registrar pago</div>
      <form className="pago-form" onSubmit={registrarPago}>
        <div className="form-group">
          <label htmlFor="montoPago">Monto</label>
          <input
            id="montoPago"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            value={montoPago}
            onChange={(e) => setMontoPago(e.target.value)}
            placeholder="0"
          />
        </div>
        <div className="form-group">
          <label htmlFor="fechaPago">Fecha</label>
          <input
            id="fechaPago"
            type="date"
            value={fechaPago}
            onChange={(e) => setFechaPago(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={saldo <= 0}>
          Agregar
        </button>
      </form>

      {saldo > 0 && (
        <>
          <div className="section-title">Resolver vencimiento</div>
          {!mostrarRenovar ? (
            <div className="action-row" style={{ marginTop: 0 }}>
              <button className="btn btn-secondary" onClick={() => setMostrarRenovar(true)}>
                Renovar préstamo
              </button>
            </div>
          ) : (
            <form onSubmit={handleRenovar} className="renovar-box">
              <p style={{ margin: '0 0 12px', fontSize: 13, color: 'var(--ink)' }}>
                El nuevo capital va a ser el saldo pendiente actual:{' '}
                <strong style={{ fontFamily: 'var(--font-mono)' }}>{formatMoney(saldo)}</strong>
              </p>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="nuevaTasa">Nueva tasa de interés %</label>
                  <input
                    id="nuevaTasa"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.1"
                    value={nuevaTasa}
                    onChange={(e) => setNuevaTasa(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="nuevaFechaVenc">Nuevo vencimiento</label>
                  <input
                    id="nuevaFechaVenc"
                    type="date"
                    value={nuevaFechaVenc}
                    onChange={(e) => setNuevaFechaVenc(e.target.value)}
                  />
                </div>
              </div>
              <div className="action-row" style={{ marginTop: 12 }}>
                <button type="submit" className="btn btn-primary">
                  Confirmar renovación
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setMostrarRenovar(false)}>
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </>
      )}

      <div className="section-title">Historial de pagos</div>
      {(prestamo.pagos || []).length === 0 ? (
        <div className="empty-state" style={{ padding: '20px 0' }}>
          <p>Todavía no hay pagos registrados.</p>
        </div>
      ) : (
        [...prestamo.pagos]
          .sort((a, b) => (a.fecha < b.fecha ? 1 : -1))
          .map((pago) => (
            <div className="pago-row" key={pago.id}>
              <span>{formatDate(pago.fecha)}</span>
              <span className="monto">
                {formatMoney(pago.monto)}{' '}
                <button
                  className="btn-danger"
                  style={{ marginLeft: 8, fontSize: 12 }}
                  onClick={() => eliminarPago(pago.id)}
                >
                  quitar
                </button>
              </span>
            </div>
          ))
      )}

      {(prestamo.historial || []).length > 0 && (
        <>
          <div className="section-title">Historial de renovaciones</div>
          {[...prestamo.historial].reverse().map((ciclo, i) => (
            <div className="pago-row" key={i} style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <span>
                  {formatDate(ciclo.fecha)} → renovado {formatDate(ciclo.fechaRenovacion)}
                </span>
                <span className="monto">{formatMoney(ciclo.saldoAlRenovar)}</span>
              </div>
              <span style={{ fontSize: 11, color: 'var(--ink-soft)' }}>
                Capital {formatMoney(ciclo.montoInicial)} · interés {ciclo.tasaInteres || 0}% · vencía {formatDate(ciclo.fechaVencimiento)}
              </span>
            </div>
          ))}
        </>
      )}

      <div className="action-row">
        <button className="btn btn-danger" onClick={handleDelete}>
          Eliminar préstamo
        </button>
      </div>
    </div>
  )
}
