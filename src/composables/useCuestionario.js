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

  // 🚪 Función para cerrar sesión (limpiar autenticación)
  const cerrarSesion = () => {
    token.value = null
    usuario.value = null
    isAuthenticated.value = false
    generalDataId.value = null
    
    // Limpiar localStorage
    localStorage.removeItem('authToken')
    localStorage.removeItem('authUser')
    
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

  // 🔧 Función auxiliar para enviar datos de respuesta (CON CONTROL DE DUPLICADOS)
  const enviarRespuestaDatos = async (datosRespuesta) => {
    try {
      // Usar sessionStorage con clave que incluya general_data_id para que sea única por formulario
      const claveRegistro = `respuesta_${datosRespuesta.general_data_id}_${datosRespuesta.category_id}_${datosRespuesta.question_id}`
      const registroId = sessionStorage.getItem(claveRegistro)
      
      if (registroId) {
        // Ya existe un registro, actualizar usando el ID guardado
        datosRespuesta.id = parseInt(registroId)
        
        try {
          await cuestionarioApi.actualizarRespuesta(datosRespuesta)
        } catch (updateError) {
          console.error('❌ Error al actualizar, intentando crear nueva:', updateError)
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
          } else {
            console.warn('⚠️ No se pudo extraer el ID de la respuesta del servidor')
          }
        } catch (error) {
          console.error('❌ Error al enviar respuesta:', error)
        }
      }
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

      // Usar sessionStorage con clave que incluya general_data_id para que sea única por formulario
      const claveRegistro = `respuesta_${generalDataId.value}_${pregunta.categoryId}_${preguntaId}`
      const registroId = sessionStorage.getItem(claveRegistro)
      
      // Mostrar todo el contenido del sessionStorage para debugging
      console.log('🗄️ Contenido actual de sessionStorage:', {
        totalItems: sessionStorage.length,
        items: Object.keys(sessionStorage).reduce((acc, key) => {
          acc[key] = sessionStorage.getItem(key)
          return acc
        }, {})
      })
      
      console.log('🔍 Verificando registro existente:', { 
        claveRegistro, 
        registroId, 
        generalDataId: generalDataId.value,
        categoriaId: pregunta.categoryId, 
        preguntaId 
      })
      
      if (registroId) {
        // Ya existe un registro, actualizar usando el ID guardado
        console.log('🔄 Actualizando respuesta existente:', { 
          preguntaId, 
          categoriaId: pregunta.categoryId, 
          respuesta, 
          registroId 
        })
        console.log('📤 Datos que se envían para actualizar:', datosRespuesta)
        datosRespuesta.id = parseInt(registroId)
        
        try {
          const resultadoUpdate = await cuestionarioApi.actualizarRespuesta(datosRespuesta)
          console.log('✅ Respuesta actualizada correctamente:', resultadoUpdate)
        } catch (updateError) {
          console.error('❌ Error al actualizar, intentando crear nueva:', updateError)
          // Si falla el PUT, intentar POST
          const resultado = await cuestionarioApi.enviarRespuesta(datosRespuesta)
          console.log('📝 Resultado del POST de fallback:', resultado)
          if (resultado && resultado.id) {
            sessionStorage.setItem(claveRegistro, resultado.id.toString())
            console.log('💾 Nuevo ID guardado en sessionStorage:', resultado.id)
          }
        }
      } else {
        // Primera vez enviando esta respuesta para esta combinación
        console.log('✅ Enviando nueva respuesta:', { 
          preguntaId, 
          categoriaId: pregunta.categoryId, 
          respuesta,
          generalDataId: generalDataId.value
        })
        
        try {
          const resultado = await cuestionarioApi.enviarRespuesta(datosRespuesta)
          console.log('📝 Resultado completo del POST:', resultado)
          console.log('📝 Tipo de resultado:', typeof resultado)
          console.log('📝 Propiedades del resultado:', Object.keys(resultado || {}))
          
          // Intentar varias formas de obtener el ID
          let idRespuesta = null
          if (resultado) {
            idRespuesta = resultado.id || resultado.ID || resultado.answer_id || resultado.answerId
            
            if (!idRespuesta && resultado.data) {
              idRespuesta = resultado.data.id || resultado.data.ID || resultado.data.answer_id
            }
            
            console.log('🔍 ID encontrado:', idRespuesta)
          }
          
          if (idRespuesta) {
            sessionStorage.setItem(claveRegistro, idRespuesta.toString())
            console.log('💾 ID guardado en sessionStorage:', { 
              clave: claveRegistro, 
              id: idRespuesta 
            })
            
            // Verificar que se guardó correctamente
            const verificacion = sessionStorage.getItem(claveRegistro)
            console.log('✔️ Verificación de guardado:', verificacion)
          } else {
            console.warn('⚠️ No se pudo extraer el ID de la respuesta del servidor')
            console.warn('⚠️ Resultado recibido:', resultado)
          }
        } catch (error) {
          console.error('❌ Error al enviar respuesta:', error)
        }
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
    cerrarSesion,
    setGeneralDataId
  }
}