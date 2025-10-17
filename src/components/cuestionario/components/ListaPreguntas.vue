<template>
  <div class="categorias-section">
    <div v-for="(categoria, index) in categorias" :key="categoria.id" class="categoria-wrapper">
      <div class="categoria-header">
        <h3 class="categoria-titulo">{{ categoria.name || categoria.title || categoria.nombre || 'Sin nombre' }}</h3>
        <p class="categoria-descripcion">{{ categoria.description || categoria.descripcion || categoria.desc || 'Sin descripción' }}</p>
      </div>

      <div class="preguntas-lista">
        <div v-for="(pregunta, index) in preguntasPorCategoria[categoria.id]" 
             :key="pregunta.id"
             class="pregunta-item ocultar-en-pdf"
             :class="{ 'respondida': respuestasLocales[pregunta.id] }">
          <div class="pregunta-numero-mobile">{{ index + 1 }}</div>
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
          <span>Resultado pilar {{ index + 1 }}. {{ categoria.name }}:</span>
          <strong>{{ calcularPuntajeCategoria(categoria.id) }}</strong>
        </div>
      </div>
    </div>

    <!-- Puntaje total -->
    <div class="puntaje-total ocultar-en-pdf">
      <div>
        <h3>Puntaje Total: {{ calcularPuntajeTotal() }}</h3>
      </div>
      <button 
        @click="generarPDF" 
        class="btn-ver-resultado" 
        :disabled="generandoPDF"
      >
        <span v-if="generandoPDF" class="loading-mini"></span>
        <span v-else>📄</span>
        {{ generandoPDF ? 'Generando PDF...' : 'Ver Resultado' }}
      </button>
    </div>

    <!-- Alert personalizado -->
    <div v-if="mostrarAlerta" class="alert-overlay" @click="cerrarAlerta">
      <div class="alert-modal" @click.stop>
        <div class="alert-icon">⚠️</div>
        <h3 class="alert-titulo">Datos Incompletos</h3>
        <p class="alert-mensaje">
          Por favor, completa todos los <strong>datos iniciales</strong> antes de generar el PDF.
        </p>
        <p class="alert-submensaje">
          Verifica que hayas completado: Nombre de la empresa, NIT, Sector, Número de empleados, Nombre completo de quien diligencia, Cargo y Correo electrónico.
        </p>
        <button @click="cerrarAlerta" class="alert-btn">Entendido</button>
      </div>
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
    },
    datosCompletos: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:respuestas', 'respuestas-cambio'],
  data() {
    return {
      respuestasLocales: {},
      generandoPDF: false,
      mostrarAlerta: false
    }
  },
  watch: {
    respuestas: {
      handler(newVal) {
        this.respuestasLocales = { ...newVal }
      },
      immediate: true,
      deep: true
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
      // Obtener la opción seleccionada
      const opcionSeleccionada = this.opciones.find(opt => opt.value === respuesta)
      
      if (!opcionSeleccionada) return ''
      
      // Aplicar colores según el tipo de respuesta
      switch(opcionSeleccionada.option.toLowerCase()) {
        case 'si':
        case 'sí':
          return 'valor-si'
        case 'no':
          return 'valor-no'
        case 'en parte':
        default:
          return 'valor-otra'
      }
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
    },
    async generarPDF() {
      // Validar que los datos generales estén completos
      if (!this.datosCompletos) {
        this.mostrarAlerta = true
        return
      }
      
      this.generandoPDF = true
      
      try {
        // Pequeña pausa para mostrar el estado de loading
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Usar window.print() para imprimir la página actual
        window.print()
        
      } catch (error) {
        console.error('Error al generar PDF:', error)
        alert('Error al generar el PDF. Intenta nuevamente.')
      } finally {
        this.generandoPDF = false
      }
    },
    cerrarAlerta() {
      this.mostrarAlerta = false
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
  margin-bottom: 0.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e0e0e0;
}

.categoria-info h3 {
  margin-bottom: 0.5rem;
  color: #2c3e50;
}

.categoria-descripcion {
  margin-bottom: 0.5rem;
  color: #fff;
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

.valor-si {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #28a745;
}

.valor-no {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #dc3545;
}

.valor-otra {
  background-color: #fff3cd;
  color: #856404;
  border: 1px solid #ffc107;
}

/* Mantener estilos originales como fallback */
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
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mensaje-advertencia {
  font-size: 0.9rem;
  color: #d9534f;
  margin-top: 0.5rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-ver-resultado {
  background: #0067b1;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.btn-ver-resultado:hover:not(:disabled) {
  background: #005a9e;
  transform: translateY(-1px);
}

.btn-ver-resultado:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
  opacity: 0.6;
}

/* Alert personalizado */
.alert-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.alert-modal {
  background: white;
  border-radius: 16px;
  padding: 2.5rem;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  text-align: center;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    transform: translateY(-50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.alert-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  animation: bounce 0.6s ease;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.alert-titulo {
  font-size: 1.5rem;
  color: #2c3e50;
  margin-bottom: 1rem;
  font-weight: 600;
}

.alert-mensaje {
  font-size: 1.1rem;
  color: #555;
  margin-bottom: 0.75rem;
  line-height: 1.6;
}

.alert-mensaje strong {
  color: #0067b1;
  font-weight: 600;
}

.alert-submensaje {
  font-size: 0.9rem;
  color: #777;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.alert-btn {
  background: #0067b1;
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 150px;
}

.alert-btn:hover {
  background: #005a9e;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 103, 177, 0.3);
}

.alert-btn:active {
  transform: translateY(0);
}

.loading-mini {
  width: 12px;
  height: 12px;
  border: 2px solid transparent;
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Estilos para impresión */
@media print {
  /* Ocultar elementos que no deben aparecer en el PDF */
  .ocultar-en-pdf {
    display: none !important;
  }
  
  .btn-ver-resultado {
    display: none !important;
  }
  
  .puntaje-total {
    display: none !important;
  }
  
  .alert-overlay {
    display: none !important;
  }
  
  .categoria-wrapper {
    page-break-inside: avoid;
    margin-bottom: 30px;
  }
  
  .categoria-header {
    background: #0067b1 !important;
    color: white !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    padding: 15px;
    margin-bottom: 15px;
  }
  
  .categoria-score {
    font-size: 18pt;
    font-weight: bold;
    padding: 15px;
    background: #f8f9fa !important;
    border-radius: 8px;
    margin-top: 10px;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  
  .categoria-score strong {
    color: #0067b1 !important;
    font-size: 20pt;
  }
  
  .categoria-header {
    background: #0067b1 !important;
    color: white !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  
  .valor-respuesta {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  
  body {
    font-size: 12pt;
    line-height: 1.4;
  }
}

/* Responsive para el puntaje total */
@media (max-width: 768px) {
  .puntaje-total {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .btn-ver-resultado {
    width: 100%;
    justify-content: center;
  }
}

.text-center {
  text-align: center;
}
</style>