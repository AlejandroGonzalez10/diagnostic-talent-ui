import { ref, computed } from 'vue'
import { categoriesApi, questionsApi, optionsApi, responsesApi } from '@/services/api'

export function useCuestionario() {
  const preguntas = ref([])
  const categorias = ref([])
  const opciones = ref([])
  const preguntasPorCategoria = ref({})
  const respuestas = ref({})
  const isLoading = ref(false)
  const error = ref(null)

  const cargarDatosGuardados = () => {
    const respuestasGuardadas = localStorage.getItem('respuestas')
    if (respuestasGuardadas) {
      respuestas.value = JSON.parse(respuestasGuardadas)
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

      categorias.value = categoriasData.sort((a, b) => (a.order || 0) - (b.order || 0))
      preguntas.value = preguntasData.sort((a, b) => (a.order || 0) - (b.order || 0))
      opciones.value = opcionesData.sort((a, b) => (a.order || 0) - (b.order || 0))

      preguntasPorCategoria.value = {}
      categorias.value.forEach(categoria => {
        preguntasPorCategoria.value[categoria.id] = preguntas.value.filter(
          pregunta => pregunta.categoryId === categoria.id
        ).sort((a, b) => (a.order || 0) - (b.order || 0))
      })

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

  const validarRespuestas = () => {
    return preguntas.value.every(pregunta => respuestas.value[pregunta.id])
  }

  const guardarRespuestas = () => {
    localStorage.setItem('respuestas', JSON.stringify(respuestas.value))
  }

  const enviarRespuestas = async (datosUsuario) => {
    try {
      isLoading.value = true
      error.value = null

      const payload = {
        datosUsuario,
        respuestas: respuestas.value,
        timestamp: new Date().toISOString()
      }

      const resultado = await responsesApi.submit(payload)
      
      // Limpiar datos guardados localmente después del envío exitoso
      localStorage.removeItem('respuestas')
      localStorage.removeItem('datosUsuario')
      
      return resultado
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const formularioCompleto = computed(() => {
    if (!preguntas.value.length) return false
    return preguntas.value.every(pregunta => respuestas.value[pregunta.id])
  })

  return {
    // State
    preguntas,
    categorias,
    opciones,
    preguntasPorCategoria,
    respuestas,
    isLoading,
    error,
    formularioCompleto,

    fetchCategorias,
    fetchPreguntas,
    calcularPuntajePregunta,
    calcularPuntajeCategoria,
    calcularPuntajeTotal,
    validarRespuestas,
    guardarRespuestas,
    enviarRespuestas,
    cargarDatosGuardados
  }
}