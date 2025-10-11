import { ref, computed } from 'vue'

export function useReportes() {
  // 🔐 Variables de autenticación para reportes
  const reportToken = ref(null)
  const reportUser = ref(null)
  const isReportAuthenticated = ref(false)

  // 💾 Función para cargar datos guardados de reportes (20 horas)
  const cargarDatosReportes = () => {
    const tokenGuardado = localStorage.getItem('reportToken')
    const usuarioGuardado = localStorage.getItem('reportUser')
    const tokenTimestamp = localStorage.getItem('reportTokenTimestamp')
    
    if (tokenGuardado && usuarioGuardado && tokenTimestamp) {
      // Verificar si el token ha expirado (20 horas = 72000000 ms)
      const tiempoActual = Date.now()
      const tiempoGuardado = parseInt(tokenTimestamp)
      const veinteHorasEnMs = 20 * 60 * 60 * 1000 // 20 horas en milisegundos
      
      if (tiempoActual - tiempoGuardado < veinteHorasEnMs) {
        // Token aún válido
        reportToken.value = tokenGuardado
        reportUser.value = JSON.parse(usuarioGuardado)
        isReportAuthenticated.value = true
      } else {
        // Token expirado, limpiar datos
        cerrarSesionReportes()
      }
    }
  }

  // 🔐 Función de autenticación para reportes
  const autenticarReportes = (authData) => {
    if (authData.token) {
      // Si hay token, intentar autenticar aunque no haya userData perfecta
      const userData = authData.adminUser || authData.user || authData.usuario || { id: 1, name: 'Usuario Test' }
      
      // Guardar en variables reactivas
      reportToken.value = authData.token
      reportUser.value = userData
      isReportAuthenticated.value = true
      
      // Guardar en localStorage para persistencia con timestamp
      const tiempoActual = Date.now()
      localStorage.setItem('reportToken', authData.token)
      localStorage.setItem('reportUser', JSON.stringify(userData))
      localStorage.setItem('reportTokenTimestamp', tiempoActual.toString())
      
      return true
    } else {
      return false
    }
  }

  // 🚪 Función para cerrar sesión de reportes
  const cerrarSesionReportes = () => {
    reportToken.value = null
    reportUser.value = null
    isReportAuthenticated.value = false
    
    // Limpiar localStorage de reportes
    localStorage.removeItem('reportToken')
    localStorage.removeItem('reportUser')
    localStorage.removeItem('reportTokenTimestamp')
  }

  // 🔍 Función para verificar si la sesión sigue válida
  const verificarSesionReportes = () => {
    const tokenTimestamp = localStorage.getItem('reportTokenTimestamp')
    
    if (!reportToken.value || !tokenTimestamp) {
      return false
    }

    const tiempoActual = Date.now()
    const tiempoGuardado = parseInt(tokenTimestamp)
    const veinteHorasEnMs = 20 * 60 * 60 * 1000 // 20 horas en milisegundos
    
    if (tiempoActual - tiempoGuardado >= veinteHorasEnMs) {
      // Sesión expirada
      cerrarSesionReportes()
      return false
    }

    return true
  }

  // ⏰ Función para obtener tiempo restante de sesión
  const obtenerTiempoRestanteReportes = () => {
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

  // 📝 Función para obtener tiempo restante formateado
  const obtenerTiempoRestanteFormateado = () => {
    const tiempoRestante = obtenerTiempoRestanteReportes()
    
    if (tiempoRestante <= 0) {
      return 'Sesión expirada'
    }

    const horas = Math.floor(tiempoRestante / (60 * 60 * 1000))
    const minutos = Math.floor((tiempoRestante % (60 * 60 * 1000)) / (60 * 1000))
    
    return `${horas}h ${minutos}m restantes`
  }

  // 🔄 Computed para facilitar el acceso
  const reportUserInfo = computed(() => {
    return reportUser.value ? {
      id: reportUser.value.id,
      name: reportUser.value.name || reportUser.value.nombre,
      email: reportUser.value.email,
      role: reportUser.value.role || reportUser.value.rol || 'Admin'
    } : null
  })

  // 🚀 Inicializar al crear el composable
  cargarDatosReportes()

  return {
    // Estado reactivo
    reportToken,
    reportUser,
    isReportAuthenticated,
    reportUserInfo,
    
    // Funciones
    autenticarReportes,
    cerrarSesionReportes,
    verificarSesionReportes,
    obtenerTiempoRestanteReportes,
    obtenerTiempoRestanteFormateado,
    cargarDatosReportes
  }
}