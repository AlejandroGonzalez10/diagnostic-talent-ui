<template>
  <div class="quick-nav-container">
    <h3 class="nav-title">Acciones Rápidas</h3>
    <div class="nav-grid">
      <router-link to="/cuestionario" class="nav-item">
        <div class="nav-card">
          <span class="nav-icon">📝</span>
          <div class="nav-content">
            <span class="nav-label">Ir al Cuestionario</span>
            <span class="nav-description">Acceder al formulario principal</span>
          </div>
        </div>
      </router-link>

      <button @click="descargarReporte" class="nav-item nav-button" disabled>
        <div class="nav-card">
          <span class="nav-icon">📥</span>
          <div class="nav-content">
            <span class="nav-label">Descargar Reporte</span>
            <span class="nav-description">Exportar datos actuales</span>
          </div>
        </div>
      </button>

      <button @click="configuracion" class="nav-item nav-button" disabled>
        <div class="nav-card">
          <span class="nav-icon">⚙️</span>
          <div class="nav-content">
            <span class="nav-label">Configuración</span>
            <span class="nav-description">Ajustes del sistema</span>
          </div>
        </div>
      </button>

      <button @click="ayuda" class="nav-item nav-button" disabled>
        <div class="nav-card">
          <span class="nav-icon">❓</span>
          <div class="nav-content">
            <span class="nav-label">Ayuda</span>
            <span class="nav-description">Documentación y soporte</span>
          </div>
        </div>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ReportesQuickNav',
  setup() {
    const descargarReporte = () => {
      // Funcionalidad para descargar reporte
      console.log('Descargar reporte - Próximamente')
    }

    const configuracion = () => {
      // Funcionalidad de configuración
      console.log('Configuración - Próximamente')
    }

    const ayuda = () => {
      // Funcionalidad de ayuda
      console.log('Ayuda - Próximamente')
    }

    return {
      descargarReporte,
      configuracion,
      ayuda
    }
  }
}
</script>

<style scoped>
.quick-nav-container {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.nav-title {
  color: #2c3e50;
  margin: 0 0 1.5rem 0;
  font-size: 1.3rem;
  font-weight: 600;
}

.nav-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.nav-item {
  text-decoration: none;
  color: inherit;
  display: block;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  width: 100%;
}

.nav-button:disabled {
  cursor: not-allowed;
}

.nav-card {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  height: 100%;
}

.nav-item:not(:disabled):hover .nav-card {
  background: #e9ecef;
  transform: translateY(-2px);
  border-color: #0067b1;
  box-shadow: 0 4px 12px rgba(0, 103, 177, 0.15);
}

.nav-button:disabled .nav-card {
  background: #f1f3f4;
  opacity: 0.6;
}

.nav-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.nav-content {
  flex: 1;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.nav-label {
  font-weight: 500;
  color: #2c3e50;
  font-size: 1rem;
}

.nav-description {
  font-size: 0.875rem;
  color: #666;
  line-height: 1.4;
}

.nav-button:disabled .nav-label,
.nav-button:disabled .nav-description {
  color: #999;
}

/* Responsive */
@media (max-width: 768px) {
  .quick-nav-container {
    padding: 1.5rem;
    margin: 0 1rem;
  }
  
  .nav-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
  
  .nav-card {
    padding: 1rem;
  }
  
  .nav-icon {
    font-size: 1.5rem;
  }
}
</style>