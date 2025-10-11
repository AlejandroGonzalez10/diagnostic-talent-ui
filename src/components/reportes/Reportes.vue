<template>
  <div class="reportes-container">
    <ReportesHeader 
      @cerrar-sesion="cerrarSesion" 
    />
    
    <main class="reportes-main">
      <div class="reportes-content">
        <section class="datos-section">
          <DatosGrid />
        </section>
      </div>
    </main>
  </div>
</template>

<script>
import { useRouter } from 'vue-router'
import { useCuestionario } from '@/composables/useCuestionario'
import ReportesHeader from './components/ReportesHeader.vue'
import DatosGrid from './components/DatosGrid.vue'

export default {
  name: 'ReportesMain',
  components: {
    ReportesHeader,
    DatosGrid
  },
  setup() {
    const router = useRouter()
    const { cerrarSesion: cerrarSesionComposable } = useCuestionario()

    const cerrarSesion = () => {
      cerrarSesionComposable()
      router.push('/login')
    }

    return {
      cerrarSesion
    }
  }
}
</script>

<style scoped>
.reportes-container {
  min-height: 100vh;
  background: linear-gradient(to bottom, #f8f9fa 0%, #e9ecef 100%);
  margin: 0;
  padding: 0;
}

.reportes-main {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem 1rem 2rem 1rem;
}

.reportes-content {
  display: flex;
  flex-direction: column;
}

.datos-section {
  background: white;
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.section-header {
  text-align: center;
  margin-bottom: 3rem;
}

.section-header h2 {
  color: #2c3e50;
  margin: 0 0 1rem 0;
  font-size: 2.2rem;
  font-weight: 700;
}

.section-description {
  color: #666;
  margin: 0;
  font-size: 1.1rem;
  line-height: 1.6;
  max-width: 600px;
  margin: 0 auto;
}

/* Responsive */
@media (max-width: 768px) {
  .reportes-main {
    padding: 1rem;
  }
  
  .datos-section {
    padding: 1.5rem;
    border-radius: 16px;
  }
  
  .section-header h2 {
    font-size: 1.8rem;
  }
  
  .section-description {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .reportes-main {
    padding: 0.5rem;
  }
  
  .datos-section {
    padding: 1rem;
  }
  
  .section-header {
    margin-bottom: 2rem;
  }
  
  .section-header h2 {
    font-size: 1.6rem;
  }
}
</style>