const API_CONFIG = {
  baseURL: process.env.NODE_ENV === 'development' ? '/api' : (process.env.VUE_APP_API_URL || 'http://localhost:3000'),
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

    // Obtener token del localStorage
    const token = localStorage.getItem('authToken')
    const authHeaders = token ? { 'Authorization': `Bearer ${token}` } : {}

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
        console.error('🌐 HTTP: Error del servidor:', errorText)
        throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`)
      }

      return await response.json()
    } catch (error) {
      clearTimeout(timeoutId)
      if (error.name === 'AbortError') {
        throw new Error('Request timeout')
      }
      console.error('🌐 HTTP: Error en request:', error)
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
  CATEGORIES: '/quiestionaire/categories',
  QUESTIONS: '/quiestionaire/questions',
  OPTIONS: '/quiestionaire/options',
  QUESTIONNAIRE: '/quiestionaire',
  QUESTIONNAIRE_ANSWER: '/quiestionaire/answer'
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
  async submit(data) {
    try {
      return await httpClient.post(ENDPOINTS.QUESTIONNAIRE, data)
    } catch (error) {
      console.error('🌐 API: Error en submit:', error)
      throw new Error('No se pudieron enviar los datos generales')
    }
  },

  async update(data) {
    try {
      return await httpClient.put(ENDPOINTS.QUESTIONNAIRE, data)
    } catch (error) {
      console.error('🌐 API: Error en update:', error)
      throw new Error('No se pudieron actualizar los datos generales')
    }
  },

  async submitAnswer(data) {
    try {
      return await httpClient.post(ENDPOINTS.QUESTIONNAIRE_ANSWER, data)
    } catch (error) {
      console.error('🌐 API: Error en submitAnswer:', error)
      throw new Error('No se pudo enviar la respuesta')
    }
  },

  async updateAnswer(data) {
    try {
      return await httpClient.put(ENDPOINTS.QUESTIONNAIRE_ANSWER, data)
    } catch (error) {
      console.error('🌐 API: Error en updateAnswer:', error)
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
      console.error('🔐 AUTH: Error en autenticación:', error)
      throw new Error('Código de acceso inválido')
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