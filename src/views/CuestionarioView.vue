<template>
  <div class="cuestionario-view">
    <Cuestionario />
  </div>
</template>

<script>
import Cuestionario from '@/components/cuestionario/Cuestionario.vue'

export default {
  name: 'CuestionarioView',
  components: {
    Cuestionario
  }
}
</script>

<style scoped>
.cuestionario-view {
  min-height: 100vh;
}
</style>