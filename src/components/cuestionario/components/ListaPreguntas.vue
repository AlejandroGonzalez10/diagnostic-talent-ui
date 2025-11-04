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

    <!-- Botón para ver resultado -->
    <div class="boton-container ocultar-en-pdf">
      <button 
        @click="mostrarResultado" 
        class="btn-ver-resultado" 
        :disabled="cargandoResultado"
      >
        <span v-if="cargandoResultado" class="loading-mini"></span>
        <span v-else>&#128202;</span>
        {{ cargandoResultado ? 'Cargando...' : 'Ver Resultado' }}
      </button>
    </div>

    <!-- Puntaje total (solo visible en PDF) -->
    <div class="puntaje-total-pdf solo-pdf">
      <h3>Puntaje Total: {{ calcularPuntajeTotal() }}</h3>
    </div>

    <!-- Alert de datos incompletos -->
    <div v-if="mostrarAlerta" class="alert-overlay" @click="cerrarAlerta">
      <div class="alert-modal" @click.stop>
        <div class="alert-icon">⚠️</div>
        <h3 class="alert-titulo">{{ alertaTitulo }}</h3>
        <p class="alert-mensaje" v-html="alertaMensaje"></p>
        <p class="alert-submensaje" v-if="alertaSubmensaje">{{ alertaSubmensaje }}</p>
        <button @click="cerrarAlerta" class="alert-btn">Entendido</button>
      </div>
    </div>

    <!-- Modal de Resultado -->
    <div v-if="mostrarModalResultado" class="resultado-overlay">
      <div class="resultado-modal" @click.stop>

        <div class="resultado-contenido">
          <h2 class="resultado-titulo-simple">Resultado del Diagnóstico</h2>
          
          <div class="puntaje-principal">
            <div class="puntaje-numero">{{ calcularPuntajeTotal() }}</div>
            <div class="puntaje-clasificacion" :class="getClasificacionClass()">
              {{ getClasificacionTexto() }}
            </div>
          </div>

          <div class="resultado-descripcion">
            <p v-html="getDescripcionResultado()"></p>
          </div>
        </div>

        <div class="resultado-footer">
          <button @click="cerrarModalResultado" class="btn-cerrar-resultado">Cerrar</button>
        </div>
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
      cargandoResultado: false,
      mostrarAlerta: false,
      mostrarModalResultado: false,
      alertaTitulo: '',
      alertaMensaje: '',
      alertaSubmensaje: ''
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
    validarTodasLasRespuestas() {
      // Contar el total de preguntas en todas las categorías
      let totalPreguntas = 0
      let preguntasRespondidas = 0

      this.categorias.forEach(categoria => {
        const preguntas = this.preguntasPorCategoria[categoria.id] || []
        totalPreguntas += preguntas.length

        preguntas.forEach(pregunta => {
          if (this.respuestasLocales[pregunta.id]) {
            preguntasRespondidas++
          }
        })
      })

      return preguntasRespondidas === totalPreguntas && totalPreguntas > 0
    },
    async mostrarResultado() {
      // Validar que los datos generales estén completos
      if (!this.datosCompletos) {
        this.alertaTitulo = 'Datos Incompletos'
        this.alertaMensaje = 'Por favor, completa todos los <strong>datos iniciales</strong> antes de ver el resultado.'
        this.alertaSubmensaje = 'Verifica que hayas completado: Nombre de la empresa, NIT, Sector, Número de empleados, Nombre completo de quien diligencia, Cargo y Correo electrónico.'
        this.mostrarAlerta = true
        return
      }

      // Validar que todas las preguntas estén respondidas
      if (!this.validarTodasLasRespuestas()) {
        this.alertaTitulo = 'Cuestionario Incompleto'
        this.alertaMensaje = 'Por favor, responde <strong>todas las preguntas</strong> del cuestionario antes de ver el resultado.'
        this.alertaSubmensaje = 'Asegúrate de haber respondido cada pregunta en todos los pilares de análisis.'
        this.mostrarAlerta = true
        return
      }
      
      this.cargandoResultado = true
      
      try {
        // Pequeña pausa para simular carga
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Mostrar modal con resultado
        this.mostrarModalResultado = true
        
      } catch (error) {
        console.error('Error al cargar resultado:', error)
        alert('Error al cargar el resultado. Intenta nuevamente.')
      } finally {
        this.cargandoResultado = false
      }
    },
    cerrarAlerta() {
      this.mostrarAlerta = false
    },
    cerrarModalResultado() {
      this.mostrarModalResultado = false
    },
    getClasificacionTexto() {
      const puntaje = parseFloat(this.calcularPuntajeTotal())
      
      if (puntaje >= 1 && puntaje <= 2) {
        return 'En Crecimiento'
      } else if (puntaje > 2 && puntaje <= 3.4) {
        return 'Maduración'
      } else if (puntaje > 3.4 && puntaje <= 5) {
        return 'Consolidación'
      }
      return 'Sin clasificar'
    },
    getClasificacionClass() {
      const puntaje = parseFloat(this.calcularPuntajeTotal())
      
      if (puntaje >= 1 && puntaje <= 2) {
        return 'clasificacion-crecimiento'
      } else if (puntaje > 2 && puntaje <= 3.4) {
        return 'clasificacion-maduracion'
      } else if (puntaje > 3.4 && puntaje <= 5) {
        return 'clasificacion-consolidacion'
      }
      return ''
    },
    getDescripcionResultado() {
      const puntaje = parseFloat(this.calcularPuntajeTotal())
      
      if (puntaje >= 1 && puntaje <= 2) {
        return '<strong>Es necesario fortalecer la base de la gestión del talento humano mediante la formalización de procesos y prácticas clave.</strong><br>Se sugiere documentar políticas, estandarizar procedimientos y establecer roles y responsabilidades que aseguren una gestión más consistente y alineada con los objetivos organizacionales.'
      } else if (puntaje > 2 && puntaje <= 3.4) {
        return '<strong>Es importante avanzar en la integración y alineación de los procesos de gestión del talento con la estrategia organizacional.</strong><br>Se recomienda revisar la coherencia entre las prácticas de atracción, desarrollo y retención, y los objetivos del negocio, para garantizar una gestión más estratégica y orientada a resultados.'
      } else if (puntaje > 3.4 && puntaje <= 5) {
        return '<strong>La organización se encuentra en una etapa de madurez que le permite fortalecer su enfoque en innovación, analítica y experiencia del colaborador.</strong><br>Se recomienda consolidar estas capacidades integrándolas en la estrategia de talento, promoviendo una cultura de mejora continua y utilizando los datos para potenciar el bienestar y el desempeño del equipo.'
      }
      return 'Complete el diagnóstico para obtener una clasificación.'
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

.boton-container {
  margin-top: 2rem;
  text-align: right;
  display: flex;
  justify-content: flex-end;
}

.solo-pdf {
  display: none;
}

.puntaje-total-pdf {
  margin-top: 2rem;
  text-align: center;
  font-size: 1.2rem;
  color: #2c3e50;
}

.puntaje-total-pdf h3 {
  font-size: 1.5rem;
  color: #0067b1;
  margin: 0;
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

/* Modal de Resultado */
.resultado-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease;
  padding: 20px;
}

.resultado-modal {
  background: white;
  border-radius: 20px;
  max-width: 700px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideDown 0.3s ease;
  position: relative;
}

.modal-close-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  background: transparent;
  border: none;
  font-size: 2rem;
  color: #666;
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
  z-index: 10;
}

.modal-close-btn:hover {
  background: #f0f0f0;
  color: #333;
  transform: rotate(90deg);
}

.resultado-contenido {
  padding: 2.5rem 2rem;
}

.resultado-titulo-simple {
  font-size: 1.5rem;
  color: #2c3e50;
  margin: 0 0 1.5rem 0;
  font-weight: 600;
  text-align: center;
}

.puntaje-principal {
  text-align: center;
  margin-bottom: 2rem;
  padding: 2rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 16px;
  border: 3px solid #0067b1;
}

.puntaje-numero {
  font-size: 3.5rem;
  font-weight: bold;
  color: #0067b1;
  line-height: 1;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.puntaje-clasificacion {
  font-size: 1.4rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  padding: 0.6rem 1.2rem;
  border-radius: 50px;
  display: inline-block;
  margin-top: 0.5rem;
}

.clasificacion-crecimiento {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
}

.clasificacion-maduracion {
  background: linear-gradient(135deg, #ffd93d 0%, #f6c23e 100%);
  color: #664d03;
  box-shadow: 0 4px 15px rgba(255, 217, 61, 0.4);
}

.clasificacion-consolidacion {
  background: linear-gradient(135deg, #51cf66 0%, #37b24d 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(81, 207, 102, 0.4);
}

.resultado-descripcion {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  border-left: 4px solid #0067b1;
}

.resultado-descripcion p {
  font-size: 1rem;
  line-height: 1.8;
  color: #495057;
  margin: 0;
  text-align: justify;
}

.resultado-detalles {
  margin-top: 2rem;
}

.resultado-detalles h3 {
  font-size: 1.3rem;
  color: #2c3e50;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e9ecef;
}

.pilar-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  margin-bottom: 0.75rem;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 10px;
  transition: all 0.3s ease;
}

.pilar-item:hover {
  background: #f8f9fa;
  border-color: #0067b1;
  transform: translateX(5px);
}

.pilar-nombre {
  font-size: 1rem;
  color: #495057;
  font-weight: 500;
}

.pilar-puntaje {
  font-size: 1.3rem;
  font-weight: bold;
  color: #0067b1;
  background: #e7f3ff;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  min-width: 70px;
  text-align: center;
}

.resultado-footer {
  padding: 1.5rem 2rem 2rem 2rem;
  text-align: center;
  border-top: 1px solid #e9ecef;
}

.btn-cerrar-resultado {
  background: linear-gradient(135deg, #0067b1 0%, #005a9e 100%);
  color: white;
  border: none;
  padding: 1rem 3rem;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 103, 177, 0.3);
}

.btn-cerrar-resultado:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 103, 177, 0.4);
}

.btn-cerrar-resultado:active {
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

/* Responsive para modal de resultado */
@media (max-width: 768px) {
  .resultado-modal {
    border-radius: 12px;
    max-height: 95vh;
  }

  .resultado-header {
    padding: 2rem 1.5rem 1.5rem 1.5rem;
  }

  .resultado-titulo {
    font-size: 1.5rem;
  }

  .resultado-icon {
    font-size: 3rem;
  }

  .resultado-contenido {
    padding: 1.5rem;
  }

  .resultado-titulo-simple {
    font-size: 1.3rem;
  }

  .puntaje-numero {
    font-size: 2.5rem;
  }

  .puntaje-clasificacion {
    font-size: 1.1rem;
    letter-spacing: 1px;
  }
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

  .boton-container {
    display: none !important;
  }
  
  .alert-overlay {
    display: none !important;
  }

  /* Mostrar puntaje total solo en PDF */
  .solo-pdf {
    display: block !important;
  }

  .puntaje-total-pdf {
    margin-top: 2rem;
    padding: 1.5rem;
    text-align: center;
    background: #f8f9fa !important;
    border: 3px solid #0067b1 !important;
    border-radius: 8px;
    page-break-inside: avoid;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .puntaje-total-pdf h3 {
    font-size: 1.8rem;
    color: #0067b1 !important;
    font-weight: bold;
    margin: 0;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
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