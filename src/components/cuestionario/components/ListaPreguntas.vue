<template>
  <div class="categorias-section">
    <div v-for="categoria in categorias" :key="categoria.id" class="categoria-wrapper">
      <div class="categoria-header">
        <h3 class="categoria-titulo">{{ categoria.name || categoria.title || categoria.nombre || 'Sin nombre' }}</h3>
        <p class="categoria-descripcion">{{ categoria.description || categoria.descripcion || categoria.desc || 'Sin descripción' }}</p>
      </div>

      <div class="preguntas-lista">
        <div v-for="(pregunta, index) in preguntasPorCategoria[categoria.id]" 
             :key="pregunta.id"
             class="pregunta-item"
             :class="{ 'respondida': respuestasLocales[pregunta.id] }">
          <div class="pregunta-header">
            <span class="pregunta-numero">{{ index + 1 }}.</span>
            <p class="pregunta-texto">{{ pregunta.label }}</p>
          </div>
          
          <div class="pregunta-contenido">
            <div class="valoracion-cualitativa">
              <div class="opciones-grupo">
                <label v-for="opcion in opciones" 
                       :key="opcion.id" 
                       class="opcion-radio">
                  <input type="radio"
                         :name="'pregunta' + pregunta.id"
                         :value="opcion.value"
                         v-model="respuestasLocales[pregunta.id]"
                         @change="onRespuestaChange(pregunta.id, $event.target.value)" />
                  <span class="opcion-texto">{{ opcion.option }}</span>
                </label>
              </div>
            </div>
            
            <div class="valoracion-cuantitativa">
              <span v-if="respuestasLocales[pregunta.id]" 
                    class="valor-respuesta"
                    :class="getValorClass(respuestasLocales[pregunta.id])">
                {{ calcularPuntajePregunta(respuestasLocales[pregunta.id], opciones) }} puntos
              </span>
            </div>
          </div>
        </div>
        
        <div class="categoria-score">
          <span>Puntaje de la categoría:</span>
          <strong>{{ calcularPuntajeCategoria(categoria.id) }}</strong>
        </div>
      </div>
    </div>

    <!-- Puntaje total -->
    <div class="puntaje-total">
      <h3>Puntaje Total: {{ calcularPuntajeTotal() }}</h3>
    </div>
  </div>
</template>

<script>
export default {
  name: 'QuestionList',
  props: {
    categorias: {
      type: Array,
      required: true,
      default: () => []
    },
    preguntasPorCategoria: {
      type: Object,
      required: true,
      default: () => ({})
    },
    respuestas: {
      type: Object,
      default: () => ({})
    },
    opciones: {
      type: Array,
      required: true,
      default: () => []
    },
    guardarRespuesta: {
      type: Function,
      required: true
    }
  },
  emits: ['update:respuestas', 'respuestas-cambio'],
  data() {
    return {
      respuestasLocales: {}
    }
  },
  watch: {
    respuestas: {
      handler(newVal) {
        this.respuestasLocales = { ...newVal }
      },
      immediate: true
    }
  },
  methods: {
    calcularPuntajeCategoria(categoriaId) {
      const preguntas = this.preguntasPorCategoria[categoriaId] || []
      if (preguntas.length === 0) return '0.00'

      let puntajeTotal = 0

      preguntas.forEach(pregunta => {
        const respuesta = this.respuestasLocales[pregunta.id]
        if (respuesta) {
          puntajeTotal += this.calcularPuntajePregunta(respuesta, this.opciones)
        }
      })

      const promedio = puntajeTotal / preguntas.length
      return promedio.toFixed(2)
    },
    calcularPuntajePregunta(respuesta, opciones = this.opciones) {
      const opcion = opciones.find(opt => opt.value === respuesta)
      
      if (opcion) {
        const puntaje = opcion.value
        return Number(puntaje) || 0
      }
      
      // Fallback para valores hardcodeados
      switch(respuesta) {
        case 'Si': return 5
        case 'En Parte': return 3
        case 'No': return 1
        default: return 0
      }
    },
    getValorClass(respuesta) {
      const puntos = this.calcularPuntajePregunta(respuesta, this.opciones)
      
      if (puntos >= 5) return 'valor-alto'
      if (puntos >= 3) return 'valor-medio'
      if (puntos >= 1) return 'valor-bajo'
      return ''
    },
    calcularPuntajeTotal() {
      if (this.categorias.length === 0) return '0.00'

      let puntajeTotal = 0
      let pesoTotal = 0

      this.categorias.forEach(categoria => {
        const preguntas = this.preguntasPorCategoria[categoria.id] || []
        if (preguntas.length > 0) {
          let puntajeCategoria = 0

          preguntas.forEach(pregunta => {
            const respuesta = this.respuestasLocales[pregunta.id]
            if (respuesta) {
              puntajeCategoria += this.calcularPuntajePregunta(respuesta, this.opciones)
            }
          })

          const promedioCategoria = puntajeCategoria / preguntas.length
          const peso = categoria.weight || categoria.peso || 25
          
          puntajeTotal += promedioCategoria * (peso / 100)
          pesoTotal += (peso / 100)
        }
      })

      if (pesoTotal === 0) return '0.00'

      const promedioPonderado = puntajeTotal / pesoTotal
      return promedioPonderado.toFixed(2)
    },
    onRespuestaChange(preguntaId, valor) {
      // Usar la función pasada como prop
      this.guardarRespuesta(preguntaId, valor)
      
      // Mantener la funcionalidad existente
      this.emitirCambios()
    },
    emitirCambios() {
      this.$emit('update:respuestas', this.respuestasLocales)
      this.$emit('respuestas-cambio')
    }
  }
}
</script>

<style scoped>
@import '../styles/lista-preguntas.scss';

.categoria-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e0e0e0;
}

.categoria-info h3 {
  margin-bottom: 0.5rem;
  color: #2c3e50;
}

.categoria-descripcion {
  margin-bottom: 0.5rem;
  color: #666;
}

.categoria-meta {
  font-size: 0.9rem;
  color: #666;
}

.categoria-score {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.categoria-score strong {
  color: #2c3e50;
  font-size: 1.2rem;
}

.preguntas-tabla {
  width: 100%;
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 1rem;
  border: 1px solid #e0e0e0;
}

th {
  background-color: #f8f9fa;
  font-weight: 600;
  text-align: left;
}

.pregunta-col {
  width: 40%;
}

.valoracion-col {
  width: 40%;
}

.valor-col {
  width: 20%;
}

.opciones-grupo {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.opcion-radio {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.opcion-radio {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.5rem;
}

input[type="radio"] {
  appearance: none;
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  border: 2px solid #666;
  border-radius: 50%;
  outline: none;
  cursor: pointer;
  margin: 0;
}

input[type="radio"]:checked {
  border-color: #2c3e50;
  background: radial-gradient(circle at center, #2c3e50 40%, transparent 40%);
}

.opcion-texto {
  font-size: 0.95rem;
  color: #2c3e50;
}

.valor-respuesta {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-weight: 500;
}

.valor-alto {
  background-color: #d4edda;
  color: #155724;
}

.valor-medio {
  background-color: #fff3cd;
  color: #856404;
}

.valor-bajo {
  background-color: #f8d7da;
  color: #721c24;
}

.puntaje-total {
  margin-top: 2rem;
  text-align: right;
  font-size: 1.2rem;
  color: #2c3e50;
}

.text-center {
  text-align: center;
}
</style>