import { useEffect, useState } from 'react'
import { storage } from './storage'
import Dashboard from './components/Dashboard'
import ListaPrestamos from './components/ListaPrestamos'
import FormPrestamo from './components/FormPrestamo'
import DetallePrestamo from './components/DetallePrestamo'
import BackupPanel from './components/BackupPanel'
import './styles.css'

export default function App() {
  const [prestamos, setPrestamos] = useState(() => storage.load())
  const [tab, setTab] = useState('doy')
  const [view, setView] = useState('lista') // 'lista' | 'nuevo' | 'detalle' | 'editar'
  const [selectedId, setSelectedId] = useState(null)

  useEffect(() => {
    storage.save(prestamos)
  }, [prestamos])

  function handleSave(nuevo) {
    setPrestamos((prev) => {
      const existe = prev.some((p) => p.id === nuevo.id)
      return existe ? prev.map((p) => (p.id === nuevo.id ? nuevo : p)) : [nuevo, ...prev]
    })
    setTab(nuevo.tipo)
    setSelectedId(nuevo.id)
    setView(view === 'editar' ? 'detalle' : 'lista')
  }

  function handleUpdate(actualizado) {
    setPrestamos((prev) => prev.map((p) => (p.id === actualizado.id ? actualizado : p)))
  }

  function handleDelete(id) {
    setPrestamos((prev) => prev.filter((p) => p.id !== id))
    setView('lista')
    setSelectedId(null)
  }

  function openDetalle(id) {
    setSelectedId(id)
    setView('detalle')
  }

  function openEditar(id) {
    setSelectedId(id)
    setView('editar')
  }

  const seleccionado = prestamos.find((p) => p.id === selectedId)

  return (
    <div className="app">
      <header className="app-header">
        <h1>Cuentas Claras</h1>
        <div className="subtitle">Lo que prestás y lo que debés, en un solo lugar</div>
        <BackupPanel prestamos={prestamos} onImportar={setPrestamos} />
      </header>

      {view === 'lista' && (
        <div className="view-transition" key="lista">
          <Dashboard prestamos={prestamos} onAbrirPrestamo={openDetalle} />
          <ListaPrestamos
            prestamos={prestamos}
            tab={tab}
            setTab={setTab}
            onOpen={openDetalle}
          />
          <button className="fab" onClick={() => setView('nuevo')} aria-label="Agregar préstamo">
            +
          </button>
        </div>
      )}

      {view === 'nuevo' && (
        <div className="view-transition" key="nuevo">
          <FormPrestamo
            tipoInicial={tab}
            onCancel={() => setView('lista')}
            onSave={handleSave}
          />
        </div>
      )}

      {view === 'editar' && seleccionado && (
        <div className="view-transition" key={`editar-${seleccionado.id}`}>
          <FormPrestamo
            prestamoExistente={seleccionado}
            onCancel={() => setView('detalle')}
            onSave={handleSave}
          />
        </div>
      )}

      {view === 'detalle' && seleccionado && (
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
    </div>
  )
}
