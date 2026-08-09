# Cuentas Claras — Gestor de préstamos personales

App para llevar el control de préstamos: tanto lo que **vos le prestás a otras
personas** como lo que **vos debés**. Pensada para uso personal, con todos los
datos guardados en el propio dispositivo (no hay backend ni servidor).

## Índice

- [Qué resuelve](#qué-resuelve)
- [Stack técnico](#stack-técnico)
- [Cómo correr el proyecto](#cómo-correr-el-proyecto)
- [Estructura de carpetas](#estructura-de-carpetas)
- [Funcionalidades](#funcionalidades)
- [Cómo se guardan los datos](#cómo-se-guardan-los-datos)
- [PWA: instalación y accesos directos](#pwa-instalación-y-accesos-directos)
- [Limitaciones conocidas](#limitaciones-conocidas)
- [Ideas pendientes](#ideas-pendientes)

## Qué resuelve

Cuando prestás o pedís plata de manera informal (a familia, amigos, clientes),
es fácil perder el rastro de cuánto es el capital, cuánto interés se acumuló,
qué se pagó y qué falta. Esta app centraliza todo eso: alta de préstamos,
pagos parciales, interés (simple o compuesto), renovaciones, vencimientos,
proyecciones y un resumen consolidado por persona.

## Stack técnico

- **React 18 + Vite** — sin framework de routing; la navegación se maneja con
  estado de React (`seccion` / `view` en `App.jsx`), no hay URLs por pantalla.
- **vite-plugin-pwa** — genera el manifest, el service worker y hace que la
  app sea instalable y funcione offline.
- **localStorage** — toda la persistencia. No hay backend, API, ni base de
  datos externa.
- Sin librerías de UI ni de gráficos: los íconos son SVG inline
  (`src/components/icons.jsx`) y el gráfico de evolución mensual también es
  SVG hecho a mano (`EvolucionMensual.jsx`), para mantener el bundle liviano.

## Cómo correr el proyecto

```bash
npm install
npm run dev       # servidor de desarrollo, http://localhost:5173
npm run build     # build de producción en /dist
npm run preview   # sirve el build de producción localmente
```

No hay variables de entorno ni configuración adicional: no hay backend al
que apuntar.

## Estructura de carpetas

```
src/
  App.jsx                  Orquesta toda la navegación y el estado global
  storage.js                Wrapper de localStorage (load/save/uid)
  prestamoUtils.js           Todo el motor de cálculo: saldos, intereses,
                              cuotas, proyecciones, agrupaciones, etc.
  styles.css                  Único archivo de estilos, con variables CSS
                              (tema oscuro) en :root
  components/
    Dashboard.jsx             Resumen de balance (Inicio)
    ListaPrestamos.jsx         Lista con búsqueda, orden y swipe-to-pay
    FormPrestamo.jsx            Alta y edición (mismo componente, prop
                              `prestamoExistente` cambia el modo)
    DetallePrestamo.jsx          Detalle: pagos, renovación, cuotas,
                              comprobantes, historial
    GraficosScreen.jsx           Pestaña Gráficos
    CalculosScreen.jsx           Pestaña Cálculos (proyección de interés)
    InteresesScreen.jsx          Pestaña Intereses (neto cobrado/pagado)
    PersonasScreen.jsx           Pestaña Personas (agrupado por contacto)
    HistorialScreen.jsx          Pestaña Historial (timeline de pagos)
    TabBar.jsx                   Barra de navegación inferior fija
    BackupPanel.jsx               Exportar / importar JSON
    Toast.jsx                     Sistema de avisos (toast)
    OnboardingOverlay.jsx          Pantallas de bienvenida (primera vez)
    ControlTamanoLetra.jsx          Control de accesibilidad (zoom)
    RecordatoriosVencimiento.jsx    Banner + notificación de vencimientos
    icons.jsx                     Set de íconos SVG reutilizables
```

## Funcionalidades

### Préstamos
- Alta y edición de préstamos, en dos direcciones: **yo presto** / **yo
  debo**.
- Interés opcional (%), fecha de inicio y vencimiento opcional.
- Modalidad de pago único o **en cuotas**, con cronograma generado
  automáticamente (fecha y monto de cada cuota, marcadas como pagada /
  pendiente / vencida según lo efectivamente pagado).
- **Registrar pagos** parciales, con comprobante de texto copiable
  ("Recibí de Juan: $10.000 el 08/08. Saldo restante: $20.000.") listo para
  pegar en WhatsApp.
- **Pago rápido** desde la lista: deslizar una fila hacia la izquierda abre
  un mini formulario sin entrar al detalle.

### Renovación de préstamos vencidos
Si un préstamo vence y no se pagó completo, se puede **renovar**: el saldo
pendiente (capital + interés no pagado) pasa a ser el nuevo capital del
ciclo siguiente, con nueva tasa y vencimiento. El ciclo anterior queda
archivado en el historial del préstamo (`prestamo.historial`).

### Pestañas (barra de navegación inferior)
- **Inicio** — balance general, recordatorios de vencimiento, y la lista de
  préstamos con búsqueda y orden (reciente / vencimiento / monto /
  alfabético).
- **Gráficos** — comparativo de barras (me deben vs. debo) y evolución
  mensual del saldo en el tiempo.
- **Cálculos** — proyección de interés: dado un capital y una tasa mensual,
  muestra cuánto interés se generaría mes a mes o año a año, en modo simple
  (interés siempre sobre el capital original) o compuesto (sobre el saldo
  acumulado — el mismo criterio que usa la renovación).
- **Intereses** — interés efectivamente cobrado (préstamos que diste) vs.
  pagado (préstamos que tomaste), y el neto ganado.
- **Personas** — balance consolidado por persona, sumando todos sus
  préstamos. Incluye un ranking de quiénes renovaron más veces sin terminar
  de pagar.
- **Historial** — timeline de todos los pagos de todos los préstamos.

### Respaldo
- **Exportar** descarga un JSON con fecha en el nombre
  (`cuentas-claras-backup-YYYY-MM-DD.json`).
- **Importar** combina el archivo con los datos actuales (nunca sobreescribe
  todo de golpe): si un préstamo tiene el mismo `id` en ambos lados, gana la
  versión importada.
- Si nunca se exportó, o pasaron 30+ días desde el último respaldo, aparece
  un aviso en el header.

### Experiencia de uso
- Toasts de confirmación al guardar, pagar o eliminar.
- **Deshacer** al eliminar un préstamo (en vez de un `confirm()` nativo):
  queda 5 segundos para deshacer antes de perderse.
- Validación de formularios inline (campo en rojo + mensaje, no solo botón
  deshabilitado).
- Onboarding de 3 pantallas la primera vez que se abre la app.
- Control de tamaño de letra (3 niveles) para accesibilidad.
- Recordatorios de vencimiento: banner al abrir la app + notificación del
  navegador opcional (ver limitaciones más abajo).

## Cómo se guardan los datos

Todo vive en una sola clave de `localStorage`:
`cuentas-claras:prestamos:v1`, como un array JSON de préstamos. Cada
préstamo tiene esta forma aproximada:

```js
{
  id, tipo,              // 'doy' | 'tomo'
  persona, montoInicial, tasaInteres,
  fecha, fechaVencimiento,
  modalidad,             // 'unico' | 'cuotas'
  cantidadCuotas,
  notas,
  pagos: [{ id, monto, fecha }],
  historial: [           // ciclos anteriores, si se renovó alguna vez
    { montoInicial, tasaInteres, fecha, fechaVencimiento, pagos, saldoAlRenovar, fechaRenovacion }
  ]
}
```

No hay sincronización entre dispositivos. Para mover los datos a otro
dispositivo, o para no perderlos si se borra el caché del navegador, hay que
usar Exportar/Importar.

## PWA: instalación y accesos directos

La app se puede instalar desde el navegador (Android/desktop: ícono de
instalar en la barra de direcciones; iOS: Compartir → Agregar a pantalla de
inicio). Una vez instalada:

- Funciona offline (los archivos de la app están cacheados por el service
  worker; los datos siempre estuvieron solo en el dispositivo).
- Tiene **accesos directos**: mantener presionado el ícono de la app ofrece
  "Nuevo préstamo que doy" / "Nuevo préstamo que tomo" directo, sin pasar
  por la pantalla de inicio. (Funciona en Android/Chrome; no está soportado
  en todos los navegadores/plataformas.)

## Limitaciones conocidas

- **No hay PIN ni ninguna capa de seguridad**: cualquiera que abra el
  dispositivo puede ver todos los préstamos. Es la mejora pendiente más
  importante.
- **No hay notificaciones push reales** (con el celular bloqueado y la app
  cerrada) porque eso requiere un servidor backend que la app no tiene. Lo
  que sí hay es un aviso en el dashboard cada vez que se abre la app, y una
  notificación del navegador opcional mientras la app está abierta.
- **Sin multi-moneda**: los montos se formatean siempre en pesos argentinos
  (ARS).
- **Sin multiusuario/sincronización**: cada dispositivo tiene sus propios
  datos, independientes entre sí salvo que se usen Exportar/Importar
  manualmente.
- El control de tamaño de letra usa la propiedad CSS `zoom`, que no es
  estándar pero tiene soporte amplio en navegadores basados en Chromium (la
  mayoría de Android). En navegadores que no la soporten, el control
  simplemente no tiene efecto visual.

## Ideas pendientes

- PIN local para proteger el acceso a la app.
- Multi-moneda.
- Notas por pago individual (ej. "efectivo", "transferencia").
- Contacto directo (llamar / WhatsApp) desde el detalle de un préstamo.
