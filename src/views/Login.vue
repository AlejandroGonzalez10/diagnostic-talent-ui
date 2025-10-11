<template>
  <div class="login-view">
    <Login @login-exitoso="handleLoginExitoso" />
  </div>
</template>

<script>
import { useRouter } from 'vue-router'
import { useReportes } from '@/composables/useReportes'
import Login from '@/components/reportes/components/Login.vue'

export default {
  name: 'LoginView',
  components: {
    Login
  },
  setup() {
    const router = useRouter()
    const { autenticarReportes } = useReportes()

    const handleLoginExitoso = (respuesta) => {
      // Usar el composable específico de reportes
      const autenticado = autenticarReportes(respuesta)
      
      if (autenticado) {
        // Redirigir a reportes
        router.push('/reportes')
      }
    }

    return {
      handleLoginExitoso
    }
  }
}
</script>

<style scoped>
.login-view {
  min-height: 100vh;
}
</style>