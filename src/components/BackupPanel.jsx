import { useRef, useState } from 'react'

function descargarJSON(prestamos) {
  const payload = {
    app: 'cuentas-claras',
    version: 1,
    exportadoEn: new Date().toISOString(),
    prestamos,
  }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const fecha = new Date().toISOString().slice(0, 10)
  a.href = url
  a.download = `cuentas-claras-backup-${fecha}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// Combina lo importado con lo actual: si un préstamo tiene el mismo id en ambos,
// gana la versión importada (se asume que es la copia de respaldo más reciente).
function fusionar(actuales, importados) {
  const mapa = new Map(actuales.map((p) => [p.id, p]))
  for (const p of importados) {
    mapa.set(p.id, p)
  }
  return Array.from(mapa.values())
}

export default function BackupPanel({ prestamos, onImportar }) {
  const inputRef = useRef(null)
  const [mensaje, setMensaje] = useState(null)
  const [error, setError] = useState(null)

  function handleExportar() {
    descargarJSON(prestamos)
  }

  function handleArchivoSeleccionado(e) {
    const file = e.target.files[0]
    if (!file) return
    setError(null)
    setMensaje(null)

    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result)
        const importados = Array.isArray(data) ? data : data.prestamos
        if (!Array.isArray(importados)) {
          throw new Error('El archivo no tiene el formato esperado')
        }
        const antes = prestamos.length
        const combinados = fusionar(prestamos, importados)
        onImportar(combinados)
        const nuevos = combinados.length - antes
        setMensaje(
          nuevos > 0
            ? `Se importaron ${nuevos} registro${nuevos === 1 ? '' : 's'} nuevo${nuevos === 1 ? '' : 's'}.`
            : 'El respaldo se combinó con tus datos actuales.'
        )
      } catch (err) {
        setError('No se pudo leer el archivo. Verificá que sea un respaldo válido de Cuentas Claras.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div className="backup-panel">
      <button className="backup-btn" onClick={handleExportar} title="Descargar una copia de tus datos">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3v12" /><path d="M7 10l5 5 5-5" /><path d="M4 19h16" />
        </svg>
        Exportar
      </button>
      <button className="backup-btn" onClick={() => inputRef.current?.click()} title="Restaurar desde un archivo de respaldo">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 21V9" /><path d="M7 14l5-5 5 5" /><path d="M4 5h16" />
        </svg>
        Importar
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="application/json"
        style={{ display: 'none' }}
        onChange={handleArchivoSeleccionado}
      />
      {mensaje && <div className="backup-msg ok">{mensaje}</div>}
      {error && <div className="backup-msg error">{error}</div>}
    </div>
  )
}
