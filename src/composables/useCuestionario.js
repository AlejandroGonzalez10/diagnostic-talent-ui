import { ref, computed } from 'vue'
import { cuestionarioApi } from '@/services/api'

export function useCuestionario() {
  const preguntas = ref([])
  const categorias = ref([])
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

  const calcularPuntajePregunta = (respuesta) => {
    const PESOS = {
      'Si': 5,
      'En Parte': 2.5,
      'No': 1
    }
    return PESOS[respuesta] || 0
  }

  const calcularPuntajeCategoria = (categoriaId) => {
    const preguntasCategoria = preguntasPorCategoria.value[categoriaId] || []
    if (!preguntasCategoria.length) return '0%'

    const puntajeMaximo = preguntasCategoria.length * 5
    const puntajeTotal = preguntasCategoria.reduce((sum, pregunta) => {
      return sum + calcularPuntajePregunta(respuestas.value[pregunta.id])
    }, 0)

    return ((puntajeTotal / puntajeMaximo) * 100).toFixed(1) + '%'
  }

  const calcularPuntajeTotal = () => {
    if (!categorias.value.length) return '0%'

    const puntajeTotal = categorias.value.reduce((sum, categoria) => {
      const porcentaje = parseFloat(calcularPuntajeCategoria(categoria.id))
      return sum + (porcentaje * (categoria.peso / 100))
    }, 0)

    return puntajeTotal.toFixed(1) + '%'
  }

  const organizarPreguntasPorCategoria = () => {
    preguntasPorCategoria.value = preguntas.value.reduce((acc, pregunta) => {
      if (!acc[pregunta.categoriaId]) {
        acc[pregunta.categoriaId] = []
      }
      acc[pregunta.categoriaId].push(pregunta)
      return acc
    }, {})
  }

  const guardarRespuestas = () => {
    localStorage.setItem('respuestas', JSON.stringify(respuestas.value))
  }

  const getValorClass = (respuesta) => {
    const valor = calcularPuntajePregunta(respuesta)
    if (valor === 5) return 'valor-alto'
    if (valor === 2.5) return 'valor-medio'
    return 'valor-bajo'
  }

  const fetchPreguntas = async () => {
    isLoading.value = true
    error.value = null
    try {
      const [preguntasData, categoriasData] = await Promise.all([
        cuestionarioApi.getPreguntas(),
        cuestionarioApi.getCategorias()
      ])
      preguntas.value = preguntasData
      categorias.value = categoriasData
      organizarPreguntasPorCategoria()
    } catch (err) {
      error.value = 'Error al cargar el cuestionario. Por favor, intente nuevamente.'
      console.error('Error:', err)
    } finally {
      isLoading.value = false
    }
  }

  const formularioCompleto = computed(() => {
    return preguntas.value.every(p => respuestas.value[p.id])
  })

  return {
    preguntas,
    categorias,
    preguntasPorCategoria,
    respuestas,
    isLoading,
    error,
    formularioCompleto,
    cargarDatosGuardados,
    calcularPuntajePregunta,
    calcularPuntajeCategoria,
    calcularPuntajeTotal,
    guardarRespuestas,
    getValorClass,
    fetchPreguntas
  }
}