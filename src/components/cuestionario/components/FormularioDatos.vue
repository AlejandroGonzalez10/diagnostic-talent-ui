<template>
  <section class="datos-iniciales">
    <h2 class="datos-iniciales-titulo title-banner">Datos Iniciales</h2>
    <div class="datos-section">
      <!-- Datos de la empresa -->
      <div class="datos-subsection">
        <h3 class="primary-title">Datos de la empresa</h3>
        <div class="datos-grid">
          <div class="form-group">
            <label for="entidadEjecutora">Nombre de la empresa</label>
            <input
              type="text"
              id="entidadEjecutora"
              v-model="datosLocales.entidad"
              :class="{ 'error': errores.entidad }"
              @blur="actualizarCampo('entidad')"
              required
            />
          </div>

          <div class="form-group">
            <label for="nit">NIT</label>
            <input
              type="text"
              id="nit"
              v-model="datosLocales.nit"
              :class="{ 'error': errores.nit }"
              @blur="actualizarCampo('nit')"
              required
            />
          </div>

          <div class="form-group">
            <label for="sector">Sector</label>
            <input
              type="text"
              id="sector"
              v-model="datosLocales.sector"
              :class="{ 'error': errores.sector }"
              @blur="actualizarCampo('sector')"
              required
            />
          </div>

          <div class="form-group">
            <label for="empleados">Número de empleados</label>
            <input
              type="number"
              id="empleados"
              v-model="datosLocales.empleados"
              :class="{ 'error': errores.empleados }"
              @blur="actualizarCampo('empleados')"
              required
            />
          </div>
        </div>
      </div>

      <!-- Datos de contacto -->
      <div class="datos-subsection">
        <h3 class="primary-title">Datos de contacto</h3>
        <div class="datos-grid">
          <div class="form-group">
            <label for="nombre">Nombre completo de quien diligencia</label>
            <input
              type="text"
              id="nombre"
              v-model="datosLocales.nombre"
              :class="{ 'error': errores.nombre }"
              @blur="actualizarCampo('nombre')"
              required
            />
          </div>

          <div class="form-group">
            <label for="cargo">Cargo</label>
            <input
              type="text"
              id="cargo"
              v-model="datosLocales.cargo"
              :class="{ 'error': errores.cargo }"
              @blur="actualizarCampo('cargo')"
              required
            />
          </div>

          <div class="form-group">
            <label for="correo">Correo electrónico</label>
            <input
              type="email"
              id="correo"
              v-model="datosLocales.correo"
              :class="{ 'error': errores.correo }"
              @blur="actualizarCampo('correo')"
              required
            />
          </div>
        </div>
      </div>

      <div class="errores-container">
        <p v-if="errores.entidad" class="error-mensaje">Por favor, ingrese el nombre de la empresa</p>
        <p v-if="errores.nit" class="error-mensaje">Por favor, ingrese el NIT</p>
        <p v-if="errores.sector" class="error-mensaje">Por favor, ingrese el sector</p>
        <p v-if="errores.empleados" class="error-mensaje">Por favor, ingrese el número de empleados</p>
        <p v-if="errores.nombre" class="error-mensaje">Por favor, ingrese el nombre completo</p>
        <p v-if="errores.cargo" class="error-mensaje">Por favor, ingrese el cargo</p>
        <p v-if="errores.correo" class="error-mensaje">Por favor, ingrese un correo electrónico válido</p>
      </div>
    </div>
  </section>
</template>

<script>
import { ref } from 'vue'
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
        empleados: '',
        nombre: '',
        cargo: '',
        correo: ''
      })
    }
  },
  emits: ['update:datos', 'validacion-cambio', 'datos-enviados'],
  setup(props, { emit }) {
    const { validarEmail } = useValidacion()
    const { generalDataId, setGeneralDataId } = useCuestionario()
    
    const datosLocales = ref({ ...props.datosIniciales })
    const errores = ref({
      entidad: false,
      nit: false,
      sector: false,
      empleados: false,
      nombre: false,
      cargo: false,
      correo: false
    })
    const enviandoDatos = ref(false)
    const registroCreado = ref(false)

    // Crear registro inicial cuando se monta el componente
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
      } else {
        errores.value[campo] = false
      }

      // Si el campo está vacío, no enviar actualización
      if (!valor) {
        emit('update:datos', datosLocales.value)
        return
      }

      try {
        enviandoDatos.value = true
        
        // Enviar TODOS los datos del formulario, no solo el campo que cambió
        const datosActualizacion = {
          id: generalDataId.value,
          company: datosLocales.value.entidad || '',
          nit: datosLocales.value.nit || '',
          sector: datosLocales.value.sector || '',
          employees_number: datosLocales.value.empleados ? parseInt(datosLocales.value.empleados) : 0,
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
    }

    // Crear registro inicial cuando se monta el componente
    crearRegistroInicial()

    return {
      datosLocales,
      errores,
      enviandoDatos,
      actualizarCampo
    }
  }
}
</script>

<style scoped>
@import '../styles/formulario-datos.scss';
</style>]]>