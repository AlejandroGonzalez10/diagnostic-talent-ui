<template>
  <div class="codigo-container">
    <div class="codigo-form">
      <h2>Cuestionario de Diagnóstico</h2>
      <p class="codigo-instrucciones">Por favor, ingrese su código de acceso para continuar</p>
      <div class="input-group">
        <input 
          type="text" 
          v-model="codigo"
          placeholder="Ingrese su código de acceso"
          class="codigo-input"
          :class="{ 'error': error }"
          @keyup.enter="validar"
          autocomplete="off"
        />
        <button @click="validar" class="codigo-button">
          Ingresar
        </button>
      </div>
      <p v-if="error" class="codigo-error">
        <span>⚠️</span> Código incorrecto. Por favor, verifique e intente nuevamente.
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CodigoAcceso',
  data() {
    return {
      codigo: '',
      error: false
    }
  },
  methods: {
    validar() {
      if (this.codigo?.trim() === 'Bootcamp1') {
        this.$emit('codigo-validado')
        localStorage.setItem('codigoValidado', 'true')
        this.error = false
      } else {
        this.error = true
      }
    }
  }
}
</script>

<style scoped>
@import '../styles/codigo-acceso.scss';
</style>