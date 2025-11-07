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
@import url("https://fonts.googleapis.com/css2?family=Source+Sans+Pro:ital,wght@0,200;0,300;0,400;0,600;0,700;0,900;1,200;1,300;1,400;1,600;1,700;1,900&display=swap");* {
    -webkit-tap-highlight-color: transparent
}

body,html {
    font-family: Source Sans Pro,sans-serif;
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
