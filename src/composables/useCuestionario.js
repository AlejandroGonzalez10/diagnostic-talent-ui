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
    console.log('📂 Cargando datos guardados...')
    
    // Solo cargar datos de autenticación, no datos de negocio
    const tokenGuardado = localStorage.getItem('authToken')
    const usuarioGuardado = localStorage.getItem('authUser')
    
    if (tokenGuardado && usuarioGuardado) {
      console.log('🔐 Token y usuario encontrados en localStorage')
      token.value = tokenGuardado
      usuario.value = JSON.parse(usuarioGuardado)
      isAuthenticated.value = true
      console.log('✅ Usuario autenticado desde localStorage:', usuario.value)
    } else {
      console.log('⚠️ No se encontraron datos de autenticación en localStorage')
    }
  }

  // 🔐 Función de autenticación
  const autenticar = (authData) => {
    console.log('🔐 Proceso de autenticación iniciado')
    console.log('🔐 Datos de autenticación recibidos:', authData)
    
    if (authData.token && authData.user) {
      // Guardar en variables reactivas
      token.value = authData.token
      usuario.value = authData.user
      isAuthenticated.value = true
      
      // Guardar en localStorage para persistencia
      localStorage.setItem('authToken', authData.token)
      localStorage.setItem('authUser', JSON.stringify(authData.user))
      
      console.log('✅ Autenticación exitosa')
      console.log('🔐 Token guardado:', authData.token)
      console.log('🔐 Usuario guardado:', authData.user)
    } else {
      console.error('❌ Datos de autenticación inválidos:', authData)
    }
  }

  // 🆔 Función para establecer el ID de datos generales
  const setGeneralDataId = (id) => {
    console.log('🆔 Estableciendo generalDataId:', id)
    generalDataId.value = id
    console.log('✅ generalDataId establecido exitosamente')
  }

  const fetchCategorias = async () => {
    console.log('📂 Iniciando carga de categorías...')
    try {
      isLoading.value = true
      error.value = null
      console.log('🌐 Solicitando categorías al API...')
      categorias.value = await categoriesApi.getAll()
      console.log('✅ Categorías cargadas exitosamente:', categorias.value)
    } catch (err) {
      console.error('❌ Error al cargar categorías:', err)
      error.value = err.message
    } finally {
      isLoading.value = false
      console.log('🏁 Carga de categorías finalizada')
    }
  }

  const fetchPreguntas = async () => {
    console.log('📂 Iniciando carga de preguntas...')
    try {
      isLoading.value = true
      error.value = null
      
      console.log('🌐 Solicitando datos desde múltiples endpoints...')
      const [categoriasData, preguntasData, opcionesData] = await Promise.all([
        categoriesApi.getAll(),
        questionsApi.getAll(),
        optionsApi.getAll()
      ])
      console.log('✅ Datos recibidos desde APIs')
      console.log('📋 Categorías recibidas:', categoriasData)
      console.log('❓ Preguntas recibidas:', preguntasData)
      console.log('🔘 Opciones recibidas:', opcionesData)

      // Ordenar los datos
      console.log('🔢 Ordenando datos por campo order...')
      categorias.value = categoriasData.sort((a, b) => (a.order || 0) - (b.order || 0))
      preguntas.value = preguntasData.sort((a, b) => (a.order || 0) - (b.order || 0))
      opciones.value = opcionesData.sort((a, b) => (a.order || 0) - (b.order || 0))
      console.log('✅ Datos ordenados correctamente')

      // Organizar preguntas por categoría
      console.log('🗂️ Organizando preguntas por categoría...')
      preguntasPorCategoria.value = {}
      categorias.value.forEach(categoria => {
        preguntasPorCategoria.value[categoria.id] = preguntas.value.filter(
          pregunta => pregunta.categoryId === categoria.id
        ).sort((a, b) => (a.order || 0) - (b.order || 0))
        console.log(`📁 Categoría ${categoria.id}: ${preguntasPorCategoria.value[categoria.id].length} preguntas`)
      })
      console.log('✅ Preguntas organizadas por categoría:', preguntasPorCategoria.value)

      // Cargar datos guardados
      console.log('💾 Cargando datos guardados...')
      cargarDatosGuardados()
    } catch (err) {
      console.error('❌ Error al cargar preguntas:', err)
      error.value = err.message
    } finally {
      isLoading.value = false
      console.log('🏁 Carga de preguntas finalizada')
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
    console.log('📤 Enviando datos de respuesta al servidor...')
    console.log('📤 Datos a enviar:', datosRespuesta)
    
    try {
      await cuestionarioApi.enviarRespuesta(datosRespuesta)
      console.log('✅ Respuesta enviada exitosamente al servidor')
    } catch (error) {
      console.error('❌ Error al enviar respuesta al servidor:', error)
      throw error
    }
  }

  // 🚀 Función principal de envío automático de respuestas
  const enviarRespuestaAutomatica = async (preguntaId, respuesta) => {
    console.log('🚀 Iniciando envío automático de respuesta')
    console.log('🚀 PreguntaId:', preguntaId, 'Respuesta:', respuesta)

    if (!generalDataId.value) {
      console.log('⚠️ No se puede enviar respuesta, falta general_data_id')
      return
    }

    // Buscar la pregunta
    const pregunta = preguntas.value.find(p => p.id === parseInt(preguntaId))
    if (!pregunta) {
      console.log('❌ Pregunta no encontrada:', preguntaId)
      return
    }
    console.log('✅ Pregunta encontrada:', pregunta)

    // Buscar la opción seleccionada
    const opcion = opciones.value.find(opt => opt.value === respuesta)
    
    if (!opcion) {
      console.log('❌ Opción no encontrada para respuesta:', respuesta)
      console.log('❌ Intentando búsqueda alternativa...')
      
      // Búsqueda alternativa por conversión de string
      const opcionPorString = opciones.value.find(opt => opt.value.toString() === respuesta.toString())
      if (opcionPorString) {
        console.log('✅ Encontrada por conversión de string:', opcionPorString)
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
        console.log('🔄 Actualizando respuesta existente')
        await cuestionarioApi.actualizarRespuesta(datosRespuesta)
        console.log('✅ Respuesta actualizada exitosamente')
      } else {
        console.log('🆕 Creando nueva respuesta')
        await cuestionarioApi.enviarRespuesta(datosRespuesta)
        console.log('✅ Respuesta creada exitosamente')
        // Marcar como enviada en sessionStorage
        sessionStorage.setItem(claveRespuesta, 'true')
      }
    } catch (error) {
      console.error('❌ Error al enviar/actualizar respuesta:', error)
    }
  }

  // 💾 Función para guardar respuesta
  const guardarRespuesta = (preguntaId, respuesta) => {
    console.log('💾 Guardando respuesta:', { preguntaId, respuesta })
    respuestas.value[preguntaId] = respuesta
    
    // Enviar automáticamente si tenemos general_data_id
    if (generalDataId.value) {
      enviarRespuestaAutomatica(preguntaId, respuesta)
    } else {
      console.log('⚠️ No se puede enviar respuesta, falta general_data_id')
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