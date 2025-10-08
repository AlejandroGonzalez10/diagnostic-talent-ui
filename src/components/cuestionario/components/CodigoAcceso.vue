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
          :disabled="cargando"
        />
        <button @click="validar" class="codigo-button" :disabled="cargando">
          {{ cargando ? 'Validando...' : 'Ingresar' }}
        </button>
      </div>
      <p v-if="error" class="codigo-error">
        <span>⚠️</span> {{ mensajeError }}
      </p>
    </div>
  </div>
</template>

<script>
import { cuestionarioApi } from '@/services/api'

export default {
  name: 'CodigoAcceso',
  data() {
    return {
      codigo: '',
      error: false,
      cargando: false,
      mensajeError: 'Código incorrecto. Por favor, verifique e intente nuevamente.'
    }
  },
  methods: {
    async validar() {
      if (!this.codigo?.trim()) {
        this.error = true
        this.mensajeError = 'Por favor, ingrese un código de acceso.'
        return
      }

      this.cargando = true
      this.error = false

      try {
        const response = await cuestionarioApi.autenticar(this.codigo.trim())
        
        if (response.token && response.user) {
          // Emitir evento con datos de autenticación
          this.$emit('codigo-validado', {
            token: response.token,
            user: response.user
          })
          
          this.error = false
        } else {
          throw new Error('Respuesta de autenticación inválida')
        }
      } catch (error) {
        console.error('🔐 Error en autenticación:', error)
        this.error = true
        this.mensajeError = 'Código de acceso inválido. Por favor, verifique e intente nuevamente.'
      } finally {
        this.cargando = false
      }
    }
  }
}
</script>

<style scoped>
@import '../styles/codigo-acceso.scss';
</style>