import { createRouter, createWebHistory } from 'vue-router'
import { useCuestionario } from '@/composables/useCuestionario'
import { useReportes } from '@/composables/useReportes'

// Importar componentes de páginas
import Cuestionario from '@/components/cuestionario/Cuestionario.vue'
import LoginView from '@/views/Login.vue'
import Reportes from '@/views/Reportes.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    redirect: '/cuestionario'
  },
  {
    path: '/cuestionario',
    name: 'Cuestionario',
    component: Cuestionario,
    meta: {
      requiresAuth: false // El cuestionario tiene su propio sistema de código de acceso
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: {
      title: 'Iniciar Sesión',
      requiresAuth: false,
      hideForAuthenticated: true // Ocultar si ya está autenticado
    }
  },
  {
    path: '/reportes',
    name: 'Reportes',
    component: Reportes,
    meta: {
      title: 'Reporte',
      requiresAuth: true // Requiere autenticación con usuario/contraseña
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    redirect: '/cuestionario'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Guard de navegación para proteger rutas
router.beforeEach((to, from, next) => {
  const { isAuthenticated: isCuestionarioAuth, cargarDatosGuardados } = useCuestionario()
  const { isReportAuthenticated, cargarDatosReportes } = useReportes()
  
  // Cargar datos guardados antes de verificar autenticación
  cargarDatosGuardados()
  cargarDatosReportes()
  
  // Actualizar título de la página solo si existe en meta
  if (to.meta.title) {
    document.title = to.meta.title
  }
  
  // Si la ruta requiere autenticación
  if (to.meta.requiresAuth) {
    // Para reportes, verificar autenticación de reportes
    if (to.name === 'Reportes' && !isReportAuthenticated.value) {
      next({ name: 'Login', query: { redirect: to.fullPath } })
      return
    }
    // Para otras rutas que requieren auth, usar el sistema de cuestionario
    else if (to.name !== 'Reportes' && !isCuestionarioAuth.value) {
      next({ name: 'Login', query: { redirect: to.fullPath } })
      return
    }
  }
  
  // Si está autenticado y trata de acceder al login, redirigir según el tipo de auth
  if (to.meta.hideForAuthenticated) {
    if (isReportAuthenticated.value) {
      next({ name: 'Reportes' })
      return
    }
    else if (isCuestionarioAuth.value) {
      next({ name: 'Cuestionario' })
      return
    }
  }
  
  next()
})

export default router