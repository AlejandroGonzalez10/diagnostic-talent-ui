import { ref, computed } from 'vue'
import { categoriesApi, questionsApi, optionsApi, cuestionarioApi } from '@/services/api'

export function useCuestionario() {
  // 📋 Variables reactivas principales
  const preguntas = ref([])
  const categorias = ref([])
  const opciones = ref([])
  const preguntasPorCategoria = computed(() => {
    const resultado = {}
    categorias.value.forEach(categoria => {
      resultado[categoria.id] = preguntas.value.filter(p => p.categoryId === categoria.id)
    })
    return resultado
  })
  const respuestas = ref({})
  const isLoading = ref(false)
  const error = ref(null)
  const generalDataId = ref(null)
  
  // 🔐 Variables de autenticación JWT
  const token = ref(null)
  const usuario = ref(null)
  const isAuthenticated = ref(false)

  // 💾 Función para cargar datos guardados (solo autenticación, no datos de negocio)
  const cargarDatosGuardados = () => {
    // Solo cargar datos de autenticación, no datos de negocio
    const tokenGuardado = localStorage.getItem('authToken')
    const usuarioGuardado = localStorage.getItem('authUser')
    const tokenTimestamp = localStorage.getItem('authTokenTimestamp')
    const generalDataIdGuardado = localStorage.getItem('generalDataId')
    
    if (tokenGuardado && usuarioGuardado && tokenTimestamp) {
      // Verificar si el token ha expirado (2 horas = 7200000 ms)
      const tiempoActual = Date.now()
      const tiempoGuardado = parseInt(tokenTimestamp)
      const dosHorasEnMs = 2 * 60 * 60 * 1000 // 2 horas en milisegundos
      
      if (tiempoActual - tiempoGuardado < dosHorasEnMs) {
        // Token aún válido
        token.value = tokenGuardado
        usuario.value = JSON.parse(usuarioGuardado)
        isAuthenticated.value = true
        
        // Cargar generalDataId si existe
        if (generalDataIdGuardado) {
          generalDataId.value = parseInt(generalDataIdGuardado)
        }
      } else {
        // Token expirado, limpiar datos
        cerrarSesion()
      }
    }
  }

  // 🔐 Función de autenticación
  const autenticar = (authData) => {
    // Verificar si tenemos token y adminUser (nueva estructura) o token y user (estructura anterior)
    const userData = authData.adminUser || authData.user
    
    if (authData.token && userData) {
      // Guardar en variables reactivas
      token.value = authData.token
      usuario.value = userData
      isAuthenticated.value = true
      
      // Guardar en localStorage para persistencia con timestamp
      const tiempoActual = Date.now()
      localStorage.setItem('authToken', authData.token)
      localStorage.setItem('authUser', JSON.stringify(userData))
      localStorage.setItem('authTokenTimestamp', tiempoActual.toString())
    } else {
      // Datos de autenticación inválidos
    }
  }

  // 🚪 Función para cerrar sesión (limpiar autenticación)
  const cerrarSesion = () => {
    token.value = null
    usuario.value = null
    isAuthenticated.value = false
    generalDataId.value = null
    
    // Limpiar localStorage
    localStorage.removeItem('authToken')
    localStorage.removeItem('authUser')
    localStorage.removeItem('authTokenTimestamp')
    localStorage.removeItem('generalDataId')
    
    // Limpiar sessionStorage de respuestas
    const keys = Object.keys(sessionStorage)
    keys.forEach(key => {
      if (key.startsWith('respuesta_')) {
        sessionStorage.removeItem(key)
      }
    })
  }

  // 🆔 Función para establecer el ID de datos generales
  const setGeneralDataId = (id) => {
    generalDataId.value = id
    // Persistir en localStorage para mantener entre recargas
    if (id) {
      localStorage.setItem('generalDataId', id.toString())
    } else {
      localStorage.removeItem('generalDataId')
    }
  }

  // 📥 Función para cargar datos generales existentes
  const cargarDatosGenerales = async () => {
    try {
      const response = await cuestionarioApi.obtenerDatosGenerales()
      
      if (response && response.id) {
        // Guardar el ID de datos generales
        setGeneralDataId(response.id)
        
        // Retornar los datos para que el componente los use
        return {
          id: response.id,
          entidad: response.company || '',
          nit: response.nit || '',
          sector: response.sector || '',
          empleados: response.employees_number || '',
          nombre: response.chief_name || '',
          cargo: response.company_role || '',
          correo: response.chief_email || ''
        }
      }
      
      return null
    } catch (error) {
      return null
    }
  }

  // 📥 Función para cargar respuestas existentes
  const cargarRespuestasGuardadas = async (generalDataId) => {
    try {
      const response = await cuestionarioApi.obtenerRespuestas(generalDataId)
      
      if (response && Array.isArray(response)) {
        // Crear un nuevo objeto para forzar la reactividad
        const nuevasRespuestas = { ...respuestas.value }
        
        // Mapear las respuestas al formato esperado
        response.forEach(respuesta => {
          if (respuesta.question_id && respuesta.value !== undefined) {
            // El value puede ser un número decimal como 2.5
            nuevasRespuestas[respuesta.question_id] = respuesta.value
            
            // Guardar en sessionStorage para control de duplicados
            const claveRegistro = `respuesta_${respuesta.general_data_id}_${respuesta.category_id}_${respuesta.question_id}`
            if (respuesta.id) {
              sessionStorage.setItem(claveRegistro, respuesta.id.toString())
            }
          }
        })
        
        // Asignar el nuevo objeto para activar la reactividad
        respuestas.value = nuevasRespuestas
        
        return true
      }
      
      return false
    } catch (error) {
      return false
    }
  }

  const fetchCategorias = async () => {
    try {
      isLoading.value = true
      error.value = null
      categorias.value = await categoriesApi.getAll()
    } catch (err) {
      error.value = err.message
    } finally {
      isLoading.value = false
    }
  }

  const fetchPreguntas = async () => {
    try {
      isLoading.value = true
      error.value = null
      
      const [categoriasData, preguntasData, opcionesData] = await Promise.all([
        categoriesApi.getAll(),
        questionsApi.getAll(),
        optionsApi.getAll()
      ])

      // Ordenar los datos
      categorias.value = categoriasData.sort((a, b) => (a.order || 0) - (b.order || 0))
      preguntas.value = preguntasData.sort((a, b) => (a.order || 0) - (b.order || 0))
      opciones.value = opcionesData.sort((a, b) => (a.order || 0) - (b.order || 0))

      // Organizar preguntas por categoría
      preguntasPorCategoria.value = {}
      categorias.value.forEach(categoria => {
        preguntasPorCategoria.value[categoria.id] = preguntas.value.filter(
          pregunta => pregunta.categoryId === categoria.id
        ).sort((a, b) => (a.order || 0) - (b.order || 0))
      })

      // Cargar datos guardados
      cargarDatosGuardados()
    } catch (err) {
      error.value = err.message
    } finally {
      isLoading.value = false
    }
  }

  const calcularPuntajePregunta = (respuesta, opciones) => {
    const opcion = opciones.find(opt => opt.value === respuesta)
    if (opcion) {
      const puntaje = opcion.points !== undefined ? opcion.points : opcion.value
      return Number(puntaje) || 0
    }
    
    const PESOS = {
      'Si': 5,
      'En Parte': 3,
      'No': 1
    }
    return PESOS[respuesta] || 0
  }

  const calcularPuntajeCategoria = (categoriaId) => {
    const preguntasCategoria = preguntasPorCategoria.value[categoriaId] || []
    if (!preguntasCategoria.length) return '0.00'

    let puntajeTotal = 0

    preguntasCategoria.forEach(pregunta => {
      const respuesta = respuestas.value[pregunta.id]
      if (respuesta) {
        puntajeTotal += calcularPuntajePregunta(respuesta, opciones.value)
      }
    })

    const promedio = puntajeTotal / preguntasCategoria.length
    return promedio.toFixed(2)
  }

  const calcularPuntajeTotal = () => {
    if (!categorias.value.length) return '0.00'

    let puntajeTotal = 0
    let pesoTotal = 0

    categorias.value.forEach(categoria => {
      const preguntasCategoria = preguntasPorCategoria.value[categoria.id] || []
      if (preguntasCategoria.length > 0) {
        let puntajeCategoria = 0

        // Sumar el puntaje de todas las preguntas (respondidas o no)
        preguntasCategoria.forEach(pregunta => {
          const respuesta = respuestas.value[pregunta.id]
          if (respuesta) {
            puntajeCategoria += calcularPuntajePregunta(respuesta, opciones.value)
          }
          // Si no está respondida, se suma 0
        })

        // Calcular el promedio contra el total de preguntas de la categoría
        const promedioCategoria = puntajeCategoria / preguntasCategoria.length
        const peso = categoria.weight || categoria.peso || 25
        
        puntajeTotal += promedioCategoria * (peso / 100)
        pesoTotal += (peso / 100)
      }
    })

    if (pesoTotal === 0) return '0.00'

    const promedioPonderado = puntajeTotal / pesoTotal
    return promedioPonderado.toFixed(2)
  }

  // 🔧 Función auxiliar para enviar datos de respuesta (CON CONTROL DE DUPLICADOS)
  const enviarRespuestaDatos = async (datosRespuesta) => {
    // Usar sessionStorage con clave que incluya general_data_id para que sea única por formulario
    const claveRegistro = `respuesta_${datosRespuesta.general_data_id}_${datosRespuesta.category_id}_${datosRespuesta.question_id}`
    const registroId = sessionStorage.getItem(claveRegistro)
    
    if (registroId) {
      // Ya existe un registro, actualizar usando el ID guardado
      datosRespuesta.id = parseInt(registroId)
      
      try {
        await cuestionarioApi.actualizarRespuesta(datosRespuesta)
      } catch (updateError) {
        // Si falla el PUT, intentar POST
        const resultado = await cuestionarioApi.enviarRespuesta(datosRespuesta)
        if (resultado && resultado.id) {
          sessionStorage.setItem(claveRegistro, resultado.id.toString())
        }
      }
    } else {
      // Primera vez enviando esta respuesta para esta combinación
      try {
        const resultado = await cuestionarioApi.enviarRespuesta(datosRespuesta)
        
        // Intentar varias formas de obtener el ID
        let idRespuesta = null
        if (resultado) {
          idRespuesta = resultado.id || resultado.ID || resultado.answer_id || resultado.answerId
          
          if (!idRespuesta && resultado.data) {
            idRespuesta = resultado.data.id || resultado.data.ID || resultado.data.answer_id
          }
        }
        
        if (idRespuesta) {
          sessionStorage.setItem(claveRegistro, idRespuesta.toString())
        }
      } catch (error) {
        // Error al enviar respuesta
      }
    }
  }

  // 🚀 Función principal de envío automático de respuestas
  const enviarRespuestaAutomatica = async (preguntaId, respuesta) => {
    if (!generalDataId.value) {
      return
    }

    // Buscar la pregunta
    const pregunta = preguntas.value.find(p => p.id === parseInt(preguntaId))
    
    if (!pregunta) {
      return
    }

    // Buscar la opción seleccionada
    const opcion = opciones.value.find(opt => opt.value === respuesta)
    
    if (!opcion) {
      // Búsqueda alternativa por conversión de string
      const opcionPorString = opciones.value.find(opt => opt.value.toString() === respuesta.toString())
      if (opcionPorString) {
        const valorNumerico = Number(opcionPorString.value)
        
        if (!isNaN(valorNumerico)) {
          const datosRespuesta = {
            general_data_id: parseInt(generalDataId.value),
            category_id: parseInt(pregunta.categoryId),
            question_id: parseInt(preguntaId),
            value: valorNumerico
          }
          
          await enviarRespuestaDatos(datosRespuesta)
          return
        }
      }
      
      return
    }

    const valorNumerico = Number(opcion.value)
    
    if (isNaN(valorNumerico)) {
      return
    }

    try {
      const datosRespuesta = {
        general_data_id: parseInt(generalDataId.value),
        category_id: parseInt(pregunta.categoryId),
        question_id: parseInt(preguntaId),
        value: valorNumerico
      }

      // Usar sessionStorage con clave que incluya general_data_id para que sea única por formulario
      const claveRegistro = `respuesta_${generalDataId.value}_${pregunta.categoryId}_${preguntaId}`
      const registroId = sessionStorage.getItem(claveRegistro)
      if (registroId) {
        // Ya existe un registro, actualizar usando el ID guardado
        datosRespuesta.id = parseInt(registroId)
        
        try {
          await cuestionarioApi.actualizarRespuesta(datosRespuesta)
        } catch (updateError) {
          // Si falla el PUT, intentar POST
          const resultado = await cuestionarioApi.enviarRespuesta(datosRespuesta)
          if (resultado && resultado.id) {
            sessionStorage.setItem(claveRegistro, resultado.id.toString())
          }
        }
      } else {
        // Primera vez enviando esta respuesta para esta combinación
        
        try {
          const resultado = await cuestionarioApi.enviarRespuesta(datosRespuesta)
          
          // Intentar varias formas de obtener el ID
          let idRespuesta = null
          if (resultado) {
            idRespuesta = resultado.id || resultado.ID || resultado.answer_id || resultado.answerId
            
            if (!idRespuesta && resultado.data) {
              idRespuesta = resultado.data.id || resultado.data.ID || resultado.data.answer_id
            }
          }
          
          if (idRespuesta) {
            sessionStorage.setItem(claveRegistro, idRespuesta.toString())
          }
        } catch (error) {
          // Error al enviar respuesta
        }
      }
    } catch (error) {
      // Error al enviar/actualizar respuesta
    }
  }

  // 💾 Función para guardar respuesta
  const guardarRespuesta = (preguntaId, respuesta) => {
    respuestas.value[preguntaId] = respuesta
    
    // Enviar automáticamente si tenemos general_data_id
    if (generalDataId.value) {
      enviarRespuestaAutomatica(preguntaId, respuesta)
    }
  }

  const validarRespuestas = () => {
    return preguntas.value.every(pregunta => respuestas.value[pregunta.id])
  }

  const formularioCompleto = computed(() => {
    if (!preguntas.value.length) return false
    return preguntas.value.every(pregunta => respuestas.value[pregunta.id])
  })

  return {
    // 📊 Estado reactivo
    preguntas,
    categorias,
    opciones,
    preguntasPorCategoria,
    respuestas,
    isLoading,
    error,
    formularioCompleto,
    generalDataId,

    // 🔐 Variables de autenticación
    token,
    usuario,
    isAuthenticated,

    // 🔧 Funciones principales
    fetchCategorias,
    fetchPreguntas,
    calcularPuntajePregunta,
    calcularPuntajeCategoria,
    calcularPuntajeTotal,
    validarRespuestas,
    cargarDatosGuardados,
    guardarRespuesta,
    enviarRespuestaAutomatica,
    cargarDatosGenerales,
    cargarRespuestasGuardadas,
    
    // 🔐 Funciones de autenticación
    autenticar,
    cerrarSesion,
    setGeneralDataId
  }
}