<template>
  <section class="datos-iniciales">
    <h2 class="datos-iniciales-titulo title-datos-iniciales">Datos Iniciales</h2>
    <div class="datos-section">
      <!-- Datos de la empresa -->
      <div class="datos-subsection">
        <h3 class="primary-title-datos">Datos de la empresa</h3>
        <div class="datos-grid">
          <div class="form-group">
            <label for="entidadEjecutora">Nombre de la empresa</label>
            <input
              type="text"
              id="entidadEjecutora"
              v-model="datosLocales.entidad"
              :class="{ 'error': errores.entidad }"
              @blur="actualizarCampo('entidad')"
              class="ocultar-input-en-pdf"
              required
            />
            <p class="valor-para-pdf">{{ datosLocales.entidad || 'No especificado' }}</p>
          </div>

          <div class="form-group">
            <label for="nit">NIT</label>
            <input
              type="text"
              id="nit"
              v-model="datosLocales.nit"
              :class="{ 'error': errores.nit }"
              @blur="actualizarCampo('nit')"
              class="ocultar-input-en-pdf"
              required
            />
            <p class="valor-para-pdf">{{ datosLocales.nit || 'No especificado' }}</p>
          </div>

          <div class="form-group">
            <label for="sector">Sector</label>
            <select
              id="sector"
              v-model="datosLocales.sector"
              :class="{ 'error': errores.sector }"
              @change="actualizarCampo('sector')"
              class="ocultar-input-en-pdf"
              required
            >
              <option value="" disabled>Seleccione un sector</option>
              <option v-for="sector in sectores" :key="sector.SECId" :value="sector.SECNombre">
                {{ sector.SECNombre }}
              </option>
              <option value="Otro">Otro</option>
            </select>
            <p class="valor-para-pdf">{{ datosLocales.sector || 'No especificado' }}</p>
          </div>

            <!-- 'Número de empleados' removed. When 'Otro' sector is selected a 'Cuál' text field will appear here -->
            <div v-if="datosLocales.sector === 'Otro'" class="form-group">
              <label for="cual">Cuál</label>
              <input
                type="text"
                id="cual"
                v-model="datosLocales.cual"
                :class="{ 'error': errores.cual }"
                @blur="actualizarCampo('cual')"
                class="ocultar-input-en-pdf"
              />
              <p class="valor-para-pdf">{{ datosLocales.cual || 'No especificado' }}</p>
            </div>
        </div>
      </div>

      <!-- Datos de contacto -->
      <div class="datos-subsection">
        <h3 class="primary-title-datos">Datos de contacto</h3>
        <div class="datos-grid">
          <div class="form-group">
            <label for="nombre">Nombre completo de quien diligencia</label>
            <input
              type="text"
              id="nombre"
              v-model="datosLocales.nombre"
              :class="{ 'error': errores.nombre }"
              @blur="actualizarCampo('nombre')"
              class="ocultar-input-en-pdf"
              required
            />
            <p class="valor-para-pdf">{{ datosLocales.nombre || 'No especificado' }}</p>
          </div>

          <div class="form-group">
            <label for="cargo">Cargo</label>
            <input
              type="text"
              id="cargo"
              v-model="datosLocales.cargo"
              :class="{ 'error': errores.cargo }"
              @blur="actualizarCampo('cargo')"
              class="ocultar-input-en-pdf"
              required
            />
            <p class="valor-para-pdf">{{ datosLocales.cargo || 'No especificado' }}</p>
          </div>

          <div class="form-group">
            <label for="correo">Correo electrónico</label>
            <input
              type="email"
              id="correo"
              v-model="datosLocales.correo"
              :class="{ 'error': errores.correo }"
              @blur="actualizarCampo('correo')"
              class="ocultar-input-en-pdf"
              required
            />
            <p class="valor-para-pdf">{{ datosLocales.correo || 'No especificado' }}</p>
          </div>
        </div>
      </div>

      <div class="errores-container">
        <p v-if="errores.entidad" class="error-mensaje">Por favor, ingrese el nombre de la empresa</p>
        <p v-if="errores.nit" class="error-mensaje">Por favor, ingrese el NIT</p>
        <p v-if="errores.sector" class="error-mensaje">Por favor, ingrese el sector</p>
        
        <p v-if="errores.nombre" class="error-mensaje">Por favor, ingrese el nombre completo</p>
        <p v-if="errores.cargo" class="error-mensaje">Por favor, ingrese el cargo</p>
        <p v-if="errores.cual" class="error-mensaje">Por favor, ingrese el sector</p>
        <p v-if="errores.correo" class="error-mensaje">Por favor, ingrese un correo electrónico válido</p>
      </div>
    </div>
  </section>
</template>

<script>
import { ref, onMounted, watch } from 'vue'
import { useValidacion } from '@/composables/useValidacion'
import { useCuestionario } from '@/composables/useCuestionario'
import { cuestionarioApi } from '@/services/api'

export default {
  name: 'FormularioDatos',
  props: {
    datosIniciales: {
      type: Object,
      default: () => ({
        entidad: '',
        nit: '',
        sector: '',
        cual: '',
        nombre: '',
        cargo: '',
        correo: ''
      })
    }
  },
  emits: ['update:datos', 'validacion-cambio', 'datos-enviados', 'sector-cambio'],
  setup(props, { emit }) {
    const { validarEmail } = useValidacion()
    const { generalDataId, setGeneralDataId, cargarDatosGenerales } = useCuestionario()
    
    const datosLocales = ref({ ...props.datosIniciales })
    const sectores = ref([])
    const errores = ref({
      entidad: false,
      nit: false,
      sector: false,
      cual: false,
      nombre: false,
      cargo: false,
      correo: false
    })
    const enviandoDatos = ref(false)
    const registroCreado = ref(false)
    const cargandoDatos = ref(false)

    // Watch para validar cada vez que cambian los datos
    watch(datosLocales, () => {
      validarFormulario()
    }, { deep: true })

    // Intentar cargar datos existentes o crear registro inicial
    const inicializarDatos = async () => {
      if (registroCreado.value || cargandoDatos.value) return
      
      cargandoDatos.value = true
      
      try {
        // Primero intentar cargar datos existentes
        const datosExistentes = await cargarDatosGenerales()
        
        if (datosExistentes && datosExistentes.id) {
          // Si hay datos existentes, cargarlos en el formulario
          // Map backend sector to select or 'Otro' + cual
          let mappedSector = datosExistentes.sector || ''
          let mappedCual = ''
          // If the sector from backend does not match any loaded sector, treat it as 'Otro' and store the value in 'cual'
          const nombresSectores = (sectores.value || []).map(s => s.SECNombre)
          if (mappedSector && nombresSectores.indexOf(mappedSector) === -1) {
            mappedCual = mappedSector
            mappedSector = 'Otro'
          }

          datosLocales.value = {
            entidad: datosExistentes.entidad,
            nit: datosExistentes.nit,
            sector: mappedSector,
            cual: mappedCual,
            nombre: datosExistentes.nombre,
            cargo: datosExistentes.cargo,
            correo: datosExistentes.correo
          }
          
          registroCreado.value = true
          emit('datos-enviados', datosExistentes.id)
          emit('update:datos', datosLocales.value)
          
          // Emitir sector-cambio si hay sector guardado
          if (datosExistentes.sector) {
            emit('sector-cambio', datosExistentes.sector)
          }
          
          validarFormulario()
        } else {
          // Si no hay datos existentes, crear un nuevo registro
          await crearRegistroInicial()
        }
      } catch (error) {
        console.error('❌ Error al inicializar datos:', error)
        // Si falla la carga, intentar crear registro inicial
        await crearRegistroInicial()
      } finally {
        cargandoDatos.value = false
      }
    }

    // Crear registro inicial cuando no hay datos existentes
    const crearRegistroInicial = async () => {
      if (registroCreado.value) return
      
      try {
        const respuesta = await cuestionarioApi.crearRegistroInicial()
        
        // Usar la función global para establecer el ID
        setGeneralDataId(respuesta.id)
        registroCreado.value = true
        emit('datos-enviados', respuesta.id)
      } catch (error) {
        console.error('❌ Error al crear registro inicial:', error)
      }
    }

    const actualizarCampo = async (campo) => {
      if (!registroCreado.value) {
        await crearRegistroInicial()
      }

      if (!generalDataId.value) {
        return
      }

  const valor = datosLocales.value[campo]?.toString().trim()
      
      // Validar el campo
      if (campo === 'correo') {
        errores.value[campo] = valor.length > 0 ? !validarEmail(valor) : false
      } else if (campo === 'cual') {
        // validate only if 'Otro' selected
        errores.value.cual = datosLocales.value.sector === 'Otro' ? (valor.length === 0) : false
      } else {
        errores.value[campo] = false
      }

      // Emit sector-cambio: if sector is 'Otro' use 'cual' value, else use selected sector
      if (campo === 'sector') {
        const effective = datosLocales.value.sector === 'Otro' ? (datosLocales.value.cual || '') : (datosLocales.value.sector || '')
        emit('sector-cambio', effective)
      }
      if (campo === 'cual') {
        // when custom sector changed, emit new effective sector
        const effective = datosLocales.value.cual || ''
        emit('sector-cambio', effective)
      }

      // Si el campo está vacío, no enviar actualización
      if (!valor) {
        emit('update:datos', datosLocales.value)
        return
      }

      try {
        enviandoDatos.value = true
        
        // Enviar TODOS los datos del formulario, no solo el campo que cambió
        const effectiveSector = datosLocales.value.sector === 'Otro' ? (datosLocales.value.cual || '') : (datosLocales.value.sector || '')
        const datosActualizacion = {
          id: generalDataId.value,
          company: datosLocales.value.entidad || '',
          nit: datosLocales.value.nit || '',
          sector: effectiveSector,
          chief_name: datosLocales.value.nombre || '',
          company_role: datosLocales.value.cargo || '',
          chief_email: datosLocales.value.correo || ''
        }

        await cuestionarioApi.actualizarDatosGenerales(datosActualizacion)
        
      } catch (error) {
        console.error(`❌ Error al actualizar datos:`, error)
      } finally {
        enviandoDatos.value = false
      }

      emit('update:datos', datosLocales.value)
      validarFormulario()
    }

    // Función para validar si todos los campos están completos
    const validarFormulario = () => {
      const sectorValido = datosLocales.value.sector === 'Otro' ? (datosLocales.value.cual && datosLocales.value.cual.trim() !== '') : (datosLocales.value.sector && datosLocales.value.sector.trim() !== '')
      const todosCompletos = 
        datosLocales.value.entidad?.trim() !== '' &&
        datosLocales.value.nit?.trim() !== '' &&
        sectorValido &&
        datosLocales.value.cargo?.trim() !== '' &&
        datosLocales.value.nombre?.trim() !== '' &&
        datosLocales.value.correo?.trim() !== '' &&
        validarEmail(datosLocales.value.correo)
      
      emit('validacion-cambio', todosCompletos)
    }

    // Cargar sectores desde el API
    const cargarSectores = async () => {
      try {
        const sectoresData = await cuestionarioApi.obtenerSectores()
        sectores.value = sectoresData || []
      } catch (error) {
        // Si falla, usar lista vacía
        sectores.value = []
      }
    }

    // Inicializar datos al montar el componente
    onMounted(async () => {
      await cargarSectores()
      inicializarDatos()
    })

    return {
      datosLocales,
      sectores,
      errores,
      enviandoDatos,
      actualizarCampo
    }
  }
}
</script>

<style scoped>
@import '../styles/formulario-datos.scss';

.title-datos-iniciales {
  background-color: #2D2D2D;
  color: #FFD000;
  padding: 2rem;
  text-align: center;
}

.primary-title-datos {
  color: #FFD000;
  margin-bottom: 1.5rem;
}

/* Ocultar valores en pantalla normal */
.valor-para-pdf {
  display: none;
}

/* Estilos para impresión */
@media print {
  .ocultar-input-en-pdf {
    display: none !important;
  }
  
  .valor-para-pdf {
    display: block !important;
    margin-top: 5px;
    padding: 0;
    background: transparent;
    border: none;
    font-size: 14pt;
    color: #2c3e50;
    font-weight: 400;
  }
  
  .form-group {
    page-break-inside: avoid;
    margin-bottom: 15px;
  }
  
  .form-group label {
    font-weight: 600;
    color: #0067b1 !important;
    font-size: 12pt;
    margin-bottom: 5px;
    display: block;
  }
}
</style>]]>