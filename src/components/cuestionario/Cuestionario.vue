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
      <div class="main-form">
        <descripcion-cuestionario :categorias="categorias" />
        
        <formulario-datos
          v-model:datos="datosUsuario"
          @validacion-cambio="datosValidos = $event"
          @datos-enviados="onDatosEnviados"
        />

        <lista-preguntas
          v-if="codigoValidado"
          :categorias="categorias"
          :preguntas-por-categoria="preguntasPorCategoria"
          :opciones="opciones"
          v-model:respuestas="respuestas"
          @respuestas-cambio="validarRespuestas"
          :guardar-respuesta="guardarRespuesta"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue'
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
      preguntas,
      categorias,
      preguntasPorCategoria,
      opciones,
      respuestas,
      isLoading,
      error,
      formularioCompleto,
      generalDataId,
      cargarDatosGuardados,
      cargarRespuestasGuardadas,
      fetchPreguntas,
      setGeneralDataId,
      guardarRespuesta,
      validarRespuestas,
      // Variables de autenticación
      token,
      usuario,
      isAuthenticated,
      autenticar
    } = useCuestionario()

    const codigoValidado = ref(false)
    const datosUsuario = ref({
      entidad: '',
      nit: '',
      sector: '',
      empleados: '',
      nombre: '',
      cargo: '',
      correo: ''
    })
    const datosValidos = ref(false)
    const pendienteCargarRespuestas = ref(null)

    const iniciarCuestionario = (authData) => {
      // Guardar datos de autenticación
      autenticar(authData)
      
      codigoValidado.value = true
      fetchPreguntas()
    }

    const onDatosEnviados = async (generalDataIdRecibido) => {
      setGeneralDataId(generalDataIdRecibido)
      
      // Guardar el ID para cargar las respuestas cuando las preguntas estén listas
      if (generalDataIdRecibido) {
        pendienteCargarRespuestas.value = generalDataIdRecibido
      }
    }

    // Watcher para cargar respuestas cuando las preguntas estén listas
    watch(
      () => preguntas.value.length,
      async (newLength) => {
        if (newLength > 0 && pendienteCargarRespuestas.value) {
          const idParaCargar = pendienteCargarRespuestas.value
          pendienteCargarRespuestas.value = null
          
          await cargarRespuestasGuardadas(idParaCargar)
          console.log('✅ Respuestas precargadas para generalDataId:', idParaCargar)
        }
      }
    )

    onMounted(async () => {
      // Cargar datos guardados primero
      cargarDatosGuardados()
      
      // Verificar si ya está autenticado
      if (isAuthenticated.value && token.value) {
        codigoValidado.value = true
        await fetchPreguntas()
        
        // Si hay generalDataId guardado, cargar las respuestas
        if (generalDataId.value) {
          await cargarRespuestasGuardadas(generalDataId.value)
          console.log('✅ Respuestas precargadas al montar componente')
        }
      }
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
      formularioCompleto,
      opciones,
      token,
      usuario,
      isAuthenticated,
      iniciarCuestionario,
      fetchPreguntas,
      validarRespuestas,
      guardarRespuesta,
      onDatosEnviados
    }
  }
}
</script>

<style lang="scss" scoped>
@import './styles/cuestionario.scss';
</style>