<template>
  <section class="datos-iniciales">
    <h2 class="datos-iniciales-titulo">Datos Iniciales</h2>
    <div class="datos-section">
      <!-- Datos de la empresa -->
      <div class="datos-subsection">
        <h3>Datos de la empresa</h3>
        <div class="datos-grid">
          <div class="form-group">
            <label for="entidadEjecutora">Nombre de la empresa</label>
            <input
              type="text"
              id="entidadEjecutora"
              v-model="datosLocales.entidad"
              :class="{ 'error': errores.entidad }"
              @input="validarCampo('entidad')"
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
              @input="validarCampo('nit')"
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
              @input="validarCampo('sector')"
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
              @input="validarCampo('empleados')"
              required
            />
          </div>
        </div>
      </div>

      <!-- Datos de contacto -->
      <div class="datos-subsection">
        <h3>Datos de contacto</h3>
        <div class="datos-grid">
          <div class="form-group">
            <label for="nombre">Nombre completo de quien diligencia</label>
            <input
              type="text"
              id="nombre"
              v-model="datosLocales.nombre"
              :class="{ 'error': errores.nombre }"
              @input="validarCampo('nombre')"
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
              @input="validarCampo('cargo')"
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
              @input="validarCampo('correo')"
              required
            />
          </div>

          <div class="form-group">
            <label for="contacto">Teléfono de contacto</label>
            <input
              type="tel"
              id="contacto"
              v-model="datosLocales.contacto"
              :class="{ 'error': errores.contacto }"
              @input="validarCampo('contacto')"
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
        <p v-if="errores.contacto" class="error-mensaje">Por favor, ingrese un número de contacto</p>
      </div>
    </div>
  </section>
</template>

<script>
import { ref, watch } from 'vue'
import { useValidacion } from '@/composables/useValidacion'

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
        correo: '',
        contacto: ''
      })
    }
  },
  emits: ['update:datos', 'validacion-cambio'],
  setup(props, { emit }) {
    const { validarEmail } = useValidacion()
    const datosLocales = ref({ ...props.datosIniciales })
    const errores = ref({
      entidad: false,
      nit: false,
      sector: false,
      empleados: false,
      nombre: false,
      cargo: false,
      correo: false,
      contacto: false
    })

    const validarCampo = (campo) => {
      if (campo === 'correo') {
        errores.value[campo] = !validarEmail(datosLocales.value[campo])
      } else {
        errores.value[campo] = !datosLocales.value[campo]?.toString().trim()
      }
      emit('update:datos', datosLocales.value)
      validarFormulario()
    }

    const validarFormulario = () => {
      const esValido = !Object.values(errores.value).some(error => error)
      emit('validacion-cambio', esValido)
      return esValido
    }

    watch(datosLocales, () => {
      localStorage.setItem('datosUsuario', JSON.stringify(datosLocales.value))
    }, { deep: true })

    return {
      datosLocales,
      errores,
      validarCampo,
      validarFormulario
    }
  }
}
</script>

<style scoped>
@import '../styles/formulario-datos.scss';
</style>]]>