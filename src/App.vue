<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
import { useSessionManager } from '@/composables/useSessionManager'

export default {
  name: 'App',
  setup() {
    // Inicializar el gestor de sesión para toda la aplicación
    const sessionManager = useSessionManager()
    
    return {
      ...sessionManager
    }
  }
}
</script>

<style>
@import 'floating-vue/dist/style.css';
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap');

* {
    -webkit-tap-highlight-color: transparent;
}

/* Aplicar Inter como fuente principal */
body,
html {
    font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    margin: 0;
    min-height: 100%;
    overflow-x: hidden;
    padding: 0
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin-top: 0;
}

.logo-container {
  margin-bottom: 2rem;
}

.logo {
  width: 64px;
  height: 64px;
  object-fit: contain;
}
</style>
