<template>
  <div class="cuestionario-container">
    <!-- Código de acceso -->
    <codigo-acceso
      v-if="!codigoValidado"
      @codigo-validado="iniciarCuestionario"
    />

    <!-- Loading state -->
    <div v-else-if="isLoading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Cargando cuestionario...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="error-container">
      <p class="error-message">{{ error }}</p>
      <button @click="fetchPreguntas" class="retry-button">Intentar nuevamente</button>
    </div>

    <!-- Main form -->
    <div v-else class="main-form-container">
      <form @submit.prevent="submitForm" class="main-form">
        <descripcion-cuestionario />
        
        <formulario-datos
          v-model:datos="datosUsuario"
          @validacion-cambio="datosValidos = $event"
        />

        <lista-preguntas
          v-if="codigoValidado"
          :categorias="categorias"
          :preguntas-por-categoria="preguntasPorCategoria"
          v-model:respuestas="respuestas"
          @respuestas-cambio="validarRespuestas"
        />

        <button 
          type="submit" 
          class="submit-button" 
          :disabled="enviando || !formularioCompleto"
        >
          {{ enviando ? 'Enviando...' : 'Enviar Respuestas' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { cuestionarioApi } from '@/services/api'
import CodigoAcceso from './components/CodigoAcceso.vue'
import FormularioDatos from './components/FormularioDatos.vue'
import DescripcionCuestionario from './components/DescripcionCuestionario.vue'
import ListaPreguntas from './components/ListaPreguntas.vue'
import { useCuestionario } from '@/composables/useCuestionario'

export default {
  name: 'DiagnosticQuestionnaire',
  components: {
    CodigoAcceso,
    FormularioDatos,
    DescripcionCuestionario,
    ListaPreguntas
  },
  setup() {
    const {
      categorias,
      preguntasPorCategoria,
      respuestas,
      isLoading,
      error,
      formularioCompleto,
      cargarDatosGuardados,
      fetchPreguntas
    } = useCuestionario()

    const codigoValidado = ref(false)
    const enviando = ref(false)
    const datosUsuario = ref({
      entidad: '',
      nit: '',
      sector: '',
      empleados: '',
      nombre: '',
      cargo: '',
      correo: '',
      contacto: ''
    })
    const datosValidos = ref(false)

    const iniciarCuestionario = () => {
      codigoValidado.value = true
      fetchPreguntas()
    }

    const submitForm = async () => {
      if (!datosValidos.value || !formularioCompleto.value) {
        alert('Por favor, complete todos los campos del formulario correctamente.')
        return
      }

      try {
        enviando.value = true
        const resultado = await cuestionarioApi.enviarRespuestas(datosUsuario.value, respuestas.value)
        alert(resultado.message)
        
        // Limpiar localStorage después de enviar exitosamente
        localStorage.removeItem('codigoValidado')
        localStorage.removeItem('datosUsuario')
        localStorage.removeItem('respuestas')
      } catch (error) {
        alert('Error al enviar las respuestas. Por favor, intente nuevamente.')
        console.error('Error:', error)
      } finally {
        enviando.value = false
      }
    }

    onMounted(() => {
      const codigoGuardado = localStorage.getItem('codigoValidado')
      if (codigoGuardado === 'true') {
        codigoValidado.value = true
        fetchPreguntas()
      }
      
      const datosGuardados = localStorage.getItem('datosUsuario')
      if (datosGuardados) {
        datosUsuario.value = JSON.parse(datosGuardados)
      }
      
      cargarDatosGuardados()
    })

    return {
      codigoValidado,
      isLoading,
      error,
      datosUsuario,
      datosValidos,
      categorias,
      preguntasPorCategoria,
      respuestas,
      enviando,
      formularioCompleto,
      iniciarCuestionario,
      fetchPreguntas,
      submitForm
    }
  }
}
</script>

<style lang="scss" scoped>
@import './styles/cuestionario.scss';
</style>