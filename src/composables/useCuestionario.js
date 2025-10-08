import { ref, computed } from 'vue'
import { categoriesApi, questionsApi, optionsApi, cuestionarioApi } from '@/services/api'

export function useCuestionario() {
  // 📋 Variables reactivas principales
  const preguntas = ref([])
  const categorias = ref([])
  const opciones = ref([])
  const preguntasPorCategoria = ref({})
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
    
    if (tokenGuardado && usuarioGuardado) {
      token.value = tokenGuardado
      usuario.value = JSON.parse(usuarioGuardado)
      isAuthenticated.value = true
    }
  }

  // 🔐 Función de autenticación
  const autenticar = (authData) => {
    if (authData.token && authData.user) {
      // Guardar en variables reactivas
      token.value = authData.token
      usuario.value = authData.user
      isAuthenticated.value = true
      
      // Guardar en localStorage para persistencia
      localStorage.setItem('authToken', authData.token)
      localStorage.setItem('authUser', JSON.stringify(authData.user))
    } else {
      console.error('❌ Datos de autenticación inválidos:', authData)
    }
  }

  // 🆔 Función para establecer el ID de datos generales
  const setGeneralDataId = (id) => {
    generalDataId.value = id
  }

  const fetchCategorias = async () => {
    try {
      isLoading.value = true
      error.value = null
      categorias.value = await categoriesApi.getAll()
    } catch (err) {
      console.error('❌ Error al cargar categorías:', err)
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
      console.error('❌ Error al cargar preguntas:', err)
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

  // 🔧 Función auxiliar para enviar datos de respuesta
  const enviarRespuestaDatos = async (datosRespuesta) => {
    try {
      await cuestionarioApi.enviarRespuesta(datosRespuesta)
    } catch (error) {
      console.error('❌ Error al enviar respuesta al servidor:', error)
      throw error
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

      // Verificar en sessionStorage si ya se envió esta respuesta
      const claveRespuesta = `respuesta_${generalDataId.value}_${preguntaId}`
      const respuestaYaEnviada = sessionStorage.getItem(claveRespuesta)

      if (respuestaYaEnviada) {
        await cuestionarioApi.actualizarRespuesta(datosRespuesta)
      } else {
        await cuestionarioApi.enviarRespuesta(datosRespuesta)
        // Marcar como enviada en sessionStorage
        sessionStorage.setItem(claveRespuesta, 'true')
      }
    } catch (error) {
      console.error('❌ Error al enviar/actualizar respuesta:', error)
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
    
    // 🔐 Funciones de autenticación
    autenticar,
    setGeneralDataId
  }
}