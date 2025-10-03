<template>
  <div class="cuestionario-container">
    <!-- Código de acceso -->
    <div v-if="!codigoValidado" class="codigo-container">
      <div class="codigo-form">
        <h3>Bienvenido</h3>
        <div class="input-group">
          <input 
            type="text" 
            v-model="codigoIngresado"
            placeholder="Ingrese su código de acceso"
            class="codigo-input"
            :class="{ 'error': codigoError }"
            @keyup.enter="validarCodigo"
            autocomplete="off"
          >
          <button @click="validarCodigo" class="codigo-button">
            Ingresar
          </button>
        </div>
        <p v-if="codigoError" class="codigo-error">
          <span>⚠️</span> Código incorrecto. Por favor, verifique e intente nuevamente.
        </p>
      </div>
    </div>

    <!-- Loading state -->
    <div v-else-if="isLoading" class="loading-container">
      <h2 class="cuestionario-title">Cuestionario de Diagnóstico</h2>
      <div class="loading-spinner"></div>
      <p>Cargando preguntas...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="error-container">
      <h2 class="cuestionario-title">Cuestionario de Diagnóstico</h2>
      <p class="error-message">{{ error }}</p>
      <button @click="fetchPreguntas" class="retry-button">Intentar nuevamente</button>
    </div>

    <!-- Cuestionario -->
    <form v-else @submit.prevent="submitForm" class="cuestionario-form">
      <h2 class="cuestionario-title">Cuestionario de Diagnóstico</h2>
      <div class="cuestionario-progress">
        Preguntas respondidas: {{ Object.keys(respuestas).length }} de {{ preguntas.length }}
      </div>
      <div 
        v-for="(pregunta, index) in preguntas" 
        :key="pregunta.id" 
        class="pregunta-container"
        :class="{ 'pregunta-no-respondida': mostrarErrores && !respuestas[pregunta.id] }"
      >
        <p class="pregunta-texto" :data-number="index + 1">{{ pregunta.texto }}</p>
        <div v-if="mostrarErrores && !respuestas[pregunta.id]" class="error-mensaje">
          * Por favor responde esta pregunta
        </div>
        <div class="opciones-container">
          <label class="opcion-label">
            <input
              type="radio"
              v-model="respuestas[pregunta.id]"
              :name="'pregunta' + pregunta.id"
              value="Si"
            />
            <span class="radio-custom"></span>
            Si
          </label>
          <label class="opcion-label">
            <input
              type="radio"
              v-model="respuestas[pregunta.id]"
              :name="'pregunta' + pregunta.id"
              value="En Parte"
            />
            <span class="radio-custom"></span>
            En Parte
          </label>
          <label class="opcion-label">
            <input
              type="radio"
              v-model="respuestas[pregunta.id]"
              :name="'pregunta' + pregunta.id"
              value="No"
            />
            <span class="radio-custom"></span>
            No
          </label>
        </div>
      </div>
      <button type="submit" class="submit-button" :disabled="enviando">
        {{ enviando ? 'Enviando...' : 'Enviar Respuestas' }}
      </button>
    </form>
  </div>
</template>

<script>
import { cuestionarioApi } from '../services/api'

export default {
  name: 'FormCuestionario',
  data() {
    return {
      preguntas: [],
      respuestas: {},
      isLoading: false,
      error: null,
      enviando: false,
      mostrarErrores: false,
      codigoValidado: false,
      codigoIngresado: '',
      codigoError: false
    }
  },
  watch: {
    respuestas: {
      handler(newValue) {
        if (Object.keys(newValue).length > 0) {
          this.guardarRespuestas();
        }
      },
      deep: true
    }
  },
  created() {
    // Verificar si ya hay un código validado
    const codigoGuardado = localStorage.getItem('codigoValidado');
    if (codigoGuardado === 'true') {
      this.codigoValidado = true;
      this.cargarPreguntas();
      
      // Recuperar respuestas guardadas si existen
      const respuestasGuardadas = localStorage.getItem('respuestas');
      if (respuestasGuardadas) {
        this.respuestas = JSON.parse(respuestasGuardadas);
      }
    }
  },
  methods: {
    async submitForm() {
      this.mostrarErrores = true;
      
      // Validar que todas las preguntas estén respondidas
      const preguntasRespondidas = Object.keys(this.respuestas).length;
      if (preguntasRespondidas !== this.preguntas.length) {
        // Desplazar a la primera pregunta no respondida
        const primeraPreguntaNoRespondida = this.preguntas.find(p => !this.respuestas[p.id]);
        if (primeraPreguntaNoRespondida) {
          const elemento = document.querySelector(`[name="pregunta${primeraPreguntaNoRespondida.id}"]`);
          elemento?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }

      try {
        this.enviando = true;
        const resultado = await cuestionarioApi.enviarRespuestas(this.respuestas);
        alert(resultado.message);
        // Limpiar localStorage después de enviar exitosamente
        localStorage.removeItem('codigoValidado');
        localStorage.removeItem('respuestas');
      } catch (error) {
        alert('Error al enviar las respuestas. Por favor, intente nuevamente.');
        console.error('Error:', error);
      } finally {
        this.enviando = false;
      }
    },
    validarCodigo() {
      if (this.codigoIngresado.trim() === 'Bootcamp1') {
        this.codigoValidado = true;
        this.codigoError = false;
        localStorage.setItem('codigoValidado', 'true');
        this.cargarPreguntas();
      } else {
        this.codigoError = true;
        this.codigoIngresado = '';
      }
    },
    async cargarPreguntas() {
      this.isLoading = true;
      try {
        this.preguntas = await cuestionarioApi.getPreguntas();
      } catch (error) {
        this.error = 'Error al cargar las preguntas. Por favor, intente nuevamente.';
        console.error('Error:', error);
      } finally {
        this.isLoading = false;
      }
    },
    guardarRespuestas() {
      localStorage.setItem('respuestas', JSON.stringify(this.respuestas));
    }
  }
}
</script>

<style scoped>
.cuestionario-container {
  max-width: 900px;
  margin: 1rem auto;
  padding: 1.5rem;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.cuestionario-title {
  color: #2c3e50;
  text-align: center;
  margin-bottom: 2rem;
  font-size: 1.8rem;
  border-bottom: 3px solid #4CAF50;
  padding-bottom: 0.8rem;
  font-weight: 600;
}

.pregunta-container {
  margin-bottom: 1.2rem;
  padding: 1.2rem 1.8rem;
  background-color: #f8f9fa;
  border-radius: 12px;
  border-left: 4px solid #4CAF50;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}

.pregunta-container:hover {
  background-color: #f0f9f0;
  transform: translateY(-2px);
}

.pregunta-texto {
  color: #2c3e50;
  font-size: 1.1rem;
  margin-bottom: 1rem;
  line-height: 1.5;
  text-align: left;
  max-width: 100%;
  display: flex;
  align-items: center;
}

.pregunta-texto::before {
  content: attr(data-number);
  min-width: 28px;
  height: 28px;
  background-color: #4CAF50;
  color: white;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  margin-right: 1rem;
  flex-shrink: 0;
  box-shadow: 0 2px 4px rgba(76, 175, 80, 0.3);
}

.opciones-container {
  display: flex;
  gap: 1.2rem;
  justify-content: flex-end;
  flex-wrap: wrap;
  padding: 0.5rem;
  margin-left: 3rem;
}

.opcion-label {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  position: relative;
  padding: 0.8rem 1.2rem 0.8rem 35px;
  background-color: white;
  border-radius: 25px;
  transition: all 0.3s ease;
  min-width: 100px;
  font-size: 1rem;
  border: 2px solid #e0e0e0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.opcion-label:hover {
  background-color: #f0f9f0;
  border-color: #4CAF50;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(76, 175, 80, 0.15);
}

.opcion-label input[type="radio"] {
  position: absolute;
  opacity: 0;
}

.opcion-label input[type="radio"]:checked + .radio-custom {
  background-color: #4CAF50;
  border-color: #4CAF50;
  transform: scale(1.1);
}

.opcion-label input[type="radio"]:checked ~ span {
  color: #4CAF50;
  font-weight: 600;
}

.radio-custom {
  position: absolute;
  left: 10px;
  height: 18px;
  width: 18px;
  background-color: #fff;
  border: 2px solid #ccc;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.opcion-label:hover .radio-custom {
  border-color: #4CAF50;
  transform: scale(1.05);
}

.opcion-label input[type="radio"]:checked + .radio-custom::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: white;
  animation: radioSelect 0.3s ease-out;
}

@keyframes radioSelect {
  0% { transform: translate(-50%, -50%) scale(0); }
  90% { transform: translate(-50%, -50%) scale(1.2); }
  100% { transform: translate(-50%, -50%) scale(1); }
}

.submit-button {
  display: block;
  margin: 2rem auto 0;
  padding: 1rem 2.5rem;
  background: linear-gradient(45deg, #4CAF50, #45a049);
  color: white;
  border: none;
  border-radius: 30px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
  font-weight: 500;
  letter-spacing: 0.5px;
}

.submit-button:hover {
  background: linear-gradient(45deg, #45a049, #3d8b40);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
}

.submit-button:active {
  transform: translateY(0);
}

.submit-button:disabled {
  background: linear-gradient(45deg, #cccccc, #bbbbbb);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.loading-container {
  text-align: center;
  padding: 3rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-radius: 12px;
  margin: 2rem 0;
}

.loading-spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #4CAF50;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  margin: 0 auto 1.5rem;
  box-shadow: 0 0 10px rgba(76, 175, 80, 0.2);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-container {
  text-align: center;
  padding: 3rem;
  background: linear-gradient(135deg, #fff5f5 0%, #ffffff 100%);
  border-radius: 12px;
  margin: 2rem 0;
  border: 1px solid #ffebeb;
}

.error-message {
  color: #dc3545;
  margin-bottom: 1.5rem;
  font-size: 1.1rem;
}

.retry-button {
  padding: 0.8rem 1.5rem;
  background: linear-gradient(45deg, #4CAF50, #45a049);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.2);
}

.retry-button:hover {
  background: linear-gradient(45deg, #45a049, #3d8b40);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.pregunta-no-respondida {
  border: 2px solid #dc3545;
  background-color: #fff5f5;
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-5px); }
  40%, 80% { transform: translateX(5px); }
}

.error-mensaje {
  color: #dc3545;
  font-size: 0.95rem;
  margin-left: 3rem;
  margin-bottom: 0.8rem;
  text-align: left;
  padding: 0.5rem 1rem;
  background-color: rgba(220, 53, 69, 0.1);
  border-radius: 6px;
  display: inline-block;
}

.codigo-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  animation: fadeIn 0.5s ease-out;
  border-radius: 12px;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

.codigo-form {
  background-color: white;
  padding: 2.5rem;
  border-radius: 20px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 450px;
  width: 100%;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.codigo-form::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #4CAF50, #45a049);
}

.codigo-form h3 {
  color: #2c3e50;
  margin-bottom: 2rem;
  font-size: 1.5rem;
  font-weight: 600;
  position: relative;
  padding-bottom: 1rem;
}

.codigo-form h3::after {
  content: '🔒';
  font-size: 1.8rem;
  display: block;
  margin-top: 0.5rem;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-10px); }
  60% { transform: translateY(-5px); }
}

.input-group {
  display: flex;
  gap: 0.8rem;
  margin-bottom: 1.5rem;
  position: relative;
  padding: 0 1rem;
}

.codigo-input {
  flex: 1;
  padding: 1rem 1.2rem;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  background-color: #f8f9fa;
  letter-spacing: 1px;
}

.codigo-input:focus {
  outline: none;
  border-color: #4CAF50;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.2);
  background-color: white;
  transform: translateY(-2px);
}

.codigo-input.error {
  border-color: #dc3545;
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-5px); }
  40%, 80% { transform: translateX(5px); }
}

.codigo-button {
  padding: 1rem 1.8rem;
  background: linear-gradient(45deg, #4CAF50, #45a049);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: 500;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.codigo-button:hover {
  background: linear-gradient(45deg, #45a049, #3d8b40);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(76, 175, 80, 0.3);
}

.codigo-button:active {
  transform: translateY(0);
}

.codigo-error {
  color: #dc3545;
  font-size: 0.95rem;
  margin-top: 1rem;
  padding: 0.8rem 1.2rem;
  background-color: #fff5f5;
  border-radius: 8px;
  border-left: 4px solid #dc3545;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.cuestionario-progress {
  position: sticky;
  top: 0;
  background: rgba(255, 255, 255, 0.98);
  padding: 0.8rem;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #e0e0e0;
  z-index: 10;
  text-align: center;
  font-size: 1rem;
  color: #2c3e50;
  backdrop-filter: blur(8px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}
</style>