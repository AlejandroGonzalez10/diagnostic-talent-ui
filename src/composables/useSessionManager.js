import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

export function useSessionManager() {
  const router = useRouter()
  const intervalId = ref(null)
  const sessionActive = ref(true)
  const notificacionMostrada = ref(false)

  // Verificar la validez del token de reportes (20 horas)
  const verificarSesion = () => {
    const token = localStorage.getItem('reportToken')
    const tokenTimestamp = localStorage.getItem('reportTokenTimestamp')
    
    if (!token || !tokenTimestamp) {
      // No hay sesión de reportes activa
      sessionActive.value = false
      return false
    }

    const tiempoActual = Date.now()
    const tiempoGuardado = parseInt(tokenTimestamp)
    const veinteHorasEnMs = 20 * 60 * 60 * 1000 // 20 horas en milisegundos
    const tiempoTranscurrido = tiempoActual - tiempoGuardado
    const tiempoRestante = veinteHorasEnMs - tiempoTranscurrido
    
    // Mostrar notificación cuando queden menos de 2 horas
    const dosHorasEnMs = 2 * 60 * 60 * 1000
    if (tiempoRestante <= dosHorasEnMs && tiempoRestante > 0 && !notificacionMostrada.value) {
      console.warn(`⚠️ La sesión de reportes expirará en ${Math.floor(tiempoRestante / (60 * 60 * 1000))} horas y ${Math.floor((tiempoRestante % (60 * 60 * 1000)) / (60 * 1000))} minutos`)
      notificacionMostrada.value = true
    }
    
    if (tiempoTranscurrido >= veinteHorasEnMs) {
      // Sesión de reportes expirada
      console.warn('🕒 Sesión de reportes expirada (20 horas), cerrando sesión automáticamente...')
      cerrarSesionCompleta()
      return false
    }

    sessionActive.value = true
    return true
  }

  // Cerrar sesión completamente (solo reportes)
  const cerrarSesionCompleta = () => {
    // Limpiar localStorage de reportes
    localStorage.removeItem('reportToken')
    localStorage.removeItem('reportUser')
    localStorage.removeItem('reportTokenTimestamp')
    
    // Limpiar sessionStorage de respuestas
    const keys = Object.keys(sessionStorage)
    keys.forEach(key => {
      if (key.startsWith('respuesta_')) {
        sessionStorage.removeItem(key)
      }
    })
    
    sessionActive.value = false
    
    // Redirigir al login
    router.push('/login')
  }

  // Función para cerrar sesión manualmente
  const cerrarSesionManual = () => {
    console.log('👋 Cerrando sesión de reportes manualmente...')
    cerrarSesionCompleta()
  }

  // Función para obtener tiempo restante de sesión de reportes
  const obtenerTiempoRestante = () => {
    const tokenTimestamp = localStorage.getItem('reportTokenTimestamp')
    
    if (!tokenTimestamp) {
      return 0
    }

    const tiempoActual = Date.now()
    const tiempoGuardado = parseInt(tokenTimestamp)
    const veinteHorasEnMs = 20 * 60 * 60 * 1000 // 20 horas en milisegundos
    const tiempoTranscurrido = tiempoActual - tiempoGuardado
    const tiempoRestante = veinteHorasEnMs - tiempoTranscurrido

    return Math.max(0, tiempoRestante)
  }

  // Función para obtener tiempo restante formateado de reportes
  const obtenerTiempoRestanteFormateado = () => {
    const tiempoRestante = obtenerTiempoRestante()
    
    if (tiempoRestante <= 0) {
      return 'Sesión expirada'
    }

    const horas = Math.floor(tiempoRestante / (60 * 60 * 1000))
    const minutos = Math.floor((tiempoRestante % (60 * 60 * 1000)) / (60 * 1000))
    
    return `${horas}h ${minutos}m restantes`
  }

  // Inicializar el monitoreo automático de reportes
  const iniciarMonitoreo = (intervaloMinutos = 5) => {
    // Verificación inicial
    verificarSesion()
    
    // Verificar cada X minutos (por defecto 5 minutos)
    const intervaloMs = intervaloMinutos * 60 * 1000
    intervalId.value = setInterval(() => {
      verificarSesion()
    }, intervaloMs)
    
    console.log(`🔄 Monitoreo de sesión de reportes iniciado - verificando cada ${intervaloMinutos} minutos`)
  }

  // Detener el monitoreo
  const detenerMonitoreo = () => {
    if (intervalId.value) {
      clearInterval(intervalId.value)
      intervalId.value = null
      console.log('⏹️ Monitoreo de sesión de reportes detenido')
    }
  }

  // Hook del ciclo de vida - iniciar al montar el componente
  onMounted(() => {
    iniciarMonitoreo()
  })

  // Hook del ciclo de vida - limpiar al desmontar el componente
  onUnmounted(() => {
    detenerMonitoreo()
  })

  return {
    sessionActive,
    verificarSesion,
    cerrarSesionManual,
    obtenerTiempoRestante,
    obtenerTiempoRestanteFormateado,
    iniciarMonitoreo,
    detenerMonitoreo
  }
}