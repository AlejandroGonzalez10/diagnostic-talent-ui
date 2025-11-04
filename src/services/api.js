const API_CONFIG = {
  baseURL: process.env.NODE_ENV === 'development' ? '/api' : (process.env.VUE_APP_API_URL || '/api'),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
}

class HttpClient {
  constructor(config) {
    this.baseURL = config.baseURL
    this.timeout = config.timeout
    this.headers = config.headers
  }

  async request(url, options = {}) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    // Obtener tokens del localStorage y verificar su validez
    const reportToken = localStorage.getItem('reportToken')
    const reportTokenTimestamp = localStorage.getItem('reportTokenTimestamp')
    const cuestionarioToken = localStorage.getItem('authToken')
    const cuestionarioTokenTimestamp = localStorage.getItem('authTokenTimestamp')
    
    let authHeaders = {}
    
    // Verificar token de reportes (20 horas) - tiene prioridad
    if (reportToken && reportTokenTimestamp) {
      const tiempoActual = Date.now()
      const tiempoGuardado = parseInt(reportTokenTimestamp)
      const veinteHorasEnMs = 20 * 60 * 60 * 1000 // 20 horas en milisegundos
      
      if (tiempoActual - tiempoGuardado < veinteHorasEnMs) {
        // Token de reportes aún válido
        authHeaders = { 'Authorization': `Bearer ${reportToken}` }
      } else {
        // Token de reportes expirado, limpiar datos y redirigir
        localStorage.removeItem('reportToken')
        localStorage.removeItem('reportUser')
        localStorage.removeItem('reportTokenTimestamp')
        // Redirigir específicamente al login
        window.location.href = '/login'
        return
      }
    }
    // Si no hay token de reportes, verificar token de cuestionario (2 horas)
    else if (cuestionarioToken && cuestionarioTokenTimestamp) {
      const tiempoActual = Date.now()
      const tiempoGuardado = parseInt(cuestionarioTokenTimestamp)
      const dosHorasEnMs = 2 * 60 * 60 * 1000 // 2 horas en milisegundos
      
      if (tiempoActual - tiempoGuardado < dosHorasEnMs) {
        // Token de cuestionario aún válido
        authHeaders = { 'Authorization': `Bearer ${cuestionarioToken}` }
      } else {
        // Token de cuestionario expirado, limpiar datos
        localStorage.removeItem('authToken')
        localStorage.removeItem('authUser')
        localStorage.removeItem('authTokenTimestamp')
        // Para cuestionario, solo recargar la página
        window.location.reload()
        return
      }
    }

    try {
      const response = await fetch(`${this.baseURL}${url}`, {
        ...options,
        headers: {
          ...this.headers,
          ...authHeaders,
          ...options.headers
        },
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorText = await response.text()
        
        // Si es error 403 y menciona token, limpiar autenticación y redirigir al login
        if (response.status === 403 && errorText.includes('token')) {
          
          // Limpiar ambos tipos de tokens por seguridad
          localStorage.removeItem('reportToken')
          localStorage.removeItem('reportUser')
          localStorage.removeItem('reportTokenTimestamp')
          localStorage.removeItem('authToken')
          localStorage.removeItem('authUser')
          localStorage.removeItem('authTokenTimestamp')
          localStorage.removeItem('generalDataId')
          
          // Redirigir al login
          window.location.href = '/login'
          return
        }
        
        throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`)
      }

      return await response.json()
    } catch (error) {
      clearTimeout(timeoutId)
      if (error.name === 'AbortError') {
        throw new Error('Request timeout')
      }
      throw error
    }
  }

  get(url, options = {}) {
    return this.request(url, { ...options, method: 'GET' })
  }

  post(url, data = {}, options = {}) {
    return this.request(url, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  put(url, data = {}, options = {}) {
    return this.request(url, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  delete(url, options = {}) {
    return this.request(url, { ...options, method: 'DELETE' })
  }
}

const httpClient = new HttpClient(API_CONFIG)

const ENDPOINTS = {
  AUTH: '/users/auth',
  LOGIN: '/users/admin/auth',
  CATEGORIES: '/quiestionaire/categories',
  QUESTIONS: '/quiestionaire/questions',
  OPTIONS: '/quiestionaire/options',
  QUESTIONNAIRE: '/quiestionaire',
  QUESTIONNAIRE_ANSWER: '/quiestionaire/answer',
  QUESTIONNAIRE_REPORT: '/quiestionaire/report'
}

export const categoriesApi = {
  async getAll() {
    try {
      return await httpClient.get(ENDPOINTS.CATEGORIES)
    } catch (error) {
      throw new Error('No se pudieron cargar las categorías')
    }
  }
}

export const questionsApi = {
  async getAll() {
    try {
      return await httpClient.get(ENDPOINTS.QUESTIONS)
    } catch (error) {
      throw new Error('No se pudieron cargar las preguntas')
    }
  },

  async getByCategory(categoryId) {
    try {
      return await httpClient.get(`${ENDPOINTS.QUESTIONS}?categoryId=${categoryId}`)
    } catch (error) {
      throw new Error('No se pudieron cargar las preguntas de la categoría')
    }
  }
}

export const optionsApi = {
  async getAll() {
    try {
      return await httpClient.get(ENDPOINTS.OPTIONS)
    } catch (error) {
      throw new Error('No se pudieron cargar las opciones de respuesta')
    }
  }
}

export const questionnaireApi = {
  async get() {
    try {
      return await httpClient.get(ENDPOINTS.QUESTIONNAIRE)
    } catch (error) {
      throw new Error('No se pudieron obtener los datos generales')
    }
  },

  async submit(data) {
    try {
      return await httpClient.post(ENDPOINTS.QUESTIONNAIRE, data)
    } catch (error) {
      throw new Error('No se pudieron enviar los datos generales')
    }
  },

  async update(data) {
    try {
      return await httpClient.put(ENDPOINTS.QUESTIONNAIRE, data)
    } catch (error) {
      throw new Error('No se pudieron actualizar los datos generales')
    }
  },

  async getAnswers(generalDataId) {
    try {
      return await httpClient.get(`${ENDPOINTS.QUESTIONNAIRE_ANSWER}/${generalDataId}`)
    } catch (error) {
      throw new Error('No se pudieron obtener las respuestas')
    }
  },

  async submitAnswer(data) {
    try {
      return await httpClient.post(ENDPOINTS.QUESTIONNAIRE_ANSWER, data)
    } catch (error) {
      throw new Error('No se pudo enviar la respuesta')
    }
  },

  async updateAnswer(data) {
    try {
      // El ID va en el body, no en la URL
      return await httpClient.put(ENDPOINTS.QUESTIONNAIRE_ANSWER, data)
    } catch (error) {
      throw new Error('No se pudo actualizar la respuesta')
    }
  }
}

export const authApi = {
  async authenticate(code) {
    try {
      const response = await httpClient.post(ENDPOINTS.AUTH, { code })
      return response
    } catch (error) {
      throw new Error('Código de acceso inválido')
    }
  },

  async login(credentials) {
    try {
      const response = await httpClient.post(ENDPOINTS.LOGIN, {
        email: credentials.email,
        password: credentials.password
      })
      return response
    } catch (error) {
      // Manejar diferentes tipos de errores
      if (error.message && error.message.includes('401')) {
        throw new Error('Email o contraseña incorrectos')
      } else if (error.message && error.message.includes('403')) {
        throw new Error('Acceso denegado')
      } else {
        throw new Error('Error de conexión. Intenta nuevamente.')
      }
    }
  }
}

export const reportesApi = {
  async obtenerReportes(page = 1, pageSize = 10) {
    try {
      return await httpClient.get(`${ENDPOINTS.QUESTIONNAIRE_REPORT}?page=${page}&pageSize=${pageSize}`)
    } catch (error) {
      throw new Error('No se pudieron cargar los reportes')
    }
  }
}

export const cuestionarioApi = {
  async autenticar(codigo) {
    return authApi.authenticate(codigo)
  },

  async obtenerCategorias() {
    return categoriesApi.getAll()
  },

  async obtenerPreguntas() {
    return questionsApi.getAll()
  },

  async obtenerOpciones() {
    return optionsApi.getAll()
  },

  async obtenerDatosGenerales() {
    return questionnaireApi.get()
  },

  async obtenerRespuestas(generalDataId) {
    return questionnaireApi.getAnswers(generalDataId)
  },

  async enviarDatosGenerales(data) {
    return questionnaireApi.submit(data)
  },

  async actualizarDatosGenerales(data) {
    return questionnaireApi.update(data)
  },

  async enviarRespuesta(data) {
    return questionnaireApi.submitAnswer(data)
  },

  async actualizarRespuesta(data) {
    return questionnaireApi.updateAnswer(data)
  },

  async crearRegistroInicial() {
    // Envía datos vacíos para crear el registro inicial y obtener el ID
    return questionnaireApi.submit({})
  }
}