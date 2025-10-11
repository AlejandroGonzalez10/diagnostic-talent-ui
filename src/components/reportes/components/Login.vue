<template>
  <section class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h2 class="login-titulo">Iniciar Sesión</h2>
        <p class="login-descripcion">Ingresa tus credenciales para acceder</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="email" class="form-label">Email</label>
          <input
            type="email"
            id="email"
            v-model="formData.email"
            :class="['form-input', { 'error': errores.email }]"
            placeholder="Ingresa tu email"
            required
          />
          <p v-if="errores.email" class="error-mensaje">{{ errores.email }}</p>
        </div>

        <div class="form-group">
          <label for="password" class="form-label">Contraseña</label>
          <div class="password-container">
            <input
              :type="mostrarPassword ? 'text' : 'password'"
              id="password"
              v-model="formData.password"
              :class="['form-input', { 'error': errores.password }]"
              placeholder="Ingresa tu contraseña"
              required
            />
            <button
              type="button"
              @click="togglePassword"
              class="password-toggle"
              :title="mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
            >
              {{ mostrarPassword ? '👁️' : '👁️‍🗨️' }}
            </button>
          </div>
          <p v-if="errores.password" class="error-mensaje">{{ errores.password }}</p>
        </div>

        <div class="form-actions">
          <button
            type="submit"
            :disabled="enviandoDatos"
            class="btn-login"
          >
            <span v-if="enviandoDatos" class="loading-spinner"></span>
            {{ enviandoDatos ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
          </button>
        </div>

        <div v-if="errorGeneral" class="error-general">
          <p>{{ errorGeneral }}</p>
        </div>
      </form>
    </div>
  </section>
</template>

<script>
import { ref } from 'vue'
import { authApi } from '@/services/api'

export default {
  name: 'LoginForm',
  emits: ['login-exitoso'],
  setup(props, { emit }) {
    const formData = ref({
      email: '',
      password: ''
    })

    const errores = ref({
      email: '',
      password: ''
    })

    const enviandoDatos = ref(false)
    const errorGeneral = ref('')
    const mostrarPassword = ref(false)

    const validarFormulario = () => {
      let valido = true
      
      // Limpiar errores previos
      errores.value = {
        email: '',
        password: ''
      }

      // Validar email
      if (!formData.value.email.trim()) {
        errores.value.email = 'El email es requerido'
        valido = false
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.value.email)) {
        errores.value.email = 'El email no tiene un formato válido'
        valido = false
      }

      // Validar contraseña
      if (!formData.value.password) {
        errores.value.password = 'La contraseña es requerida'
        valido = false
      } else if (formData.value.password.length < 4) {
        errores.value.password = 'La contraseña debe tener al menos 4 caracteres'
        valido = false
      }

      return valido
    }

    const handleLogin = async () => {
      errorGeneral.value = ''

      if (!validarFormulario()) {
        return
      }

      try {
        enviandoDatos.value = true

        // Llamada real a la API de autenticación
        const respuesta = await authApi.login({
          email: formData.value.email.trim(),
          password: formData.value.password
        })

        // Login exitoso - la respuesta debe contener token y usuario
        if (respuesta.token && (respuesta.adminUser || respuesta.user)) {
          console.log('✅ Login exitoso:', respuesta)
          emit('login-exitoso', respuesta)
        } else {
          console.error('❌ Respuesta inválida:', respuesta)
          errorGeneral.value = 'Respuesta inválida del servidor'
        }

      } catch (error) {
        console.error('Error en login:', error)
        errorGeneral.value = error.message || 'Error de conexión. Intenta nuevamente.'
      } finally {
        enviandoDatos.value = false
      }
    }

    const togglePassword = () => {
      mostrarPassword.value = !mostrarPassword.value
    }

    return {
      formData,
      errores,
      enviandoDatos,
      errorGeneral,
      mostrarPassword,
      handleLogin,
      togglePassword
    }
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  margin: 0;
  padding: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  padding: 2rem;
  width: 100%;
  max-width: 400px;
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-titulo {
  font-size: 1.8rem;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
  font-weight: 600;
}

.login-descripcion {
  color: #666;
  margin: 0;
  font-size: 0.95rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-weight: 500;
  color: #2c3e50;
  font-size: 0.95rem;
}

.form-input {
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: #0067b1;
  box-shadow: 0 0 0 3px rgba(0, 103, 177, 0.1);
}

.form-input.error {
  border-color: #dc3545;
  box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1);
}

.password-container {
  position: relative;
  display: flex;
  align-items: center;
}

.password-toggle {
  position: absolute;
  right: 0.75rem;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  font-size: 1.2rem;
  color: #666;
  transition: color 0.3s ease;
}

.password-toggle:hover {
  color: #0067b1;
}

.form-actions {
  margin-top: 1rem;
}

.btn-login {
  width: 100%;
  padding: 0.875rem;
  background: #0067b1;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-login:hover:not(:disabled) {
  background: #005a9e;
  transform: translateY(-1px);
}

.btn-login:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-mensaje {
  color: #dc3545;
  font-size: 0.875rem;
  margin: 0;
}

.error-general {
  background: #f8d7da;
  color: #721c24;
  padding: 0.75rem;
  border-radius: 6px;
  border: 1px solid #f5c6cb;
  text-align: center;
}

.error-general p {
  margin: 0;
  font-size: 0.9rem;
}

/* Responsive */
@media (max-width: 480px) {
  .login-container {
    padding: 0.5rem;
  }
  
  .login-card {
    padding: 1.5rem;
  }
  
  .login-titulo {
    font-size: 1.5rem;
  }
}
</style>