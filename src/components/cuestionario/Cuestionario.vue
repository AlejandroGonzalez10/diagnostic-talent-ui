<template>
  <div class="cuestionario-container">
    <!-- Loading state -->
    <div v-if="isLoading" class="loading-container">
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
          @sector-cambio="onSectorCambio"
        />

        <lista-preguntas
          :categorias="categorias"
          :preguntas-por-categoria="preguntasPorCategoria"
          :opciones="opciones"
          v-model:respuestas="respuestas"
          @respuestas-cambio="validarRespuestas"
          :guardar-respuesta="guardarRespuesta"
          :datos-completos="datosValidos"
          :sector="sectorSeleccionado"
        />
      </div>
    </div>
    
    <!-- Fixed footer with three images (left, center LinkedIn, right). Images are non-clickable. -->
    <footer class="fixed-footer" role="contentinfo" aria-label="Pie de página">
      <div class="footer-left">
        <img src="@/assets/img-spe.jpeg" alt="SPE" class="footer-logo footer-left-logo" />
      </div>

      <div class="footer-center" aria-hidden="false">
        <img class="linkedin-icon" src="@/assets/img-linkedin.jpeg" alt="LinkedIn" />
      </div>

      <div class="footer-right">
        <img src="@/assets/img-supersubsidio.jpeg" alt="Supersubsidio" class="footer-logo footer-right-logo" />
      </div>
    </footer>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue'
import FormularioDatos from './components/FormularioDatos.vue'
import DescripcionCuestionario from './components/DescripcionCuestionario.vue'
import ListaPreguntas from './components/ListaPreguntas.vue'
import { useCuestionario } from '@/composables/useCuestionario'
import { cuestionarioApi } from '@/services/api'

export default {
  name: 'DiagnosticQuestionnaire',
  components: {
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
    const sectorSeleccionado = ref('')

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
        }
      } else {
        // Intentar obtener el código de acceso desde las variables de entorno
        const codigoAccesoEnv = process.env.VUE_APP_CODIGO_ACCESO
        
        if (codigoAccesoEnv) {
          // Si existe el código en el environment, validarlo automáticamente
          try {
            const response = await cuestionarioApi.autenticar(codigoAccesoEnv)
            
            if (response.token && response.user) {
              // Autenticar con los datos recibidos
              iniciarCuestionario({
                token: response.token,
                user: response.user
              })
            }
          } catch (error) {
            // Si falla, se mostrará el componente de código de acceso
          }
        }
        // Si no hay código en environment, se mostrará el componente de código de acceso
      }
    })

    const onSectorCambio = (sector) => {
      sectorSeleccionado.value = sector
    }

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
      sectorSeleccionado,
      onSectorCambio,
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

/* Estilos globales para impresión */
@media print {
  .ocultar-en-pdf {
    display: none !important;
  }
  
  .cuestionario-container {
    background: white !important;
    padding: 20px !important;
  }
  
  .main-form-container {
    box-shadow: none !important;
    border: none !important;
  }
  
  .main-form {
    max-width: 100% !important;
  }
}

/* Fixed footer styles */
.fixed-footer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: 3.5rem; /* 56px */
  background: #2D2D2D;
  border-top: 0.0625rem solid rgba(255,255,255,0.06); /* 1px */
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem;
  z-index: 10000;
}

.fixed-footer a {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.linkedin-icon {
  height: 100%;
  max-height: 3.6rem;
  object-fit: contain;
  display: block;
}

.footer-logo {
  height: 3.5rem;
  object-fit: contain;
  display: block;
}

/* Right-side supersubsidio logo should be larger */
.footer-right-logo {
  height: 2rem;
  max-height: 3.25rem;
}

.footer-left,
.footer-right {
  display: flex;
  align-items: center;
}

.footer-center {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
}

/* Ensure content is not hidden behind the fixed footer */
.cuestionario-container,
.main-form-container,
.main-form {
  padding-bottom: 20px; /* footer height (56px) + breathing room */
}

/* Mobile adjustments: make footer images smaller and reduce horizontal padding */
@media (max-width: 480px) {
  .fixed-footer {
    height: 3rem;
    padding: 0 0.5rem;
  }

  /* Left logo slightly smaller on phones */
  .footer-left .footer-logo,
  .footer-left-logo {
    height: 2.5rem;
    max-height: 2.5rem;
  }

  /* Center LinkedIn image max height on phones */
  .footer-center .linkedin-icon {
    max-height: 2.5rem;
  }

  /* Right logo much smaller on phones */
  .footer-right .footer-logo,
  .footer-right-logo {
    height: 1.25rem;
    max-height: 1.25rem;
  }
}
</style>