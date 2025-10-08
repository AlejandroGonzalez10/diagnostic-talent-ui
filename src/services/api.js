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

    try {
      const response = await fetch(`${this.baseURL}${url}`, {
        ...options,
        headers: {
          ...this.headers,
          ...options.headers
        },
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
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
  CATEGORIES: '/quiestionaire/categories',
  QUESTIONS: '/quiestionaire/questions',
  OPTIONS: '/quiestionaire/options',
  RESPONSES: '/quiestionaire/responses'
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

export const responsesApi = {
  async submit(data) {
    try {
      return await httpClient.post(ENDPOINTS.RESPONSES, data)
    } catch (error) {
      throw new Error('No se pudieron enviar las respuestas')
    }
  }
}

export const cuestionarioApi = {
  async obtenerCategorias() {
    return categoriesApi.getAll()
  },

  async obtenerPreguntas() {
    return questionsApi.getAll()
  },

  async obtenerOpciones() {
    return optionsApi.getAll()
  },

  async enviarRespuestas(data) {
    return responsesApi.submit(data)
  }
}