<template>
  <!-- Filtros de búsqueda -->
  <div class="filtros-container">
      <div class="filtros-grid">
        <div class="filtro-item">
          <label for="buscar-empresa">Nombre de la empresa:</label>
          <input
            id="buscar-empresa"
            type="text"
            v-model="filtros.empresa"
            placeholder="Buscar por empresa..."
            class="filtro-input"
          />
        </div>
        
        <div class="filtro-item">
          <label for="buscar-sector">Sector:</label>
          <input
            id="buscar-sector"
            type="text"
            v-model="filtros.sector"
            placeholder="Buscar por sector..."
            class="filtro-input"
          />
        </div>
        
        <div class="filtro-acciones">
          <button @click="limpiarFiltros" class="btn-limpiar">
            Limpiar
          </button>
        </div>
      </div>
    </div>

    <!-- Información de resultados -->
    <div class="resultados-info">
      <p>
        Mostrando {{ datosFiltrados.length }} registros de {{ totalItems }} totales
      </p>
    </div>

    <!-- Tabla de datos -->
    <div class="tabla-container">
      <div v-if="cargando" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Cargando datos...</p>
      </div>
      
      <div v-else-if="error" class="error-state">
        <p class="error-mensaje">{{ error }}</p>
        <button @click="cargarDatos" class="btn-reintentar">Reintentar</button>
      </div>
      
      <div v-else-if="datosFiltrados.length === 0" class="empty-state">
        <p>No se encontraron registros con los filtros aplicados.</p>
      </div>
      
      <table v-else class="datos-tabla">
        <thead>
          <tr>
            <th @click="ordenarPor('empresa')" class="sortable">
              Nombre empresa
              <span class="sort-icon" v-if="ordenActual === 'empresa'">
                {{ direccionOrden === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th @click="ordenarPor('nit')" class="sortable">
              NIT
              <span class="sort-icon" v-if="ordenActual === 'nit'">
                {{ direccionOrden === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th @click="ordenarPor('sector')" class="sortable">
              Sector
              <span class="sort-icon" v-if="ordenActual === 'sector'">
                {{ direccionOrden === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th @click="ordenarPor('empleados')" class="sortable">
              Número de empleados
              <span class="sort-icon" v-if="ordenActual === 'empleados'">
                {{ direccionOrden === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th @click="ordenarPor('contacto')" class="sortable">
              Nombre quien diligenció
              <span class="sort-icon" v-if="ordenActual === 'contacto'">
                {{ direccionOrden === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th @click="ordenarPor('cargo')" class="sortable">
              Cargo
              <span class="sort-icon" v-if="ordenActual === 'cargo'">
                {{ direccionOrden === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th @click="ordenarPor('email')" class="sortable">
              Correo electrónico
              <span class="sort-icon" v-if="ordenActual === 'email'">
                {{ direccionOrden === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th @click="ordenarPor('fecha')" class="sortable">
              Fecha Registro
              <span class="sort-icon" v-if="ordenActual === 'fecha'">
                {{ direccionOrden === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="registro in datosFiltrados" :key="registro.id" class="fila-datos">
            <td class="empresa-cell">{{ registro.empresa }}</td>
            <td>{{ registro.nit }}</td>
            <td>{{ registro.sector }}</td>
            <td>{{ registro.empleados }}</td>
            <td class="contacto-cell">{{ registro.contacto }}</td>
            <td>{{ registro.cargo }}</td>
            <td>{{ registro.email }}</td>
            <td>{{ formatearFecha(registro.fecha) }}</td>
            <td class="acciones-cell">
              <button 
                @click="descargarPDF(registro)" 
                class="btn-pdf"
                :disabled="descargando === registro.id"
                :title="'Descargar PDF de ' + registro.empresa"
              >
                <span v-if="descargando === registro.id" class="loading-mini"></span>
                <span v-else>📄</span>
                PDF
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Paginación -->
    <div v-if="!cargando && !error && totalItems > 0" class="paginacion-container">
      <div class="paginacion">
        <button 
          @click="cambiarPagina(1)" 
          :disabled="currentPage === 1"
          class="btn-pagina"
          title="Primera página"
        >
          ««
        </button>
        
        <button 
          @click="cambiarPagina(currentPage - 1)" 
          :disabled="currentPage === 1"
          class="btn-pagina"
          title="Página anterior"
        >
          «
        </button>
        
        <div class="paginas-numeros">
          <button
            v-for="pagina in paginasVisibles"
            :key="pagina"
            @click="cambiarPagina(pagina)"
            :class="['btn-pagina', { 'activa': pagina === currentPage }]"
          >
            {{ pagina }}
          </button>
        </div>
        
        <button 
          @click="cambiarPagina(currentPage + 1)" 
          :disabled="currentPage === totalPages"
          class="btn-pagina"
          title="Página siguiente"
        >
          »
        </button>
        
        <button 
          @click="cambiarPagina(totalPages)" 
          :disabled="currentPage === totalPages"
          class="btn-pagina"
          title="Última página"
        >
          »»
        </button>
      </div>
      
      <div class="info-paginacion">
        <span>Página {{ currentPage }} de {{ totalPages }}</span>
        <select v-model="pageSize" @change="cambiarTamanoPagina" class="select-tamano">
          <option :value="10">10 por página</option>
          <option :value="25">25 por página</option>
          <option :value="50">50 por página</option>
          <option :value="100">100 por página</option>
        </select>
      </div>
    </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { reportesApi } from '@/services/api'

export default {
  name: 'DatosGrid',
  setup() {
    // Estados reactivos
    const cargando = ref(false)
    const error = ref('')
    const descargando = ref(null)
    const datosRegistros = ref([])
    
    // Paginación
    const currentPage = ref(1)
    const pageSize = ref(10)
    const totalItems = ref(0)
    const totalPages = ref(0)
    
    // Filtros
    const filtros = ref({
      empresa: '',
      sector: ''
    })
    
    // Ordenamiento
    const ordenActual = ref('fecha')
    const direccionOrden = ref('desc')

    // Función para cargar datos desde el API
    const cargarDatos = async () => {
      cargando.value = true
      error.value = ''
      
      try {
        const response = await reportesApi.obtenerReportes(currentPage.value, pageSize.value)
        
        // Mapear los datos del API a la estructura esperada por la grid
        datosRegistros.value = response.data.map(item => ({
          id: item.id,
          empresa: item.company || '',
          nit: item.nit || '',
          sector: item.sector || '',
          empleados: item.employees_number || 0,
          contacto: item.chief_name || '',
          cargo: item.company_role || '',
          email: item.chief_email || '',
          fecha: item.created_at ? new Date(item.created_at) : new Date(),
          userId: item.user_id
        }))
        
        // Actualizar información de paginación
        totalItems.value = response.totalItems
        totalPages.value = response.totalPages
        currentPage.value = response.currentPage
        
      } catch (err) {
        error.value = 'Error al cargar los datos. Intenta nuevamente.'
        console.error('Error cargando datos:', err)
      } finally {
        cargando.value = false
      }
    }

    // Datos filtrados
    const datosFiltrados = computed(() => {
      let datos = [...datosRegistros.value]
      
      // Aplicar filtros
      if (filtros.value.empresa) {
        datos = datos.filter(registro => 
          registro.empresa.toLowerCase().includes(filtros.value.empresa.toLowerCase())
        )
      }
      
      if (filtros.value.sector) {
        datos = datos.filter(registro => 
          registro.sector.toLowerCase().includes(filtros.value.sector.toLowerCase())
        )
      }
      
      // Aplicar ordenamiento
      datos.sort((a, b) => {
        let valorA = a[ordenActual.value]
        let valorB = b[ordenActual.value]
        
        if (typeof valorA === 'string') {
          valorA = valorA.toLowerCase()
          valorB = valorB.toLowerCase()
        }
        
        if (direccionOrden.value === 'asc') {
          return valorA > valorB ? 1 : valorA < valorB ? -1 : 0
        } else {
          return valorA < valorB ? 1 : valorA > valorB ? -1 : 0
        }
      })
      
      return datos
    })

    // Funciones
    const limpiarFiltros = () => {
      filtros.value = {
        empresa: '',
        sector: '',
        empleados: ''
      }
    }

    const ordenarPor = (campo) => {
      if (ordenActual.value === campo) {
        direccionOrden.value = direccionOrden.value === 'asc' ? 'desc' : 'asc'
      } else {
        ordenActual.value = campo
        direccionOrden.value = 'asc'
      }
    }

    const formatearFecha = (fecha) => {
      return fecha.toLocaleDateString('es-CO', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
    }

    const descargarPDF = async (registro) => {
      descargando.value = registro.id
      
      try {
        // Simular descarga de PDF - aquí se haría la llamada real a la API
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // Aquí se implementaría la descarga real del PDF
        
        // Simulación de descarga
        const blob = new Blob(['PDF content for ' + registro.empresa], { type: 'application/pdf' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `reporte_${registro.empresa.replace(/\s+/g, '_')}_${registro.id}.pdf`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        
      } catch (err) {
        console.error('Error descargando PDF:', err)
        alert('Error al descargar el PDF. Intenta nuevamente.')
      } finally {
        descargando.value = null
      }
    }

    // Páginas visibles para la paginación
    const paginasVisibles = computed(() => {
      const paginas = []
      const rango = 2 // Mostrar 2 páginas antes y después de la actual
      
      let inicio = Math.max(1, currentPage.value - rango)
      let fin = Math.min(totalPages.value, currentPage.value + rango)
      
      // Ajustar para mostrar siempre 5 páginas cuando sea posible
      if (fin - inicio < 4) {
        if (inicio === 1) {
          fin = Math.min(totalPages.value, inicio + 4)
        } else if (fin === totalPages.value) {
          inicio = Math.max(1, fin - 4)
        }
      }
      
      for (let i = inicio; i <= fin; i++) {
        paginas.push(i)
      }
      
      return paginas
    })

    // Función para cambiar de página
    const cambiarPagina = (nuevaPagina) => {
      if (nuevaPagina >= 1 && nuevaPagina <= totalPages.value && nuevaPagina !== currentPage.value) {
        currentPage.value = nuevaPagina
        cargarDatos()
        // Scroll hacia arriba al cambiar de página
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }

    // Función para cambiar el tamaño de página
    const cambiarTamanoPagina = () => {
      currentPage.value = 1 // Volver a la primera página
      cargarDatos()
    }

    // Cargar datos al montar el componente
    onMounted(() => {
      cargarDatos()
    })

    return {
      cargando,
      error,
      descargando,
      datosRegistros,
      filtros,
      ordenActual,
      direccionOrden,
      datosFiltrados,
      currentPage,
      pageSize,
      totalItems,
      totalPages,
      paginasVisibles,
      limpiarFiltros,
      ordenarPor,
      formatearFecha,
      descargarPDF,
      cargarDatos,
      cambiarPagina,
      cambiarTamanoPagina
    }
  }
}
</script>

<style scoped>
.filtros-container {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.filtros-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  align-items: end;
}

.filtro-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filtro-item label {
  font-weight: 500;
  color: #2c3e50;
  font-size: 0.9rem;
}

.filtro-input {
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: border-color 0.3s ease;
}

.filtro-input:focus {
  outline: none;
  border-color: #0067b1;
  box-shadow: 0 0 0 3px rgba(0, 103, 177, 0.1);
}

.filtro-acciones {
  display: flex;
  align-items: end;
}

.btn-limpiar {
  background: #0067b1;
  color: white;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.3s ease;
}

.btn-limpiar:hover {
  background: #005694;
}

.resultados-info {
  margin-bottom: 1rem;
}

.resultados-info p {
  color: #666;
  margin: 0;
  font-size: 0.9rem;
}

.tabla-container {
  overflow-x: auto;
  padding: 0;
  margin: 0;
}

.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 2rem 0;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #0067b1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-mensaje {
  color: #dc3545;
  margin-bottom: 1rem;
}

.btn-reintentar {
  background: #0067b1;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
}

.datos-tabla {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.datos-tabla th {
  background: #0067b1;
  color: white;
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  position: sticky;
  top: 0;
  z-index: 10;
}

.datos-tabla th.sortable {
  cursor: pointer;
  user-select: none;
  transition: background-color 0.3s ease;
}

.datos-tabla th.sortable:hover {
  background: #005a9e;
}

.sort-icon {
  margin-left: 0.5rem;
  font-size: 0.9rem;
}

.datos-tabla td {
  padding: 1rem;
  border-bottom: 1px solid #e9ecef;
  vertical-align: middle;
}

.fila-datos:hover {
  background: #f8f9fa;
}

.empresa-cell {
  font-weight: 500;
}

.contacto-cell {
  font-weight: 500;
}

.acciones-cell {
  text-align: center;
}

.btn-pdf {
  background: #dc3545;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background-color 0.3s ease;
}

.btn-pdf:hover:not(:disabled) {
  background: #c82333;
}

.btn-pdf:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.loading-mini {
  width: 12px;
  height: 12px;
  border: 2px solid transparent;
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* Paginación */
.paginacion-container {
  margin-top: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.paginacion {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.paginas-numeros {
  display: flex;
  gap: 0.25rem;
}

.btn-pagina {
  min-width: 40px;
  height: 40px;
  padding: 0.5rem 0.75rem;
  border: 1px solid #dee2e6;
  background: white;
  color: #495057;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-pagina:hover:not(:disabled) {
  background: #0067b1;
  color: white;
  border-color: #0067b1;
}

.btn-pagina:disabled {
  background: #f8f9fa;
  color: #adb5bd;
  cursor: not-allowed;
  border-color: #dee2e6;
}

.btn-pagina.activa {
  background: #0067b1;
  color: white;
  border-color: #0067b1;
  font-weight: 600;
}

.info-paginacion {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: #666;
  font-size: 0.9rem;
}

.select-tamano {
  padding: 0.5rem 0.75rem;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  background: white;
  color: #495057;
  cursor: pointer;
  font-size: 0.9rem;
  transition: border-color 0.3s ease;
}

.select-tamano:focus {
  outline: none;
  border-color: #0067b1;
  box-shadow: 0 0 0 3px rgba(0, 103, 177, 0.1);
}

/* Responsive */
@media (max-width: 768px) {
  .datos-grid-container {
    padding: 1rem;
  }
  
  .filtros-grid {
    grid-template-columns: 1fr;
  }
  
  .datos-tabla {
    font-size: 0.85rem;
  }
  
  .datos-tabla th,
  .datos-tabla td {
    padding: 0.75rem 0.5rem;
  }
  
  .paginacion-container {
    flex-direction: column;
    align-items: stretch;
  }
  
  .paginacion {
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .info-paginacion {
    flex-direction: column;
    text-align: center;
  }
}
</style>