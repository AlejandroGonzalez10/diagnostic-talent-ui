<template>
  <div id="app">
    <FormCuestionario />
  </div>
</template>

<script>
import FormCuestionario from './components/Cuestionario.vue'

export default {
  name: 'App',
  components: {
    FormCuestionario
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 20px;
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
