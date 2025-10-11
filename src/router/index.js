import { createRouter, createWebHistory } from 'vue-router'
import { useCuestionario } from '@/composables/useCuestionario'

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
      title: 'Diagnóstico de Talento - Cuestionario',
      requiresAuth: false // El cuestionario tiene su propio sistema de código de acceso
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: {
      title: 'Iniciar Sesión - Reportes',
      requiresAuth: false,
      hideForAuthenticated: true // Ocultar si ya está autenticado
    }
  },
  {
    path: '/reportes',
    name: 'Reportes',
    component: Reportes,
    meta: {
      title: 'Reportes - Diagnóstico de Talento',
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
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// Guard de navegación para proteger rutas
router.beforeEach((to, from, next) => {
  const { isAuthenticated, cargarDatosGuardados } = useCuestionario()
  
  // Cargar datos guardados antes de verificar autenticación
  cargarDatosGuardados()
  
  // Actualizar título de la página
  document.title = to.meta.title || 'Diagnóstico de Talento'
  
  // Si la ruta requiere autenticación y no está autenticado
  if (to.meta.requiresAuth && !isAuthenticated.value) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
    return
  }
  
  // Si está autenticado y trata de acceder al login, redirigir a reportes
  if (to.meta.hideForAuthenticated && isAuthenticated.value) {
    next({ name: 'Reportes' })
    return
  }
  
  next()
})

export default router