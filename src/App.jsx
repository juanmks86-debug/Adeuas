import { useEffect, useRef, useState } from 'react'
import { storage } from './storage'
import Dashboard from './components/Dashboard'
import ListaPrestamos from './components/ListaPrestamos'
import FormPrestamo from './components/FormPrestamo'
import DetallePrestamo from './components/DetallePrestamo'
import BackupPanel from './components/BackupPanel'
import TabBar from './components/TabBar'
import GraficosScreen from './components/GraficosScreen'
import CalculosScreen from './components/CalculosScreen'
import InteresesScreen from './components/InteresesScreen'
import PersonasScreen from './components/PersonasScreen'
import HistorialScreen from './components/HistorialScreen'
import Toast from './components/Toast'
import OnboardingOverlay from './components/OnboardingOverlay'
import ControlTamanoLetra from './components/ControlTamanoLetra'
import './styles.css'

const KEY_ONBOARDING = 'cuentas-claras:onboarding-visto'
const KEY_ESCALA = 'cuentas-claras:escala-letra'

export default function App() {
  const [prestamos, setPrestamos] = useState(() => storage.load())
  const [tab, setTab] = useState('doy')
  const [seccion, setSeccion] = useState('inicio') // 'inicio' | 'graficos' | 'calculos' | 'intereses' | 'personas' | 'historial'
  const [view, setView] = useState('lista') // dentro de 'inicio': 'lista' | 'nuevo' | 'detalle' | 'editar'
  const [selectedId, setSelectedId] = useState(null)
  const [toast, setToast] = useState(null)
  const [mostrarOnboarding, setMostrarOnboarding] = useState(() => !localStorage.getItem(KEY_ONBOARDING))
  const [escala, setEscala] = useState(() => localStorage.getItem(KEY_ESCALA) || '1')
  const toastTimeout = useRef(null)
  const ultimoEliminado = useRef(null)

  useEffect(() => {
    storage.save(prestamos)
  }, [prestamos])

  useEffect(() => {
    localStorage.setItem(KEY_ESCALA, escala)
  }, [escala])

  // Acceso directo de la PWA: /?nuevo=doy o /?nuevo=tomo abre el formulario de alta.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const nuevo = params.get('nuevo')
    if (nuevo === 'doy' || nuevo === 'tomo') {
      setTab(nuevo)
      setSeccion('inicio')
      setView('nuevo')
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  function mostrarToast(mensaje, accion) {
    if (toastTimeout.current) clearTimeout(toastTimeout.current)
    setToast({ mensaje, accion })
    toastTimeout.current = setTimeout(() => setToast(null), accion ? 5000 : 2500)
  }

  function cerrarToast() {
    if (toastTimeout.current) clearTimeout(toastTimeout.current)
    setToast(null)
  }

  function cerrarOnboarding() {
    localStorage.setItem(KEY_ONBOARDING, '1')
    setMostrarOnboarding(false)
  }

  function handleSave(nuevo) {
    const editando = prestamos.some((p) => p.id === nuevo.id)
    setPrestamos((prev) => {
      const existe = prev.some((p) => p.id === nuevo.id)
      return existe ? prev.map((p) => (p.id === nuevo.id ? nuevo : p)) : [nuevo, ...prev]
    })
    setTab(nuevo.tipo)
    setSelectedId(nuevo.id)
    setView(view === 'editar' ? 'detalle' : 'lista')
    mostrarToast(editando ? 'Cambios guardados' : 'Préstamo guardado')
  }

  function handleUpdate(actualizado) {
    setPrestamos((prev) => prev.map((p) => (p.id === actualizado.id ? actualizado : p)))
  }

  function handleDelete(id) {
    const idx = prestamos.findIndex((p) => p.id === id)
    if (idx === -1) return
    const item = prestamos[idx]
    ultimoEliminado.current = { item, idx }
    setPrestamos((prev) => prev.filter((p) => p.id !== id))
    setView('lista')
    setSelectedId(null)
    mostrarToast(`Préstamo de ${item.persona} eliminado`, { label: 'Deshacer', onClick: deshacerEliminar })
  }

  function deshacerEliminar() {
    const guardado = ultimoEliminado.current
    if (!guardado) return
    setPrestamos((prev) => {
      const copia = [...prev]
      copia.splice(Math.min(guardado.idx, copia.length), 0, guardado.item)
      return copia
    })
    ultimoEliminado.current = null
    cerrarToast()
  }

  function pagoRapido(id, monto) {
    setPrestamos((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, pagos: [...(p.pagos || []), { id: storage.uid(), monto, fecha: new Date().toISOString().slice(0, 10) }] }
          : p
      )
    )
    mostrarToast('Pago registrado')
  }

  function openDetalle(id) {
    setSeccion('inicio')
    setSelectedId(id)
    setView('detalle')
  }

  function openEditar(id) {
    setSelectedId(id)
    setView('editar')
  }

  function cambiarSeccion(s) {
    setSeccion(s)
    setView('lista')
  }

  const seleccionado = prestamos.find((p) => p.id === selectedId)
  const mostrarTabBar = seccion !== 'inicio' || view === 'lista'

  return (
    <div className="app" style={{ zoom: escala !== '1' ? escala : undefined }}>
      {mostrarOnboarding && <OnboardingOverlay onCerrar={cerrarOnboarding} />}

      <header className="app-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1>Cuentas Claras</h1>
            <div className="subtitle">Lo que prestás y lo que debés, en un solo lugar</div>
          </div>
          <ControlTamanoLetra escala={escala} onCambiar={setEscala} />
        </div>
        <BackupPanel prestamos={prestamos} onImportar={setPrestamos} />
      </header>

      {mostrarTabBar && <TabBar activa={seccion} onCambiar={cambiarSeccion} />}

      {seccion === 'inicio' && view === 'lista' && (
        <div className="view-transition" key="lista">
          <Dashboard prestamos={prestamos} onAbrirPrestamo={openDetalle} />
          <ListaPrestamos
            prestamos={prestamos}
            tab={tab}
            setTab={setTab}
            onOpen={openDetalle}
            onPagoRapido={pagoRapido}
          />
          <button className="fab" onClick={() => setView('nuevo')} aria-label="Agregar préstamo">
            +
          </button>
        </div>
      )}

      {seccion === 'inicio' && view === 'nuevo' && (
        <div className="view-transition" key="nuevo">
          <FormPrestamo
            tipoInicial={tab}
            onCancel={() => setView('lista')}
            onSave={handleSave}
          />
        </div>
      )}

      {seccion === 'inicio' && view === 'editar' && seleccionado && (
        <div className="view-transition" key={`editar-${seleccionado.id}`}>
          <FormPrestamo
            prestamoExistente={seleccionado}
            onCancel={() => setView('detalle')}
            onSave={handleSave}
          />
        </div>
      )}

      {seccion === 'inicio' && view === 'detalle' && seleccionado && (
        <div className="view-transition" key={seleccionado.id}>
          <DetallePrestamo
            prestamo={seleccionado}
            onBack={() => setView('lista')}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onEditar={openEditar}
          />
        </div>
      )}

      {seccion === 'graficos' && (
        <div className="view-transition" key="graficos">
          <GraficosScreen prestamos={prestamos} />
        </div>
      )}

      {seccion === 'calculos' && (
        <div className="view-transition" key="calculos">
          <CalculosScreen prestamos={prestamos} />
        </div>
      )}

      {seccion === 'intereses' && (
        <div className="view-transition" key="intereses">
          <InteresesScreen prestamos={prestamos} />
        </div>
      )}

      {seccion === 'personas' && (
        <div className="view-transition" key="personas">
          <PersonasScreen prestamos={prestamos} onAbrirPrestamo={openDetalle} />
        </div>
      )}

      {seccion === 'historial' && (
        <div className="view-transition" key="historial">
          <HistorialScreen prestamos={prestamos} onAbrirPrestamo={openDetalle} />
        </div>
      )}

      <Toast toast={toast} onClose={cerrarToast} />
    </div>
  )
}
