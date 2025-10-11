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
      console.log('🔄 Login exitoso recibido en LoginView:', respuesta)
      
      // Usar el composable específico de reportes
      const autenticado = autenticarReportes(respuesta)
      console.log('🔄 Resultado de autenticarReportes:', autenticado)
      
      if (autenticado) {
        console.log('✅ Redirigiendo a reportes...')
        // Redirigir a reportes
        router.push('/reportes')
      } else {
        console.error('❌ No se pudo autenticar, no se redirige')
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