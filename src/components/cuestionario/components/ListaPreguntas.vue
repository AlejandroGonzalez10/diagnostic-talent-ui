<template>
  <div class="categorias-section">
    <div v-for="categoria in categorias" :key="categoria.id" class="categoria-wrapper">
      <div class="categoria-header">
        <div class="categoria-titulo">
          <h3>{{ categoria.nombre }}</h3>
          <div class="categoria-indicadores">
            <div class="categoria-peso">
              <span class="indicador-label">Peso</span>
              <span class="indicador-valor">{{ categoria.peso }}%</span>
            </div>
            <div class="categoria-score">
              <span class="indicador-label">Puntaje</span>
              <span class="indicador-valor">{{ calcularPuntajeCategoria(categoria.id) }}</span>
            </div>
          </div>
        </div>
        <p class="categoria-descripcion">{{ categoria.descripcion }}</p>
      </div>

      <div class="preguntas-lista">
        <div v-for="(pregunta, index) in preguntasPorCategoria[categoria.id]" 
             :key="pregunta.id"
             class="pregunta-item"
             :class="{ 'respondida': respuestasLocales[pregunta.id] }">
          <div class="pregunta-header">
            <span class="pregunta-numero">{{ index + 1 }}.</span>
            <p class="pregunta-texto">{{ pregunta.texto }}</p>
          </div>
          
          <div class="pregunta-contenido">
            <div class="valoracion-cualitativa">
              <div class="opciones-grupo">
                <label class="opcion-radio">
                  <input type="radio"
                         :name="'pregunta' + pregunta.id"
                         value="Si"
                         v-model="respuestasLocales[pregunta.id]"
                         @change="emitirCambios" />
                  <span class="opcion-texto">Si</span>
                </label>
                <label class="opcion-radio">
                  <input type="radio"
                         :name="'pregunta' + pregunta.id"
                         value="En Parte"
                         v-model="respuestasLocales[pregunta.id]"
                         @change="emitirCambios" />
                  <span class="opcion-texto">En Parte</span>
                </label>
                <label class="opcion-radio">
                  <input type="radio"
                         :name="'pregunta' + pregunta.id"
                         value="No"
                         v-model="respuestasLocales[pregunta.id]"
                         @change="emitirCambios" />
                  <span class="opcion-texto">No</span>
                </label>
              </div>
            </div>
            
            <div class="valoracion-cuantitativa">
              <span v-if="respuestasLocales[pregunta.id]" 
                    class="valor-respuesta"
                    :class="getValorClass(respuestasLocales[pregunta.id])">
                {{ calcularPuntajePregunta(respuestasLocales[pregunta.id]) }} puntos
              </span>
            </div>
          </div>
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
      // Implementar lógica de cálculo de puntaje por categoría
      const preguntas = this.preguntasPorCategoria[categoriaId] || []
      let puntajeTotal = 0
      let preguntasRespondidas = 0

      preguntas.forEach(pregunta => {
        const respuesta = this.respuestasLocales[pregunta.id]
        if (respuesta) {
          puntajeTotal += this.calcularPuntajePregunta(respuesta)
          preguntasRespondidas++
        }
      })

      return preguntasRespondidas > 0 ? 
        ((puntajeTotal / (preguntasRespondidas * 5)) * 100).toFixed(1) + '%' : '0%'
    },
    calcularPuntajePregunta(respuesta) {
      switch(respuesta) {
        case 'Si': return 5
        case 'En Parte': return 3
        case 'No': return 1
        default: return 0
      }
    },
    getValorClass(respuesta) {
      switch(respuesta) {
        case 'Si': return 'valor-alto'
        case 'En Parte': return 'valor-medio'
        case 'No': return 'valor-bajo'
        default: return ''
      }
    },
    calcularPuntajeTotal() {
      let puntajeTotal = 0

      this.categorias.forEach(categoria => {
        const preguntas = this.preguntasPorCategoria[categoria.id] || []
        let puntajeCategoria = 0
        let preguntasRespondidas = 0

        preguntas.forEach(pregunta => {
          const respuesta = this.respuestasLocales[pregunta.id]
          if (respuesta) {
            puntajeCategoria += this.calcularPuntajePregunta(respuesta)
            preguntasRespondidas++
          }
        })

        if (preguntasRespondidas > 0) {
          const porcentajeCategoria = (puntajeCategoria / (preguntasRespondidas * 5)) * 100
          puntajeTotal += porcentajeCategoria * (categoria.peso / 100)
        }
      })

      return puntajeTotal.toFixed(1) + '%'
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