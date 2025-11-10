<template>
  <header class="reportes-header">
    <div class="header-content">
      <div class="header-left">
        <div class="logos-container">
          <img src="@/assets/img-colsubsidio.jpeg" alt="Logo Colsubsidio" class="logo-img">
          <img src="@/assets/img-linkedin.jpeg" alt="Logo LinkedIn" class="logo-img">
        </div>
      </div>
      
      <div class="header-right">
        <div class="header-actions">
          <button @click="cerrarSesionCompleta" class="btn-logout" title="Cerrar Sesión">
            🚪 Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
import { useSessionManager } from '@/composables/useSessionManager'

export default {
  name: 'ReportesHeader',
  emits: ['cerrar-sesion'],
  setup(props, { emit }) {
    const { cerrarSesionManual } = useSessionManager()
    
    const cerrarSesionCompleta = () => {
      cerrarSesionManual()
      emit('cerrar-sesion')
    }

    return {
      cerrarSesionCompleta
    }
  }
}
</script>

<style scoped>
.reportes-header {
  background: linear-gradient(135deg, #2D2D2D 0%, #2D2D2D 100%);
  color: #FFD000;
  padding: 1rem 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
}

.header-left {
  flex: 1;
}

.app-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.8rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.logos-container {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.logo-img {
  height: 40px;
  width: auto;
  object-fit: contain;
}

.header-subtitle {
  margin: 0;
  font-size: 0.95rem;
  opacity: 0.9;
  font-weight: 400;
}

.header-right {
  display: flex;
  align-items: center;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.btn-action {
  background: rgba(255, 255, 255, 0.15);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 0.625rem;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1.2rem;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-action:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-1px);
}

.btn-logout {
  background: #FFD000;
  color: #2D2D2D;
  border: 1px solid rgba(220, 53, 69, 0.3);
  padding: 0.625rem 1rem;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-logout:hover {
  background: #FFD000;
  transform: translateY(-1px);
}

/* Responsive */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .header-right {
    width: 100%;
    justify-content: center;
  }

  .app-title {
    font-size: 1.5rem;
    justify-content: center;
  }

  .logos-container {
    justify-content: center;
  }

  .logo-img {
    height: 2.5rem; /* 40px */
  }
}

@media (max-width: 480px) {
  .logo-img {
    height: 1.625rem; /* 26px */
  }
  .header-content {
    padding: 0 0.5rem;
  }
  
  .app-title {
    font-size: 1.3rem;
  }
  
  .btn-logout {
    width: 100%;
    justify-content: center;
  }
}
</style>