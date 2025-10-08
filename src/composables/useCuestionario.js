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
    
    console.log('🚪 Sesión cerrada y datos limpiados')
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
      console.log('🔧 ENTRANDO a enviarRespuestaDatos:', datosRespuesta)
      
      // Usar sessionStorage con clave que incluya general_data_id para que sea única por formulario
      const claveRegistro = `respuesta_${datosRespuesta.general_data_id}_${datosRespuesta.category_id}_${datosRespuesta.question_id}`
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
        generalDataId: datosRespuesta.general_data_id,
        categoriaId: datosRespuesta.category_id, 
        preguntaId: datosRespuesta.question_id
      })
      
      if (registroId) {
        // Ya existe un registro, actualizar usando el ID guardado
        console.log('🔄 Actualizando respuesta existente:', { 
          preguntaId: datosRespuesta.question_id, 
          categoriaId: datosRespuesta.category_id, 
          valor: datosRespuesta.value, 
          registroId 
        })
        
        // Agregar el ID al body de la petición
        datosRespuesta.id = parseInt(registroId)
        console.log('📤 Datos completos que se envían para PUT (con ID en body):', datosRespuesta)
        
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
          preguntaId: datosRespuesta.question_id, 
          categoriaId: datosRespuesta.category_id, 
          valor: datosRespuesta.value,
          generalDataId: datosRespuesta.general_data_id
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
      console.error('❌ Error al enviar respuesta al servidor:', error)
      throw error
    }
  }

  // 🚀 Función principal de envío automático de respuestas
  const enviarRespuestaAutomatica = async (preguntaId, respuesta) => {
    console.log('🚀 INICIANDO enviarRespuestaAutomatica:', { 
      preguntaId, 
      respuesta, 
      generalDataId: generalDataId.value 
    })
    
    if (!generalDataId.value) {
      console.warn('❌ No hay generalDataId, cancelando envío')
      return
    }

    // Buscar la pregunta
    const pregunta = preguntas.value.find(p => p.id === parseInt(preguntaId))
    console.log('🔍 Búsqueda de pregunta:', { 
      preguntaId, 
      preguntaIdInt: parseInt(preguntaId),
      preguntaEncontrada: pregunta,
      totalPreguntas: preguntas.value.length
    })
    
    if (!pregunta) {
      console.warn('❌ Pregunta no encontrada, cancelando envío')
      return
    }

    // Buscar la opción seleccionada
    const opcion = opciones.value.find(opt => opt.value === respuesta)
    console.log('🔍 Búsqueda de opción:', { 
      respuesta, 
      opcionEncontrada: opcion,
      totalOpciones: opciones.value.length,
      opcionesDisponibles: opciones.value.map(o => ({ value: o.value, text: o.text }))
    })
    
    if (!opcion) {
      console.log('⚠️ Opción no encontrada directamente, buscando por conversión...')
      // Búsqueda alternativa por conversión de string
      const opcionPorString = opciones.value.find(opt => opt.value.toString() === respuesta.toString())
      if (opcionPorString) {
        console.log('✅ Opción encontrada por conversión:', opcionPorString)
        const valorNumerico = Number(opcionPorString.value)
        
        if (!isNaN(valorNumerico)) {
          const datosRespuesta = {
            general_data_id: parseInt(generalDataId.value),
            category_id: parseInt(pregunta.categoryId),
            question_id: parseInt(preguntaId),
            value: valorNumerico
          }
          
          console.log('📤 Enviando respuesta (ruta alternativa):', datosRespuesta)
          await enviarRespuestaDatos(datosRespuesta)
          return
        }
      }
      
      console.warn('❌ No se pudo encontrar opción válida, cancelando')
      return
    }

    console.log('✅ Opción encontrada directamente:', opcion)
    const valorNumerico = Number(opcion.value)
    
    if (isNaN(valorNumerico)) {
      console.warn('❌ Valor no numérico, cancelando:', opcion.value)
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
    console.log('💾 Guardando respuesta:', { 
      preguntaId, 
      respuesta, 
      generalDataId: generalDataId.value,
      tieneGeneralDataId: !!generalDataId.value
    })
    
    respuestas.value[preguntaId] = respuesta
    
    // Enviar automáticamente si tenemos general_data_id
    if (generalDataId.value) {
      console.log('🚀 Llamando a enviarRespuestaAutomatica...')
      enviarRespuestaAutomatica(preguntaId, respuesta)
    } else {
      console.warn('⚠️ No se puede enviar respuesta: generalDataId no está definido')
      console.warn('⚠️ Valor actual de generalDataId:', generalDataId.value)
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