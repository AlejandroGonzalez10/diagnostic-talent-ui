<template>
  <div class="login-view">
    <Login @login-exitoso="handleLoginExitoso" />
  </div>
</template>

<script>
import { useRouter } from 'vue-router'
import { useCuestionario } from '@/composables/useCuestionario'
import Login from '@/components/reportes/components/Login.vue'

export default {
  name: 'LoginView',
  components: {
    Login
  },
  setup() {
    const router = useRouter()
    const { autenticar } = useCuestionario()

    const handleLoginExitoso = (respuesta) => {
      // Guardar la autenticación en el composable
      autenticar(respuesta)
      
      // Redirigir a reportes
      router.push('/reportes')
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