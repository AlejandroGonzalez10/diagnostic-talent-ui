<template>
  <header class="reportes-header">
    <div class="header-content">
      <div class="header-left">
        <h1 class="app-title">
          <span class="title-icon">📊</span>
          Diagnóstico de Talento - Reportes
        </h1>
        <p class="header-subtitle">Panel de administración y análisis</p>
      </div>
      
      <div class="header-right">
        <div class="user-info">
          <div class="user-avatar">
            <span>{{ inicialUsuario }}</span>
          </div>
          <div class="user-details">
            <span class="user-name">{{ usuario?.name || 'Usuario' }}</span>
            <span class="user-role">Administrador</span>
          </div>
        </div>
        
        <div class="header-actions">
          <button @click="irAlCuestionario" class="btn-action" title="Ir al Cuestionario">
            📝
          </button>
          <button @click="cerrarSesion" class="btn-logout" title="Cerrar Sesión">
            🚪 Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'ReportesHeader',
  props: {
    usuario: {
      type: Object,
      default: () => null
    }
  },
  emits: ['cerrar-sesion'],
  setup(props, { emit }) {
    const router = useRouter()

    const inicialUsuario = computed(() => {
      if (props.usuario?.name) {
        return props.usuario.name.charAt(0).toUpperCase()
      }
      return 'U'
    })

    const cerrarSesion = () => {
      emit('cerrar-sesion')
    }

    const irAlCuestionario = () => {
      router.push('/cuestionario')
    }

    return {
      inicialUsuario,
      cerrarSesion,
      irAlCuestionario
    }
  }
}
</script>

<style scoped>
.reportes-header {
  background: linear-gradient(135deg, #0067b1 0%, #005a9e 100%);
  color: white;
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

.title-icon {
  font-size: 2rem;
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
  gap: 1.5rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.user-avatar {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.user-name {
  font-weight: 500;
  font-size: 0.95rem;
}

.user-role {
  font-size: 0.8rem;
  opacity: 0.8;
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
  background: rgba(220, 53, 69, 0.2);
  color: white;
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
  background: rgba(220, 53, 69, 0.3);
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
    flex-wrap: wrap;
  }

  .app-title {
    font-size: 1.5rem;
    justify-content: center;
  }

  .user-info {
    order: 2;
  }

  .header-actions {
    order: 1;
  }
}

@media (max-width: 480px) {
  .header-content {
    padding: 0 0.5rem;
  }
  
  .app-title {
    font-size: 1.3rem;
  }
  
  .header-actions {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .btn-logout {
    width: 100%;
    justify-content: center;
  }
}
</style>