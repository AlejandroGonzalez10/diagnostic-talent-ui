<template>
  <div class="reportes-view">
    <ReportesMain />
  </div>
</template>

<script>
import ReportesMain from '@/components/reportes/Reportes.vue'

export default {
  name: 'ReportesView',
  components: {
    ReportesMain
  }
}
</script>

<style scoped>
.reportes-view {
  min-height: 100vh;
}
</style>